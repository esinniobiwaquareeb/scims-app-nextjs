// ============================================================================
// SUPPLY MANAGEMENT RELATED TYPES
// ============================================================================

export interface SupplyOrder {
  id: string;
  store_id: string;
  customer_id: string;
  cashier_id: string;
  supply_number: string;
  status: 'supplied' | 'partially_returned' | 'fully_returned' | 'completed' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  supply_date: string;
  expected_return_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplyOrderItem {
  id: string;
  supply_order_id: string;
  product_id: string;
  quantity_supplied: number;
  quantity_returned: number;
  quantity_accepted: number;
  unit_price: number;
  total_price: number;
  return_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplyPayment {
  id: string;
  supply_order_id: string;
  payment_number: string;
  payment_method: 'cash' | 'card' | 'mobile' | 'other';
  amount_paid: number;
  payment_date: string;
  processed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplyReturn {
  id: string;
  supply_order_id: string;
  return_number: string;
  status: 'pending' | 'processed' | 'cancelled';
  total_returned_amount: number;
  notes?: string;
  return_date: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplyReturnItem {
  id: string;
  supply_return_id: string;
  supply_order_item_id: string;
  quantity_returned: number;
  return_reason?: string;
  condition?: 'good' | 'damaged' | 'defective' | 'expired';
  created_at: string;
  updated_at: string;
}

// Views
export interface PendingReturns {
  supply_order_id: string;
  supply_number: string;
  customer_name: string;
  customer_phone?: string;
  supply_date: string;
  expected_return_date?: string;
  items_pending_return: number;
  total_quantity_pending: number;
}

export interface SupplyOrderItemsDetail {
  id: string;
  supply_order_id: string;
  supply_number: string;
  product_name: string;
  sku?: string;
  barcode?: string;
  quantity_supplied: number;
  quantity_returned: number;
  quantity_accepted: number;
  unit_price: number;
  total_price: number;
  return_reason?: string;
  quantity_pending: number;
}

export interface SupplyOrderSummary {
  id: string;
  supply_number: string;
  status: string;
  supply_date: string;
  expected_return_date?: string;
  total_amount: number;
  customer_name: string;
  customer_phone?: string;
  cashier_name: string;
  store_name: string;
  total_items: number;
  total_quantity_supplied: number;
  total_quantity_returned: number;
  total_quantity_accepted: number;
}
