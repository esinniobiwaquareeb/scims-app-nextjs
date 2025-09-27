// ============================================================================
// PRODUCT & INVENTORY RELATED TYPES
// ============================================================================

export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  supplier_id?: string;
  business_id?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  brand_id?: string;
  image_url?: string;
  is_active: boolean;
  total_sold?: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
  reorder_level?: number;
  is_public?: boolean;
  public_description?: string;
  public_images?: string[];
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  business_id?: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestockOrder {
  id: string;
  store_id: string;
  supplier_id: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  total_amount: number;
  expected_delivery?: string;
}

export interface RestockItem {
  id: string;
  restock_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity?: number;
  created_at: string;
  updated_at: string;
}
