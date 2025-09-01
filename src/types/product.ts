// Product Management Types

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  category_id?: string;
  brand_id?: string;
  supplier_id?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Related data
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form data types
export interface CreateProductData {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  category_id?: string;
  brand_id?: string;
  supplier_id?: string;
  image_url?: string;
}

export interface UpdateProductData {
  name?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  category_id?: string;
  brand_id?: string;
  supplier_id?: string;
  image_url?: string;
  is_active?: boolean;
}

// API Response types
export interface ProductResponse {
  success: boolean;
  product?: Product;
  error?: string;
}

export interface ProductsResponse {
  success: boolean;
  products?: Product[];
  error?: string;
}
