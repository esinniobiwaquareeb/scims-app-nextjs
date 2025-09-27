// ============================================================================
// PLATFORM & SYSTEM RELATED TYPES
// ============================================================================

export interface PlatformSetting {
  id: string;
  platform_name?: string;
  platform_version?: string;
  default_currency?: string;
  default_language?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  demo_mode?: boolean;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  allow_username_login?: boolean;
  require_email_verification?: boolean;
  session_timeout?: number;
  max_login_attempts?: number;
  supported_currencies?: Currency[];
  supported_languages?: Language[];
  system_status?: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  active_connections?: number;
  last_health_check?: string;
  platform_phone?: string;
  platform_whatsapp?: string;
  platform_email?: string;
  platform_website?: string;
  enable_pay_on_delivery?: boolean;
  enable_online_payment?: boolean;
  payment_methods?: string[];
  created_at: string;
  updated_at: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  decimals?: number;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rtl?: boolean;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  phone_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  description?: string;
  features?: string[];
  max_stores?: number;
  max_products?: number;
  max_users?: number;
  is_active?: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  billing_cycle?: string;
  is_popular?: boolean;
  price?: string;
}

export interface SubscriptionDistribution {
  id: string;
  plan_name: string;
  subscriber_count: number;
  revenue: number;
  recorded_date?: string;
  created_at: string;
}

export interface PlatformAnalytic {
  id: string;
  date: string;
  new_users?: number;
  active_users?: number;
  new_businesses?: number;
  active_businesses?: number;
  total_transactions?: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformHealth {
  id: string;
  service_name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  response_time_ms?: number;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlatformRevenue {
  id: string;
  date: string;
  revenue: number;
  subscription_revenue: number;
  transaction_fees: number;
  other_revenue: number;
  created_at: string;
  updated_at: string;
}
