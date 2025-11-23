// ============================================================================
// COMPETITOR FEATURES TYPES
// ============================================================================

// Stock Transfer Types
export interface StockTransfer {
  id: string;
  from_store_id: string;
  to_store_id: string;
  product_id: string;
  quantity: number;
  transfer_date: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
  };
  from_store?: {
    id: string;
    name: string;
  };
  to_store?: {
    id: string;
    name: string;
  };
  created_by_user?: {
    id: string;
    name: string;
    username: string;
  };
}

export interface StockTransferFormData {
  from_store_id: string;
  to_store_id: string;
  product_id: string;
  quantity: number;
  transfer_date?: string;
  notes?: string;
}

// Stock Adjustment Types
export interface StockAdjustment {
  id: string;
  store_id: string;
  product_id: string;
  quantity_change: number; // Can be positive or negative
  reason: string;
  adjustment_date: string;
  created_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    stock_quantity: number;
  };
  store?: {
    id: string;
    name: string;
  };
  created_by_user?: {
    id: string;
    name: string;
    username: string;
  };
}

export interface StockAdjustmentFormData {
  store_id: string;
  product_id: string;
  quantity_change: number;
  reason: string;
  adjustment_date?: string;
  notes?: string;
}

// Sale Return Types
export interface SaleReturn {
  id: string;
  sale_id: string;
  return_number: string;
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  total_return_amount: number;
  refund_method: 'cash' | 'card' | 'mobile' | 'store_credit' | 'exchange';
  refund_status: 'pending' | 'completed' | 'cancelled';
  return_reason?: string;
  notes?: string;
  return_date: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  sale?: {
    id: string;
    receipt_number: string;
    transaction_date: string;
    total_amount: number;
  };
  store?: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    name: string;
    phone?: string;
  };
  cashier?: {
    id: string;
    name: string;
    username: string;
  };
  return_items?: SaleReturnItem[];
}

export interface SaleReturnItem {
  id: string;
  sale_return_id: string;
  sale_item_id: string;
  product_id: string;
  quantity_returned: number;
  unit_price: number;
  total_return_amount: number;
  return_reason?: string;
  created_at: string;
  sale_item?: {
    id: string;
    quantity: number;
    unit_price: number;
  };
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
}

export interface SaleReturnFormData {
  sale_id: string;
  return_items: Array<{
    sale_item_id: string;
    product_id: string;
    quantity_returned: number;
    return_reason?: string;
  }>;
  refund_method: 'cash' | 'card' | 'mobile' | 'store_credit' | 'exchange';
  return_reason?: string;
  notes?: string;
}

// Quotation Types
export interface Quotation {
  id: string;
  business_id: string;
  store_id?: string;
  quotation_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  bank_account_info?: Record<string, unknown>;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  expires_at?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  business?: {
    id: string;
    name: string;
  };
  store?: {
    id: string;
    name: string;
  };
  created_by_user?: {
    id: string;
    name: string;
    username: string;
  };
  items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id?: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_custom_item: boolean;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    price?: number;
    stock_quantity?: number;
  };
}

export interface QuotationFormData {
  business_id: string;
  store_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  items: Array<{
    product_id?: string;
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    is_custom_item?: boolean;
  }>;
  tax_amount?: number;
  discount_amount?: number;
  bank_account_info?: Record<string, unknown>;
  expires_at?: string;
  notes?: string;
}

// Expense Types
export interface Expense {
  id: string;
  business_id: string;
  store_id?: string;
  category: string;
  amount: number;
  description?: string;
  expense_date: string;
  payment_method: 'cash' | 'card' | 'mobile' | 'bank_transfer' | 'other';
  created_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  business?: {
    id: string;
    name: string;
  };
  store?: {
    id: string;
    name: string;
  };
  created_by_user?: {
    id: string;
    name: string;
    username: string;
  };
}

export interface ExpenseFormData {
  business_id: string;
  store_id?: string;
  category: string;
  amount: number;
  description?: string;
  expense_date?: string;
  payment_method: 'cash' | 'card' | 'mobile' | 'bank_transfer' | 'other';
  notes?: string;
}

// Bulk Price Adjustment Types
export interface BulkPriceAdjustmentData {
  business_id: string;
  category_id?: string;
  adjustment_type: 'increase' | 'decrease';
  adjustment_value: number;
  adjustment_method: 'percentage' | 'fixed';
}

// Enhanced Sale Types
import type { Sale, Product } from './index';
export interface EnhancedSale extends Sale {
  delivery_cost?: number;
  payment_history?: Array<{
    amount: number;
    method: string;
    date: string;
  }>;
  is_editable?: boolean;
}

// Enhanced Product Types
export interface EnhancedProduct extends Product {
  unit?: string; // 'piece', 'packet', 'dozen', 'box', 'kg', 'liter', etc.
  auto_generated_code?: boolean;
}

// Bank Account Types
export interface BankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
  account_type?: 'savings' | 'current';
  branch?: string;
  swift_code?: string;
  iban?: string;
}

