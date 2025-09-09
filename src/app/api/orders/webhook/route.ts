import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createOrderNotification } from '@/utils/notificationUtils';

// POST /api/orders/webhook - Handle order notifications from storefront
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, storeId, businessId, orderData } = body;

    if (!orderId || !storeId || !businessId || !orderData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification for the order
    await createOrderNotification(
      {
        orderId,
        customerName: orderData.customer_name || 'Unknown Customer',
        customerPhone: orderData.customer_phone || '',
        customerAddress: orderData.customer_address,
        customerEmail: orderData.customer_email,
        totalAmount: orderData.total_amount || 0,
        orderItems: orderData.order_items || [],
      },
      storeId,
      businessId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing order webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
