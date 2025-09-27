// ============================================================================
// STORE SPECIFIC TYPES
// ============================================================================

import React from 'react';
import { Store, StoreSetting } from './database';

// Store management component props
export interface StoreProps {
  onBack: () => void;
}

// Extended store interface for UI display
export interface StoreDisplay extends Store {
  // Additional computed fields for UI display
  display_name: string;
  status_color: string;
  status_label: string;
  location_summary: string;
  contact_summary: string;
  manager_summary: string;
  settings_summary: string;
  performance_score: number;
  last_activity: string;
  total_staff: number;
  total_products: number;
  total_sales: number;
  total_revenue: number;
  currency_symbol: string;
  language_name: string;
  country_name: string;
  
  // Related objects
  currency?: {
    id: string;
    name: string;
    symbol: string;
    code: string;
  };
  language?: {
    id: string;
    name: string;
    code: string;
    native_name: string;
  };
  country?: {
    id: string;
    name: string;
    code: string;
  };
}

// Store settings interface
export interface StoreSettings extends StoreSetting {
  // Additional computed fields for settings
  formatted_tax_rate: string;
  formatted_discount_rate: string;
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  notification_settings: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
  };
  
  // Additional properties for compatibility
  currency_id?: string;
  language_id?: string;
}

// Store details interface
export interface StoreDetails extends Store {
  // Additional computed fields for details view
  full_address: string;
  contact_info: {
    phone: string;
    email: string;
    website: string;
  };
  business_info: {
    manager: string;
    hours: string;
    established: string;
  };
  performance_metrics: {
    total_staff: number;
    total_products: number;
    total_sales: number;
    total_revenue: number;
    average_order_value: number;
    customer_count: number;
  };
  recent_activity: Array<{
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

// Store form data
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

// Store settings form data
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

// Store filters
export interface StoreFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  locationFilter: string;
  managerFilter: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

// Store statistics
export interface StoreStats {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  totalStaff: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  averagePerformance: number;
  topPerformingStores: StoreDisplay[];
  recentActivity: Array<{
    store_id: string;
    store_name: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

// Store table column
export interface StoreColumn {
  key: string;
  label: string;
  render: (store: StoreDisplay) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

// Store action
export interface StoreAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (store: StoreDisplay) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (store: StoreDisplay) => boolean;
}

// Store state
export interface StoreState {
  searchTerm: string;
  statusFilter: string;
  locationFilter: string;
  managerFilter: string;
  selectedStore: StoreDisplay | null;
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  showDetailsDialog: boolean;
  showSettingsDialog: boolean;
  currentTab: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Store export options
export interface StoreExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeSettings: boolean;
  includeStaff: boolean;
  includeProducts: boolean;
  includeSales: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: StoreFilters;
}

// Store import options
export interface StoreImportOptions {
  file: File;
  mapping: {
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    manager_name: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateData: boolean;
  };
}

// Store notification
export interface StoreNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  store_id?: string;
  created_at: string;
  read: boolean;
}

// Store settings
export interface StoreSettingsConfig {
  default_currency: string;
  default_language: string;
  default_country: string;
  auto_backup: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  notification_enabled: boolean;
  notification_types: string[];
  performance_thresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

// Store performance metrics
export interface StorePerformance {
  store_id: string;
  period: string;
  metrics: {
    total_sales: number;
    total_revenue: number;
    average_order_value: number;
    customer_count: number;
    staff_count: number;
    product_count: number;
    inventory_value: number;
    profit_margin: number;
  };
  trends: {
    sales_trend: 'up' | 'down' | 'stable';
    revenue_trend: 'up' | 'down' | 'stable';
    customer_trend: 'up' | 'down' | 'stable';
  };
  benchmarks: {
    vs_company_average: number;
    vs_previous_period: number;
    vs_industry_standard: number;
  };
  created_at: string;
  updated_at: string;
}

// Store audit log
export interface StoreAuditLog {
  id: string;
  store_id: string;
  action: 'create' | 'update' | 'delete' | 'settings_change' | 'staff_change' | 'product_change';
  details: Record<string, unknown>;
  performed_by: string;
  performed_by_name: string;
  timestamp: string;
}

// Store template
export interface StoreTemplate {
  id: string;
  name: string;
  description?: string;
  settings: StoreSettingsFormData;
  default_staff_roles: string[];
  default_permissions: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Store schedule
export interface StoreSchedule {
  id: string;
  store_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_24_hours: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Store alert
export interface StoreAlert {
  id: string;
  store_id: string;
  type: 'performance_low' | 'staff_shortage' | 'inventory_low' | 'security_concern' | 'maintenance_required';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Store dashboard data
export interface StoreDashboardData {
  store: StoreDisplay;
  settings: StoreSettings;
  performance: StorePerformance;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  alerts: StoreAlert[];
  stats: StoreStats;
}

// Store search result
export interface StoreSearchResult {
  id: string;
  type: 'store' | 'staff' | 'product' | 'sale';
  title: string;
  description: string;
  metadata: Record<string, unknown>;
}

// Store bulk action
export interface StoreBulkAction {
  store_ids: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'export' | 'update_settings';
  options?: Record<string, unknown>;
}

// Store conflict
export interface StoreConflict {
  id: string;
  type: 'data_conflict' | 'permission_conflict' | 'validation_conflict';
  description: string;
  affected_stores: string[];
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

// Store comparison
export interface StoreComparison {
  id: string;
  name: string;
  description?: string;
  store_id_1: string;
  store_id_2: string;
  metrics: Array<{
    name: string;
    value_1: number;
    value_2: number;
    difference: number;
    percentage_change: number;
  }>;
  created_at: string;
  created_by: string;
}

// Store trend
export interface StoreTrend {
  id: string;
  store_id: string;
  metric: string;
  period: string;
  data: Array<{
    date: string;
    value: number;
    change: number;
    change_percentage: number;
  }>;
  trend_direction: 'up' | 'down' | 'stable';
  trend_strength: 'weak' | 'moderate' | 'strong';
  created_at: string;
}

// Store forecast
export interface StoreForecast {
  id: string;
  store_id: string;
  metric: string;
  period: string;
  forecast_data: Array<{
    date: string;
    predicted_value: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
  }>;
  accuracy: number;
  created_at: string;
  expires_at: string;
}

// Store insight
export interface StoreInsight {
  id: string;
  store_id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
}

// Store widget
export interface StoreWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'list';
  title: string;
  data: unknown;
  config: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
  created_at: string;
  updated_at: string;
}

// Store dashboard
export interface StoreDashboard {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  widgets: StoreWidget[];
  layout: 'grid' | 'list' | 'custom';
  created_at: string;
  updated_at: string;
  is_public: boolean;
  shared_with: string[];
}

// Store sharing
export interface StoreSharing {
  id: string;
  store_id: string;
  shared_with_user_ids: string[];
  shared_with_role_ids: string[];
  share_link?: string;
  expires_at?: string;
  permissions: string[];
  created_at: string;
  created_by: string;
}

// Store comment
export interface StoreComment {
  id: string;
  store_id: string;
  user_id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
}

// Store bookmark
export interface StoreBookmark {
  id: string;
  user_id: string;
  store_id: string;
  name: string;
  filters: StoreFilters;
  created_at: string;
  updated_at: string;
}

// Store integration
export interface StoreIntegration {
  id: string;
  name: string;
  type: 'export' | 'import' | 'sync' | 'webhook';
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Store backup
export interface StoreBackup {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  data: {
    store: StoreDisplay;
    settings: StoreSettings;
    staff: Array<{
      id: string;
      name: string;
      role: string;
    }>;
    products: Array<{
      id: string;
      name: string;
      sku: string;
    }>;
  };
  created_at: string;
  created_by: string;
}

// Store restore
export interface StoreRestore {
  id: string;
  backup_id: string;
  store_id: string;
  options: {
    restoreStore: boolean;
    restoreSettings: boolean;
    restoreStaff: boolean;
    restoreProducts: boolean;
  };
  created_at: string;
  created_by: string;
}
