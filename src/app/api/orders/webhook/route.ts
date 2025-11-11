/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
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
    // Transform order_items to match the expected format
    // order_items can have different structures:
    // - From storefront: { product_id, name, price, quantity, total_price }
    // - From other sources: { product_name, quantity_ordered, unit_price, ... }
    const transformedOrderItems = (orderData.order_items || []).map((item: any) => {
      // Handle storefront format (name, price, quantity, total_price)
      if (item.name && item.price !== undefined) {
        return {
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price
        };
      }
      // Handle alternative format
      return {
        name: item.product_name || item.name || 'Unknown Product',
        quantity: item.quantity || item.quantity_ordered || 1,
        price: item.price || item.unit_price || item.total_price || 0
      };
    });

    // Create notification directly in database (more reliable than HTTP call)
    try {
      // Fetch store name for notification
      const { data: storeData } = await supabase
        .from('store')
        .select('name')
        .eq('id', storeId)
        .single();

      const storeName = storeData?.name || 'Unknown Store';

      // Format order items for display
      const itemsSummary = transformedOrderItems
        .map((item: { name: any; quantity: any; }) => `${item.name} (${item.quantity}x)`)
        .join(', ');
      
      const { data: notification, error: notificationError } = await supabase
        .from('notification')
        .insert({
          type: 'order',
          title: 'New Order Received',
          message: `New order from ${orderData.customer_name} - ${itemsSummary} - Total: ${orderData.total_amount.toFixed(2)}`,
          data: {
            orderId: validOrderId,
            customerName: orderData.customer_name,
            customerPhone: orderData.customer_phone || '',
            customerAddress: orderData.customer_address,
            customerEmail: orderData.customer_email,
            totalAmount: orderData.total_amount,
            orderItems: transformedOrderItems,
            storeName: storeName,
            storeId: storeId,
          },
          is_read: false,
          store_id: storeId,
          business_id: businessId,
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Failed to create notification in database:', notificationError);
        console.error('Notification error details:', {
          code: notificationError.code,
          message: notificationError.message,
          details: notificationError.details,
          hint: notificationError.hint
        });
        // Don't try HTTP fallback as it will fail on Vercel due to deployment protection
        // The notification creation failure won't break the order creation
      } else {
        console.log('Order notification created successfully in database:', notification?.id);
      }
    } catch (notificationError) {
      console.error('Error creating order notification:', notificationError);
      // Don't fail the webhook if notification fails
    }


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
