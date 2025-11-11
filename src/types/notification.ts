export interface Notification {
  id: string;
  type: 'order' | 'system' | 'alert';
  title: string;
  message: string;
  data?: {
    orderId?: string;
    customerName?: string;
    customerPhone?: string;
    totalAmount?: number;
    orderItems?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    storeName?: string;
    storeId?: string;
    [key: string]: unknown;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  businessId: string;
  storeName?: string; // Store name for display purposes
}

export interface NotificationSettings {
  enableOrderNotifications: boolean;
  enableSystemNotifications: boolean;
  enableSoundNotifications: boolean;
  autoMarkAsRead: boolean;
  notificationDuration: number; // in seconds
}

export interface NotificationStats {
  total: number;
  unread: number;
  orders: number;
  system: number;
  alerts: number;
}
