import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { CreateSupplyReturnData } from '@/types/supply';

// GET - Fetch supply returns
export async function GET(request: NextRequest) {
  try { 
    const { searchParams } = new URL(request.url);
    
    const storeId = searchParams.get('store_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('supply_return')
      .select(`
        *,
        supply_order:supply_order_id(
          supply_number,
          customer:customer_id(name, phone),
          store:store_id(name)
        ),
        processed_by_user:processed_by(name),
        items:supply_return_item(
          *,
          supply_order_item:supply_order_item_id(
            *,
            product:product_id(name, sku, barcode)
          )
        )
      `)
      .eq('supply_order.store_id', storeId)
      .order('return_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: supplyReturns, error } = await query;

    if (error) {
      console.error('Error fetching supply returns:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch supply returns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      supply_returns: supplyReturns || []
    });

  } catch (error) {
    console.error('Error in GET /api/supply-returns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new supply return
export async function POST(request: NextRequest) {
  try {
    const returnData: CreateSupplyReturnData = await request.json();

    // Validate required fields
    if (!returnData.supply_order_id || !returnData.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if supply order exists and is in valid state
    const { data: supplyOrder, error: orderError } = await supabase
      .from('supply_order')
      .select('id, status, total_amount')
      .eq('id', returnData.supply_order_id)
      .single();

    if (orderError || !supplyOrder) {
      return NextResponse.json(
        { success: false, error: 'Supply order not found' },
        { status: 404 }
      );
    }

    if (supplyOrder.status === 'completed' || supplyOrder.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Cannot return items from completed or cancelled supply order' },
        { status: 400 }
      );
    }

    // Check payment status - prevent returns if partial payment exists
    const { data: existingPayments, error: paymentsError } = await supabase
      .from('supply_payment')
      .select('amount_paid')
      .eq('supply_order_id', returnData.supply_order_id);

    if (paymentsError) {
      console.error('Error fetching existing payments:', paymentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment information' },
        { status: 500 }
      );
    }

    const totalPaid = existingPayments?.reduce((sum, payment) => sum + payment.amount_paid, 0) || 0;
    const remainingAmount = supplyOrder.total_amount - totalPaid;

    // Block returns if there's any payment made (partial or full)
    if (totalPaid > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot return items after payment has been made. Total paid: ${totalPaid.toFixed(2)}, Remaining: ${remainingAmount.toFixed(2)}` 
        },
        { status: 400 }
      );
    }

    // Calculate total returned amount (will be calculated properly below)
    // const totalReturnedAmount = returnData.items.reduce((sum, item) => {
    //   return sum + (item.quantity_returned * 0); // We'll calculate this properly below
    // }, 0);

    // Generate return number using JavaScript (database function has ambiguous column reference)
    const currentYear = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const finalReturnNumber = `RET-${timestamp}-${currentYear}`;

    // Create supply return
    const { data: supplyReturn, error: returnError } = await supabase
      .from('supply_return')
      .insert({
        supply_order_id: returnData.supply_order_id,
        return_number: finalReturnNumber,
        status: 'pending',
        total_returned_amount: 0, // Will be calculated after items are created
        notes: returnData.notes,
        return_date: new Date().toISOString()
      })
      .select()
      .single();

    if (returnError) {
      console.error('Error creating supply return:', returnError);
      return NextResponse.json(
        { success: false, error: 'Failed to create supply return' },
        { status: 500 }
      );
    }

    // Create supply return items and calculate total
    let calculatedTotal = 0;
    const returnItems = [];

    for (const item of returnData.items) {
      // Get the supply order item details
      const { data: supplyOrderItem, error: itemError } = await supabase
        .from('supply_order_item')
        .select('unit_price, quantity_supplied, quantity_returned, quantity_accepted')
        .eq('id', item.supply_order_item_id)
        .single();

      if (itemError || !supplyOrderItem) {
        console.error('Error fetching supply order item:', itemError);
        continue;
      }

      // Validate return quantity
      const maxReturnable = supplyOrderItem.quantity_supplied - 
                           supplyOrderItem.quantity_returned - 
                           supplyOrderItem.quantity_accepted;

      if (item.quantity_returned > maxReturnable) {
        return NextResponse.json(
          { success: false, error: `Cannot return ${item.quantity_returned} items. Maximum returnable: ${maxReturnable}` },
          { status: 400 }
        );
      }

      const itemTotal = item.quantity_returned * supplyOrderItem.unit_price;
      calculatedTotal += itemTotal;

      returnItems.push({
        supply_return_id: supplyReturn.id,
        supply_order_item_id: item.supply_order_item_id,
        quantity_returned: item.quantity_returned,
        return_reason: item.return_reason,
        condition: item.condition
      });
    }

    // Insert return items
    const { error: itemsError } = await supabase
      .from('supply_return_item')
      .insert(returnItems);

    if (itemsError) {
      console.error('Error creating supply return items:', itemsError);
      // Rollback supply return creation
      await supabase.from('supply_return').delete().eq('id', supplyReturn.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create supply return items' },
        { status: 500 }
      );
    }

    // Update supply return with calculated total
    const { data: updatedSupplyReturn, error: updateError } = await supabase
      .from('supply_return')
      .update({
        total_returned_amount: calculatedTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', supplyReturn.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating supply return total:', updateError);
    }

    // Fetch the complete supply return with related data
    const { data: completeSupplyReturn, error: fetchError } = await supabase
      .from('supply_return')
      .select(`
        *,
        supply_order:supply_order_id(
          supply_number,
          customer:customer_id(name, phone),
          store:store_id(name)
        ),
        processed_by_user:processed_by(name),
        items:supply_return_item(
          *,
          supply_order_item:supply_order_item_id(
            *,
            product:product_id(name, sku, barcode)
          )
        )
      `)
      .eq('id', supplyReturn.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete supply return:', fetchError);
    }

    return NextResponse.json({
      success: true,
      supply_return: completeSupplyReturn || updatedSupplyReturn
    });

  } catch (error) {
    console.error('Error in POST /api/supply-returns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
