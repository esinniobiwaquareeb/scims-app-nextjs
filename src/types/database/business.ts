// ============================================================================
// BUSINESS RELATED TYPES
// ============================================================================

export interface Business {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  timezone?: string;
  subscription_status?: 'active' | 'expired' | 'cancelled' | 'suspended';
  subscription_expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  subscription_plan_id?: string;
  currency_id?: string;
  language_id?: string;
  country_id?: string;
  business_type?: string;
  username?: string;
  slug?: string;
}

export interface BusinessSetting {
  id: string;
  business_id: string;
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
  created_at: string;
  updated_at: string;
  business_type?: string;
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

export interface BusinessTypeMenu {
  id: string;
  business_type: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  created_at: string;
  updated_at: string;
}
