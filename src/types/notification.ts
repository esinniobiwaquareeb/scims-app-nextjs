// ============================================================================
// NOTIFICATION RELATED TYPES
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'alert';
  isRead: boolean;
  createdAt: string;
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
  };
}

export interface NotificationProps {
  onBack: () => void;
}

export interface NotificationStats {
  total: number;
  unread: number;
  orders: number;
  system: number;
  alerts: number;
}
