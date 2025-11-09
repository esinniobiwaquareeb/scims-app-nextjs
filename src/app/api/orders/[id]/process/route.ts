import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// POST /api/orders/[id]/process - Process an order (confirm and reduce stock)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { status } = await request.json();

    // Validate status
    if (!status || !['confirmed', 'processing', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be confirmed, processing, completed, or cancelled' },
        { status: 400 }
      );
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('public_order')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent multiple stores from accepting the same order
    // Only allow status changes if order is still pending, or if the status change is to cancelled
    if (order.status !== 'pending' && status !== 'cancelled' && !['cancelled'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: `This order has already been ${order.status}. Only pending orders can be processed.` },
        { status: 400 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('public_order')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // If order is being confirmed/processed/completed, reduce stock
    if (['confirmed', 'processing', 'completed'].includes(status)) {
      try {
        for (const item of order.order_items) {
          const { data: product, error: productError } = await supabase
            .from('product')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (productError) {
            console.error('Error fetching product for stock update:', productError);
            continue;
          }

          const newStock = (product.stock_quantity || 0) - item.quantity;
          
          if (newStock < 0) {
            console.warn(`Insufficient stock for product ${item.product_id}. Current: ${product.stock_quantity}, Required: ${item.quantity}`);
            // Continue with other products even if one has insufficient stock
            continue;
          }

          const { error: stockUpdateError } = await supabase
            .from('product')
            .update({ stock_quantity: newStock })
            .eq('id', item.product_id);

          if (stockUpdateError) {
            console.error('Error updating stock for product:', item.product_id, stockUpdateError);
            // Continue with other products even if one fails
          } else {
            console.log(`Stock updated for product ${item.product_id}: ${product.stock_quantity} -> ${newStock}`);
          }
        }
      } catch (stockError) {
        console.error('Error updating stock quantities:', stockError);
        // Don't fail the order processing if stock update fails
      }
    }

    // If order is being cancelled, restore stock
    if (status === 'cancelled') {
      try {
        for (const item of order.order_items) {
          const { data: product, error: productError } = await supabase
            .from('product')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (productError) {
            console.error('Error fetching product for stock restoration:', productError);
            continue;
          }

          const newStock = (product.stock_quantity || 0) + item.quantity;

          const { error: stockUpdateError } = await supabase
            .from('product')
            .update({ stock_quantity: newStock })
            .eq('id', item.product_id);

          if (stockUpdateError) {
            console.error('Error restoring stock for product:', item.product_id, stockUpdateError);
            // Continue with other products even if one fails
          } else {
            console.log(`Stock restored for product ${item.product_id}: ${product.stock_quantity} -> ${newStock}`);
          }
        }
      } catch (stockError) {
        console.error('Error restoring stock quantities:', stockError);
        // Don't fail the order processing if stock restoration fails
      }
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        business_id: order.business_id,
        store_id: order.store_id,
        activity_type: 'order_processed',
        category: 'Ecommerce',
        description: `Order ${orderId.slice(-8).toUpperCase()} status changed to ${status}`,
        metadata: {
          order_id: orderId,
          status,
          customer_name: order.customer_name,
          total_amount: order.total_amount
        }
      });

    return NextResponse.json({
      success: true,
      message: `Order ${status} successfully`,
      order: {
        id: order.id,
        status: status,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Order processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
