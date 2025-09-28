export interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  barcode?: string;
  description?: string;
  stock_quantity: number;
  category_id?: string;
  categories?: { id: string; name: string };
  is_active: boolean;
  image_url?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount_amount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  cashier_id: string;
  store_id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mixed';
  cash_received?: number;
  change_given?: number;
  transaction_date: string;
  receipt_number?: string;
  status: string;
  sale_items?: Array<{
    quantity: number;
    unit_price: number;
    total_price: number;
    products?: {
      name: string;
    };
  }>;
  discount_amount?: number;
  applied_coupon_id?: string;
  applied_promotion_id?: string;
  discount_reason?: string;
  applied_coupon?: {
    id: string;
    code: string;
    name: string;
    discount_type: {
      name: string;
    };
    discount_value: number;
  };
  applied_promotion?: {
    id: string;
    name: string;
    discount_type: {
      name: string;
    };
    discount_value: number;
  };
  customers?: {
    name: string;
    phone: string;
  };
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
}
