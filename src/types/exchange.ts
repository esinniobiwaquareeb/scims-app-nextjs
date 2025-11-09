// ============================================================================
// EXCHANGE/TRADE-IN TYPES
// ============================================================================

export type ExchangeTransactionType = 'return' | 'trade_in' | 'exchange';
export type ExchangeTransactionStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type ExchangeItemType = 'returned' | 'trade_in';
export type ItemCondition = 'excellent' | 'good' | 'fair' | 'damaged' | 'defective';
export type RefundMethod = 'cash' | 'card' | 'mobile' | 'store_credit' | 'exchange';
export type RefundStatus = 'pending' | 'completed' | 'cancelled';

export interface ExchangeTransaction {
  id: string;
  store_id: string;
  customer_id?: string;
  cashier_id: string;
  transaction_number: string;
  transaction_type: ExchangeTransactionType;
  transaction_date: string;
  original_sale_id?: string;
  trade_in_total_value: number;
  additional_payment: number;
  total_purchase_amount: number;
  status: ExchangeTransactionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  cashier?: {
    id: string;
    name: string;
    username: string;
  };
  original_sale?: {
    id: string;
    receipt_number: string;
    transaction_date: string;
    total_amount: number;
  };
  exchange_items?: ExchangeItem[];
  purchase_items?: ExchangePurchaseItem[];
  refunds?: ExchangeRefund[];
}

export interface ExchangeItem {
  id: string;
  exchange_transaction_id: string;
  item_type: ExchangeItemType;
  original_sale_item_id?: string;
  product_id?: string;
  product_name?: string;
  product_sku?: string;
  product_barcode?: string;
  quantity: number;
  unit_value: number;
  total_value: number;
  condition: ItemCondition;
  condition_notes?: string;
  add_to_inventory: boolean;
  inventory_condition?: string;
  created_at: string;
  updated_at: string;
  // Relations
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    price: number;
    stock_quantity: number;
  };
  original_sale_item?: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: {
      id: string;
      name: string;
      sku?: string;
    };
  };
}

export interface ExchangePurchaseItem {
  id: string;
  exchange_transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  created_at: string;
  // Relations
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    price: number;
    stock_quantity: number;
  };
}

export interface ExchangeRefund {
  id: string;
  exchange_transaction_id: string;
  refund_amount: number;
  refund_method: RefundMethod;
  refund_status: RefundStatus;
  processed_by?: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  // Relations
  processed_by_user?: {
    id: string;
    name: string;
    username: string;
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateExchangeTransactionData {
  store_id: string;
  customer_id?: string;
  transaction_type: ExchangeTransactionType;
  original_sale_id?: string;
  exchange_items: CreateExchangeItemData[];
  purchase_items?: CreateExchangePurchaseItemData[];
  trade_in_total_value?: number;
  additional_payment?: number;
  notes?: string;
}

export interface CreateExchangeItemData {
  item_type: ExchangeItemType;
  original_sale_item_id?: string;
  product_id?: string;
  product_name?: string;
  product_sku?: string;
  product_barcode?: string;
  quantity: number;
  unit_value: number;
  condition: ItemCondition;
  condition_notes?: string;
  add_to_inventory?: boolean;
}

export interface CreateExchangePurchaseItemData {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

export interface ValidateReturnData {
  receipt_number?: string;
  sale_id?: string;
  product_id?: string;
  quantity?: number;
  store_id?: string; // Store where return is being processed
}

export interface ValidateReturnResponse {
  valid: boolean;
  sale?: {
    id: string;
    receipt_number: string;
    transaction_date: string;
    customer_id?: string;
    items: Array<{
      id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  };
  error?: string;
}

export interface CalculateTradeInValueData {
  product_id?: string;
  product_name?: string;
  product_sku?: string;
  condition: ItemCondition;
  estimated_value?: number; // Base value if known
}

export interface CalculateTradeInValueResponse {
  unit_value: number;
  condition_multiplier: number;
  notes?: string;
}

export interface CompleteExchangeTransactionData {
  process_refund?: boolean;
  refund_method?: RefundMethod;
  refund_amount?: number;
  create_sale?: boolean; // Create sale record for new items purchased
}

export interface ExchangeTransactionFilters {
  store_id?: string;
  customer_id?: string;
  transaction_type?: ExchangeTransactionType;
  status?: ExchangeTransactionStatus;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

