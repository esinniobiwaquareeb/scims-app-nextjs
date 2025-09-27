// ============================================================================
// STORE RELATED TYPES
// ============================================================================

export interface Store {
  id: string;
  business_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  currency_id?: string;
  language_id?: string;
  country_id?: string;
}

export interface StoreSetting {
  id: string;
  store_id: string;
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
  created_at: string;
  updated_at: string;
}
