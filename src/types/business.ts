// ============================================================================
// BUSINESS SPECIFIC TYPES
// ============================================================================

import { Business as BaseBusiness } from './database';

// Extended business interface for UI display
export interface BusinessDetail extends BaseBusiness {
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

// Business detail component props
export interface BusinessDetailProps {
  onBack: () => void;
  business: BusinessDetail | null;
}

// Business statistics
export interface BusinessStats {
  totalProducts: number;
  activeProducts: number;
  totalUsers: number;
  activeUsers: number;
  totalStores: number;
  activeStores: number;
  totalSales: number;
  totalRevenue: number;
  recentActivity: number;
  subscriptionStatus: 'active' | 'expired' | 'cancelled' | 'suspended';
}

// Business filters
export interface BusinessFilters {
  productSearch: string;
  userSearch: string;
  activitySearch: string;
  activityType: string;
  salesSearch: string;
  salesDateFilter: string;
}

// Business export options
export interface BusinessExportOptions {
  businessId: string;
  includeProducts: boolean;
  includeUsers: boolean;
  includeActivity: boolean;
  includeSales: boolean;
  format: 'csv' | 'json' | 'xlsx';
}

// Business table column
export interface BusinessColumn {
  key: string;
  label: string;
  render: (item: unknown) => React.ReactNode;
}

// Business type configuration
export interface BusinessTypeConfig {
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}