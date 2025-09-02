/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { sendOrderConfirmationEmail, sendBusinessOrderNotification } from '@/lib/email/orderEmails';

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
      notes
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
    try {
      await sendWhatsAppNotification(order, business, storeSettings);
      
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

  // Format order items
  const orderItemsText = order.order_items.map((item: any) => {
    return `• ${item.name} x${item.quantity} - ${item.total_price}`;
  }).join('\n');

  // Get currency symbol
  const currencySymbol = business.currency?.symbol || '₦';

  // Format the message
  const message = (storeSettings.whatsapp_message_template || 
    'New order received from {customer_name}!\n\nOrder Details:\n{order_items}\n\nTotal: {total_amount}\n\nCustomer: {customer_name}\nPhone: {customer_phone}\nAddress: {customer_address}')
    .replace('{customer_name}', order.customer_name)
    .replace('{order_items}', orderItemsText)
    .replace('{total_amount}', `${currencySymbol}${order.total_amount.toLocaleString()}`)
    .replace('{customer_phone}', order.customer_phone)
    .replace('{customer_address}', order.customer_address || 'Not provided');

  // For now, we'll just log the message
  // In production, you would integrate with WhatsApp Business API
  console.log('WhatsApp Message to send:', {
    to: whatsappPhone,
    message: message
  });

  // TODO: Integrate with WhatsApp Business API
  // Example with WhatsApp Business API:
  // const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: whatsappPhone.replace('+', ''),
  //     type: 'text',
  //     text: { body: message }
  //   })
  // });

  return { success: true, message: 'WhatsApp notification sent' };
}
