// Supply Management Types

export interface SupplyOrder {
  id: string;
  store_id: string;
  customer_id: string;
  cashier_id: string;
  supply_number: string;
  status: 'supplied' | 'partially_returned' | 'fully_returned' | 'completed' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  supply_date: string;
  expected_return_date?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  cashier?: {
    id: string;
    name: string;
    username: string;
  };
  store?: {
    id: string;
    name: string;
  };
  items?: SupplyOrderItem[];
  returns?: SupplyReturn[];
  payments?: SupplyPayment[];
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
  
  // Related data
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
  };
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
  
  // Related data
  supply_order?: SupplyOrder;
  items?: SupplyReturnItem[];
  processed_by_user?: {
    id: string;
    name: string;
  };
}

export interface SupplyReturnItem {
  id: string;
  supply_return_id: string;
  supply_order_item_id: string;
  quantity_returned: number;
  return_reason?: string;
  condition: 'good' | 'damaged' | 'defective' | 'expired';
  created_at: string;
  updated_at: string;
  
  // Related data
  supply_order_item?: SupplyOrderItem;
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
  
  // Related data
  supply_order?: SupplyOrder;
  processed_by_user?: {
    id: string;
    name: string;
  };
}

// Form data types
export interface CreateSupplyOrderData {
  store_id: string;
  customer_id: string;
  cashier_id: string;
  notes?: string;
  expected_return_date?: string;
  items: Array<{
    product_id: string;
    quantity_supplied: number;
    unit_price: number;
  }>;
}

export interface CreateSupplyReturnData {
  supply_order_id: string;
  notes?: string;
  items: Array<{
    supply_order_item_id: string;
    quantity_returned: number;
    return_reason?: string;
    condition: 'good' | 'damaged' | 'defective' | 'expired';
  }>;
}

export interface CreateSupplyPaymentData {
  supply_order_id: string;
  payment_method: 'cash' | 'card' | 'mobile' | 'other';
  amount_paid: number;
  notes?: string;
}

// Summary types
export interface SupplyOrderSummary {
  id: string;
  supply_number: string;
  status: string;
  supply_date: string;
  expected_return_date?: string;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  cashier_name: string;
  store_name: string;
  total_items: number;
  total_quantity_supplied: number;
  total_quantity_returned: number;
  total_quantity_accepted: number;
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

export interface PendingReturn {
  supply_order_id: string;
  supply_number: string;
  customer_name: string;
  customer_phone: string;
  supply_date: string;
  expected_return_date?: string;
  items_pending_return: number;
  total_quantity_pending: number;
}

// POS Integration types
export interface SupplyCartItem {
  product: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SupplyCart {
  customer_id: string;
  items: SupplyCartItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  expected_return_date?: string;
}

// API Response types
export interface SupplyOrderResponse {
  success: boolean;
  supply_order?: SupplyOrder;
  error?: string;
}

export interface SupplyReturnResponse {
  success: boolean;
  supply_return?: SupplyReturn;
  error?: string;
}

export interface SupplyPaymentResponse {
  success: boolean;
  supply_payment?: SupplyPayment;
  error?: string;
}

export interface SupplyOrdersResponse {
  success: boolean;
  supply_orders?: SupplyOrderSummary[];
  error?: string;
}

export interface PendingReturnsResponse {
  success: boolean;
  pending_returns?: PendingReturn[];
  error?: string;
}
