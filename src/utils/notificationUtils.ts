/* eslint-disable @typescript-eslint/no-explicit-any */
import { Notification } from '@/types/notification';

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
    const notificationData = {
      type: 'order',
      title: 'New Order Received',
      message: `New order from ${orderData.customerName} for $${orderData.totalAmount.toFixed(2)}`,
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

    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order notification');
    }

    console.log('Order notification created successfully');
  } catch (error) {
    console.error('Error creating order notification:', error);
    // Don't throw error to avoid breaking the order creation flow
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

    const response = await fetch('/api/notifications', {
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

    const response = await fetch('/api/notifications', {
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
