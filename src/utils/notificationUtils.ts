/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBaseUrl } from './getBaseUrl';

export interface OrderNotificationData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  customerAddress?: string;
  customerEmail?: string;
}

export async function createOrderNotification(
  orderData: OrderNotificationData,
  storeId: string,
  businessId: string
): Promise<void> {
  try {
    // Format order items for display
    const itemsSummary = orderData.orderItems
      .map(item => `${item.name} (${item.quantity}x)`)
      .join(', ');
    
    const notificationData = {
      type: 'order',
      title: 'New Order Received',
      message: `New order from ${orderData.customerName} - ${itemsSummary} - Total: ${orderData.totalAmount.toFixed(2)}`,
      data: {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        customerEmail: orderData.customerEmail,
        totalAmount: orderData.totalAmount,
        orderItems: orderData.orderItems,
      },
      storeId,
      businessId,
    };

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/notifications`;
    
    console.log('Creating notification:', { url, storeId, businessId, orderId: orderData.orderId });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }
      console.error('Notification API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to create order notification: ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log(`Order notification created successfully for order ${orderData.orderId}:`, result);
  } catch (error) {
    console.error('Error creating order notification:', error);
    // Re-throw to allow caller to handle, but don't break order creation
    // The webhook will catch and log this
    throw error;
  }
}

export async function createSystemNotification(
  title: string,
  message: string,
  storeId: string,
  businessId: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const notificationData = {
      type: 'system',
      title,
      message,
      data: data || {},
      storeId,
      businessId,
    };

    const response = await fetch(`${getBaseUrl()}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create system notification');
    }

    console.log('System notification created successfully');
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
}

export async function createAlertNotification(
  title: string,
  message: string,
  storeId: string,
  businessId: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const notificationData = {
      type: 'alert',
      title,
      message,
      data: data || {},
      storeId,
      businessId,
    };

    const response = await fetch(`${getBaseUrl()}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create alert notification');
    }

    console.log('Alert notification created successfully');
  } catch (error) {
    console.error('Error creating alert notification:', error);
  }
}
