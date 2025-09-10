/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { sendOrderConfirmationEmail, sendBusinessOrderNotification } from '@/lib/email/orderEmails';
import { sendWhatsAppMessage } from '@/lib/whatsapp/whatsappService';
import { getBaseUrl } from '@/utils/getBaseUrl';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    const {
      business_id,
      store_id,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      order_items,
      subtotal,
      total_amount,
      notes,
      payment_method
    } = orderData;

    // Validation
    if (!business_id || !store_id || !customer_name || !customer_phone || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Verify business exists and public store is enabled
    const { data: business, error: businessError } = await supabase
      .from('business')
      .select(`
        *,
        business_setting(*)
      `)
      .eq('id', business_id)
      .eq('is_active', true)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const storeSettings = business.business_setting;
    if (!storeSettings?.enable_public_store) {
      return NextResponse.json(
        { success: false, error: 'Public store is not enabled' },
        { status: 403 }
      );
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('public_order')
      .insert({
        business_id,
        store_id,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        customer_address: customer_address || null,
        order_items,
        subtotal,
        total_amount,
        notes: notes || null,
        payment_method: payment_method || 'pay_on_delivery',
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Send WhatsApp notification
    let whatsappUrl = '';
    try {
      const whatsappResult = await sendWhatsAppNotification(order, business, storeSettings);
      whatsappUrl = whatsappResult.whatsappUrl || '';
      
      // Update order with WhatsApp sent status
      await supabase
        .from('public_order')
        .update({ whatsapp_sent: true })
        .eq('id', order.id);
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError);
      // Don't fail the order creation if WhatsApp fails
    }

    // Send email notifications
    try {
      // Send confirmation email to customer if email provided
      if (customer_email) {
        await sendOrderConfirmationEmail({
          customerEmail: customer_email,
          customerName: customer_name,
          orderNumber: order.id.slice(-8).toUpperCase(),
          businessName: business.name,
          orderItems: order_items,
          totalAmount: total_amount,
          currency: business.currency?.symbol || '₦'
        });
      }

      // Send notification email to business if business email exists
      if (business.email) {
        await sendBusinessOrderNotification({
          businessEmail: business.email,
          businessName: business.name,
          customerName: customer_name,
          customerPhone: customer_phone,
          customerEmail: customer_email,
          orderNumber: order.id.slice(-8).toUpperCase(),
          orderItems: order_items,
          totalAmount: total_amount,
          currency: business.currency?.symbol || '₦',
          notes: notes
        });
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the order creation if email fails
    }

    // Create notification for the order
    try {
      const notificationResponse = await fetch(`${getBaseUrl()}/api/orders/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          storeId: store_id,
          businessId: business_id,
          orderData: {
            customer_name,
            customer_phone,
            customer_email: customer_email || null,
            customer_address: customer_address || null,
            total_amount,
            subtotal,
            order_items,
            notes: notes || null
          }
        }),
      });

      if (!notificationResponse.ok) {
        console.error('Failed to create order notification:', await notificationResponse.text());
      } else {
        console.log('Order notification created successfully');
      }
    } catch (notificationError) {
      console.error('Error creating order notification:', notificationError);
      // Don't fail the order creation if notification fails
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        business_id,
        store_id,
        activity_type: 'public_order_created',
        category: 'Ecommerce',
        description: `New public order received from ${customer_name}`,
        metadata: {
          order_id: order.id,
          customer_name,
          customer_phone,
          total_amount,
          item_count: order_items.length
        }
      });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.id.slice(-8).toUpperCase(),
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at
      },
      whatsappUrl,
      message: 'Order placed successfully! You will receive a confirmation via WhatsApp.'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place order. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendWhatsAppNotification(order: any, business: any, storeSettings: any) {
  const whatsappPhone = storeSettings.whatsapp_phone || business.phone;
  
  if (!whatsappPhone) {
    throw new Error('No WhatsApp phone number configured');
  }

  // Format order items with better formatting
  const orderItemsText = order.order_items.map((item: any) => {
    const currencySymbol = business.currency?.symbol || '₦';
    return `• ${item.name} x${item.quantity} - ${currencySymbol}${item.total_price.toLocaleString()}`;
  }).join('\n');

  // Get currency symbol
  const currencySymbol = business.currency?.symbol || '₦';

  // Format the message with proper line breaks
  const message = (storeSettings.whatsapp_message_template || 
    `🛍️ *New Order Received!*

📋 *Order Details:*
{order_items}

💰 *Total: {total_amount}*

👤 *Customer Information:*
• Name: {customer_name}
• Phone: {customer_phone}
• Address: {customer_address}

Thank you for your order! 🙏`)
    .replace(/{customer_name}/g, order.customer_name)
    .replace('{order_items}', orderItemsText)
    .replace('{total_amount}', `${currencySymbol}${order.total_amount.toLocaleString()}`)
    .replace('{customer_phone}', order.customer_phone)
    .replace('{customer_address}', order.customer_address || 'Not provided');

  // Use the WhatsApp service to send the message
  const result = await sendWhatsAppMessage(business.id, whatsappPhone, message);
  
  if (!result.success) {
    console.error('WhatsApp message failed:', result.error);
    throw new Error(result.error || 'Failed to send WhatsApp message');
  }

  return {
    success: true,
    whatsappUrl: result.whatsappUrl,
    message: 'WhatsApp notification sent'
  };
}
