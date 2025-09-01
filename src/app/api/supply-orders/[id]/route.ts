import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch specific supply order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplyOrderId } = await params;

    const { data: supplyOrder, error } = await supabase
      .from('supply_order')
      .select(`
        *,
        customer:customer_id(name, phone, email),
        cashier:cashier_id(name, username),
        store:store_id(name),
        items:supply_order_item(
          *,
          product:product_id(name, sku, barcode, price, stock_quantity, image_url)
        ),
        returns:supply_return(
          *,
          processed_by_user:processed_by(name),
          items:supply_return_item(
            *,
            supply_order_item:supply_order_item_id(
              *,
              product:product_id(name, sku, barcode)
            )
          )
        ),
        payments:supply_payment(
          *,
          processed_by_user:processed_by(name)
        )
      `)
      .eq('id', supplyOrderId)
      .single();

    if (error) {
      console.error('Error fetching supply order:', error);
      return NextResponse.json(
        { success: false, error: 'Supply order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      supply_order: supplyOrder
    });

  } catch (error) {
    console.error('Error in GET /api/supply-orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update supply order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplyOrderId } = await params;
    const updateData = await request.json();

    // Remove fields that shouldn't be updated directly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...allowedUpdates } = updateData;

    const { data: supplyOrder, error } = await supabase
      .from('supply_order')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', supplyOrderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating supply order:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update supply order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      supply_order: supplyOrder
    });

  } catch (error) {
    console.error('Error in PUT /api/supply-orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete supply order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplyOrderId } = await params;

    // Check if supply order exists and can be deleted
    const { data: supplyOrder, error: fetchError } = await supabase
      .from('supply_order')
      .select('id, status, supply_number')
      .eq('id', supplyOrderId)
      .single();

    if (fetchError) {
      console.error('Error fetching supply order:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Supply order not found' },
        { status: 404 }
      );
    }

    if (supplyOrder.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete completed supply order' },
        { status: 400 }
      );
    }

    // Start a transaction to delete all related data
    // First, get all supply order item IDs
    const { data: orderItems, error: itemsFetchError } = await supabase
      .from('supply_order_item')
      .select('id')
      .eq('supply_order_id', supplyOrderId);

    if (itemsFetchError) {
      console.error('Error fetching supply order items:', itemsFetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch supply order items' },
        { status: 500 }
      );
    }

    const orderItemIds = orderItems?.map(item => item.id) || [];

    // Delete supply return items if any exist
    if (orderItemIds.length > 0) {
      const { error: returnItemsError } = await supabase
        .from('supply_return_item')
        .delete()
        .in('supply_order_item_id', orderItemIds);

      if (returnItemsError) {
        console.error('Error deleting supply return items:', returnItemsError);
        return NextResponse.json(
          { success: false, error: 'Failed to delete related return items' },
          { status: 500 }
        );
      }
    }

    // Delete supply returns
    const { error: returnsError } = await supabase
      .from('supply_return')
      .delete()
      .eq('supply_order_id', supplyOrderId);

    if (returnsError) {
      console.error('Error deleting supply returns:', returnsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete related returns' },
        { status: 500 }
      );
    }

    // Delete supply payments
    const { error: paymentsError } = await supabase
      .from('supply_payment')
      .delete()
      .eq('supply_order_id', supplyOrderId);

    if (paymentsError) {
      console.error('Error deleting supply payments:', paymentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete related payments' },
        { status: 500 }
      );
    }

    // Delete supply order items
    const { error: itemsError } = await supabase
      .from('supply_order_item')
      .delete()
      .eq('supply_order_id', supplyOrderId);

    if (itemsError) {
      console.error('Error deleting supply order items:', itemsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete supply order items' },
        { status: 500 }
      );
    }

    // Finally, delete the supply order itself
    const { error: orderError } = await supabase
      .from('supply_order')
      .delete()
      .eq('id', supplyOrderId);

    if (orderError) {
      console.error('Error deleting supply order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete supply order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supply order deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/supply-orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
