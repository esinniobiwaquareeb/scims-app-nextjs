// ============================================================================
// FORM DATA TYPES
// ============================================================================

// Form data types - no imports needed as they are standalone interfaces

// Business forms
export interface BusinessFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  timezone?: string;
  business_type?: string;
  country_id?: string;
  currency_id?: string;
  language_id?: string;
}

export interface BusinessSettingsFormData {
  tax_rate?: number;
  enable_tax?: boolean;
  discount_rate?: number;
  enable_discount?: boolean;
  allow_returns?: boolean;
  return_period_days?: number;
  enable_sounds?: boolean;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  receipt_header?: string;
  receipt_footer?: string;
  return_policy?: string;
  warranty_info?: string;
  terms_of_service?: string;
  privacy_policy?: string;
  enable_stock_tracking?: boolean;
  enable_inventory_alerts?: boolean;
  enable_restock_management?: boolean;
  enable_recipe_management?: boolean;
  enable_service_booking?: boolean;
  enable_menu_management?: boolean;
  enable_ingredient_tracking?: boolean;
  enable_public_store?: boolean;
  store_theme?: string;
  store_banner_url?: string;
  store_description?: string;
  whatsapp_phone?: string;
  whatsapp_message_template?: string;
}

// Store forms
export interface StoreFormData {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  manager_name?: string;
  is_active: boolean;
  currency_id?: string;
  language_id?: string;
  country_id?: string;
}

export interface StoreSettingsFormData {
  // Basic store info
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  manager_name?: string;
  country_id?: string;
  country?: string;
  country_code?: string;
  currency_id?: string;
  currency?: string;
  currency_name?: string;
  currency_symbol?: string;
  language_id?: string;
  language?: string;
  language_name?: string;
  language_native_name?: string;
  
  // Settings
  tax_rate?: number;
  enable_tax?: boolean;
  discount_rate?: number;
  enable_discount?: boolean;
  allow_returns?: boolean;
  return_period_days?: number;
  enable_sounds?: boolean;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  receipt_header?: string;
  receipt_footer?: string;
  return_policy?: string;
  contact_person?: string;
  store_hours?: string;
  store_promotion_info?: string;
  custom_receipt_message?: string;
  
  // Additional properties for compatibility
  taxRate?: number;
  enableTax?: boolean;
  allowReturns?: boolean;
  returnPeriodDays?: number;
  receiptHeader?: string;
  receiptFooter?: string;
  customReceiptMessage?: string;
  theme?: string;
}

// User forms
export interface UserFormData {
  username: string;
  email?: string;
  name: string;
  phone?: string;
  role: 'superadmin' | 'business_admin' | 'store_admin' | 'cashier';
  password?: string;
  confirmPassword?: string;
}

export interface StaffFormData extends UserFormData {
  business_id: string;
  store_id?: string;
  role_id?: string;
  permissions?: string[];
  is_active?: boolean;
}

// Product forms
export interface ProductFormData {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_level?: number;
  category_id?: string;
  supplier_id?: string;
  brand_id?: string;
  image_url?: string;
  is_active: boolean;
  is_public?: boolean;
  public_description?: string;
  public_images?: string[];
}

// Category forms
export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
}

// Brand forms
export interface BrandFormData {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
}

// Supplier forms
export interface SupplierFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
}

// Customer forms
export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
}

// Role forms
export interface RoleFormData {
  name: string;
  description?: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
}

// Sale forms
export interface SaleFormData {
  customer_id?: string;
  payment_method: 'cash' | 'card' | 'mobile' | 'other';
  cash_received?: number;
  notes?: string;
  items: SaleItemFormData[];
}

export interface SaleItemFormData {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

// Supply order forms
export interface SupplyOrderFormData {
  customer_id: string;
  notes?: string;
  expected_return_date?: string;
  items: SupplyOrderItemFormData[];
}

export interface SupplyOrderItemFormData {
  product_id: string;
  quantity_supplied: number;
  unit_price: number;
}

// Restock order forms
export interface RestockOrderFormData {
  supplier_id: string;
  notes?: string;
  expected_delivery?: string;
  items: RestockItemFormData[];
}

export interface RestockItemFormData {
  product_id: string;
  quantity: number;
  unit_cost: number;
}
