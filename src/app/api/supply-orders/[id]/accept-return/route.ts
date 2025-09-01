import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// POST - Accept returned items for a supply order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplyOrderId } = await params;
    const body = await request.json();
    const { acceptedItems } = body;

    if (!supplyOrderId || !acceptedItems || !Array.isArray(acceptedItems)) {
      return NextResponse.json(
        { success: false, error: 'Supply order ID and accepted items array are required' },
        { status: 400 }
      );
    }

    // Validate that the supply order exists and can accept returns
    const { data: supplyOrder, error: orderError } = await supabase
      .from('supply_order')
      .select('id, status, supply_number')
      .eq('id', supplyOrderId)
      .single();

    if (orderError || !supplyOrder) {
      return NextResponse.json(
        { success: false, error: 'Supply order not found' },
        { status: 404 }
      );
    }

    if (!['supplied', 'partially_returned', 'fully_returned'].includes(supplyOrder.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot accept returns for this supply order status' },
        { status: 400 }
      );
    }

    // Process each accepted item
    for (const acceptedItem of acceptedItems) {
      const { supply_order_item_id, quantity_accepted } = acceptedItem;

      if (!supply_order_item_id || !quantity_accepted || quantity_accepted <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid accepted item data' },
          { status: 400 }
        );
      }

      // Get current item details
      const { data: currentItem, error: itemError } = await supabase
        .from('supply_order_item')
        .select('quantity_supplied, quantity_returned, quantity_accepted')
        .eq('id', supply_order_item_id)
        .eq('supply_order_id', supplyOrderId)
        .single();

      if (itemError || !currentItem) {
        return NextResponse.json(
          { success: false, error: `Supply order item not found: ${supply_order_item_id}` },
          { status: 404 }
        );
      }

      // Validate acceptance quantity
      const maxAcceptable = currentItem.quantity_supplied - currentItem.quantity_returned - currentItem.quantity_accepted;

      if (quantity_accepted > maxAcceptable) {
        return NextResponse.json(
          { success: false, error: `Cannot accept ${quantity_accepted} items. Maximum acceptable: ${maxAcceptable}` },
          { status: 400 }
        );
      }

      // Update the quantity_accepted
      const { error: updateError } = await supabase
        .from('supply_order_item')
        .update({
          quantity_accepted: currentItem.quantity_accepted + quantity_accepted,
          updated_at: new Date().toISOString()
        })
        .eq('id', supply_order_item_id);

      if (updateError) {
        console.error('Error updating supply order item:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update supply order item' },
          { status: 500 }
        );
      }
    }

    // Fetch the updated supply order to return
    const { data: updatedSupplyOrder, error: fetchError } = await supabase
      .from('supply_order')
      .select(`
        *,
        customer:customer_id(name, phone, email),
        cashier:cashier_id(name, username),
        store:store_id(name),
        items:supply_order_item(
          *,
          product:product_id(name, sku, barcode, price, stock_quantity, image_url)
        )
      `)
      .eq('id', supplyOrderId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated supply order:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch updated supply order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      supply_order: updatedSupplyOrder,
      message: 'Returned items accepted successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/supply-orders/[id]/accept-return:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
