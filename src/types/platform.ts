// ============================================================================
// PLATFORM SPECIFIC TYPES
// ============================================================================

import { Business as BaseBusiness } from './database';
// import { BusinessFormData } from './forms';

// Extended business interface for platform management
export interface PlatformBusiness extends BaseBusiness {
  country?: {
    id: string;
    name: string;
    code: string;
  };
  currency?: {
    id: string;
    name: string;
    symbol: string;
  };
  language?: {
    id: string;
    name: string;
    code: string;
  };
  subscription_plans?: {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    max_stores: number;
    max_products: number;
    max_users: number;
  };
  stores: Array<{
    id: string;
    name: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    manager_name?: string;
    is_active: boolean;
    created_at: string;
  }>;
}

// Business management component props
export interface BusinessManagementProps {
  onBack: () => void;
}

// Business form data for platform management
export interface BusinessFormData {
  name: string;
  email: string;
  username: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  business_type: string;
  country_id?: string;
  currency_id?: string;
  language_id?: string;
  timezone: string;
  subscription_plan_id?: string;
  subscription_status: 'active' | 'expired' | 'cancelled' | 'suspended';
  is_active: boolean;
}

// Subscription plan, Country, Currency, and Language interfaces are imported from database types

// Platform statistics
export interface PlatformStats {
  totalBusinesses: number;
  activeSubscriptions: number;
  totalStores: number;
  platformUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

// Business filters, BusinessColumn, and BusinessExportOptions are imported from business types
