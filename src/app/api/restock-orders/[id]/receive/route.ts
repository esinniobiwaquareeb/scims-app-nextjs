import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { receivedItems } = body;

    if (!orderId || !receivedItems || !Array.isArray(receivedItems)) {
      return NextResponse.json(
        { error: 'Order ID and received items array are required' },
        { status: 400 }
      );
    }

    // Update the order status to received
    const { error: orderUpdateError } = await supabase
      .from('restock_order')
      .update({ 
        status: 'received'
      })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Update product stock for each received item
    for (const item of receivedItems) {
      const { product_id, received_quantity } = item;
      
      if (!product_id || !received_quantity) {
        continue;
      }

      try {
        // Get current stock
        const { data: product, error: productError } = await supabase
          .from('product')
          .select('stock_quantity')
          .eq('id', product_id)
          .single();

        if (productError) {
          console.error(`Error fetching product ${product_id}:`, productError);
          continue;
        }

        // Update stock
        const newStock = (product.stock_quantity || 0) + received_quantity;
        const { error: stockUpdateError } = await supabase
          .from('product')
          .update({ stock_quantity: newStock })
          .eq('id', product_id);

        if (stockUpdateError) {
          console.error(`Error updating stock for product ${product_id}:`, stockUpdateError);
        }
      } catch (error) {
        console.error(`Error processing product ${product_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Restock items received successfully'
    });
  } catch (error) {
    console.error('Error receiving restock items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
