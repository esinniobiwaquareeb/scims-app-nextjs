import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createOrderNotification } from '@/utils/notificationUtils';
import { randomUUID } from 'crypto';

// POST /api/orders/webhook - Handle order notifications from storefront
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, storeId, businessId, orderData } = body;

    // Validate required fields
    if (!orderId || !storeId || !businessId || !orderData) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, storeId, businessId, orderData' },
        { status: 400 }
      );
    }

    // Validate order data structure
    if (!orderData.customer_name || !orderData.total_amount) {
      return NextResponse.json(
        { error: 'Missing required order data: customer_name, total_amount' },
        { status: 400 }
      );
    }

    // Ensure orderId is a valid UUID, generate one if not
    let validOrderId = orderId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      validOrderId = randomUUID();
    }

    // First, create the order in the database (use upsert to handle duplicates)
    const { data: order, error: orderError } = await supabase
      .from('public_order')
      .upsert({
        id: validOrderId,
        business_id: businessId,
        store_id: storeId,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone || null,
        customer_email: orderData.customer_email || null,
        customer_address: orderData.customer_address || null,
        order_items: orderData.order_items || [],
        subtotal: orderData.subtotal || orderData.total_amount,
        total_amount: orderData.total_amount,
        status: 'pending',
        notes: orderData.notes || null,
        whatsapp_sent: false,
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order in database:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order in database' },
        { status: 500 }
      );
    }

    if (!order) {
      console.error('No order data returned from database');
      return NextResponse.json(
        { error: 'Failed to create order in database' },
        { status: 500 }
      );
    }

    // Create notification for the order
    await createOrderNotification(
      {
        orderId: validOrderId,
        customerName: orderData.customer_name,
        customerPhone: orderData.customer_phone || '',
        customerAddress: orderData.customer_address,
        customerEmail: orderData.customer_email,
        totalAmount: orderData.total_amount,
        orderItems: orderData.order_items || [],
      },
      storeId,
      businessId
    );


    return NextResponse.json({ 
      success: true, 
      orderId: validOrderId,
      originalOrderId: orderId,
      message: 'Order created and notification sent successfully' 
    });
  } catch (error) {
    console.error('Error processing order webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
