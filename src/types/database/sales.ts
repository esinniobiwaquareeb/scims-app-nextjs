// ============================================================================
// SALES & TRANSACTION RELATED TYPES
// ============================================================================

export interface Sale {
  id: string;
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  receipt_number: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mobile' | 'other';
  cash_received?: number;
  change_given?: number;
  status?: 'pending' | 'completed' | 'refunded' | 'cancelled';
  notes?: string;
  transaction_date: string;
  created_at: string;
  payment_status?: string;
  receipt_printed?: boolean;
  updated_at: string;
  discount_amount: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  discount_amount: number;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  total_purchases: number;
  last_purchase_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedCart {
  id: string;
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  cart_name: string;
  cart_data: CartData;
  created_at: string;
  updated_at: string;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  customer_id?: string;
  notes?: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
}
