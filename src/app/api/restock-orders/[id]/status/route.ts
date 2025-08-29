import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { status, quantityReceived } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Update the restock order status
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'received' && quantityReceived !== undefined) {
      updateData.quantity_received = quantityReceived;
      updateData.received_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from('restock_order')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating restock order status:', error);
      return NextResponse.json(
        { error: 'Failed to update restock order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error updating restock order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
