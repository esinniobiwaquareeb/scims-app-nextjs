export interface Sale {
  id: string;
  cashierId?: string;
  storeId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items?: Array<{
    product: {
      name: string;
      price: number;
      image_url?: string;
    };
    quantity: number;
  }>; // Legacy support
  sale_items?: Array<{
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    discount_amount?: number;
    created_at: string;
    products?: {
      id: string;
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      sku?: string;
    };
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  cashAmount?: number;
  change?: number;
  timestamp: Date;
  // Additional fields from database
  receipt_number?: string;
  tax_amount?: string;
  total_amount?: string;
  payment_status?: string;
  payment_method?: string; // Database field name
  transaction_date?: string;
  created_at?: string;
  updated_at?: string;
  discount_amount?: number;
  cash_received?: number;
  change_given?: number;
  status?: string;
  notes?: string;
  receipt_printed?: boolean;
  customers?: {
    name?: string;
    phone?: string;
  };
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  users?: {
    username: string;
  };
}

export interface SalesStats {
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  cashTransactions: number;
  cardTransactions: number;
}

export interface DashboardStats {
  todaysSales: number;
  totalProducts: number;
  lowStockItems: number;
  ordersToday: number;
}

export interface FeatureConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
  available: boolean;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  business_id?: string;
  store_id?: string;
  activity_type?: string;
  category?: string;
  description: string;
  metadata?: Record<string, string | number | boolean>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  // New API response fields
  timestamp?: Date;
  userName?: string;
  userRole?: string;
  action?: string;
  module?: string;
  severity?: string;
  businessName?: string;
  storeName?: string;
  ipAddress?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  created_at: string;
}
