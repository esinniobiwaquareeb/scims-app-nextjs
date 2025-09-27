// ============================================================================
// SALES REPORT SPECIFIC TYPES
// ============================================================================

import React from 'react';
import { Sale, SaleItem } from './database';
import { ProductPerformance, CategoryPerformance, PaymentMethodBreakdown, DailyRevenue, FinancialStats, ChartData } from './ui';

// Sales report component props
export interface SalesReportProps {
  onBack: () => void;
}

// Extended sale interface for UI display in sales reports
export interface SalesReportSale extends Sale {
  sale_items: SalesReportSaleItem[];
  customers?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  users?: {
    username: string;
    name?: string;
  };
  cashier?: {
    id: string;
    name: string;
    username: string;
  };
  stores?: {
    name: string;
  };
  // Computed fields for reports
  formatted_date: string;
  formatted_time: string;
  formatted_amount: string;
  customer_name: string;
  cashier_name: string;
  store_name: string;
  items_count: number;
  items_summary: string;
  payment_icon: React.ElementType;
  status_color: string;
  status_label: string;
}

// Extended sale item interface for UI display in sales reports
export interface SalesReportSaleItem extends SaleItem {
  products: {
    id: string;
    name: string;
    sku: string;
    image_url?: string;
    categories?: {
      name: string;
    };
  };
  // Computed fields for reports
  formatted_unit_price: string;
  formatted_total_price: string;
  formatted_discount: string;
  category_name: string;
  profit_margin: number;
  formatted_profit: string;
}

// Sales report filters
export interface SalesReportFilters {
  searchTerm: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  paymentMethod: string;
  status: string;
  storeId: string;
  cashierId: string;
  customerId: string;
}

// Sales report statistics
export interface SalesReportStats {
  totalSales: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalTax: number;
  averageOrderValue: number;
  totalOrders: number;
  uniqueCustomers: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
    sku: string;
  }>;
  topCategories: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
    cash_received?: number;
    change_given?: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
    sales: number;
    customers: number;
  }>;
  // Additional computed fields for sales reports
  growthRate?: number;
  previousPeriodRevenue?: number;
  topPerformingProducts?: ProductPerformance[];
  topPerformingCategories?: CategoryPerformance[];
  financialStats?: FinancialStats;
  chartData?: ChartData[];
}

// Sales report table column
export interface SalesReportColumn {
  key: string;
  label: string;
  render: (sale: SalesReportSale) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

// Sales report action
export interface SalesReportAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (sale: SalesReportSale) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (sale: SalesReportSale) => boolean;
}

// Sales report state
export interface SalesReportState {
  searchTerm: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  paymentMethod: string;
  status: string;
  storeId: string;
  cashierId: string;
  customerId: string;
  selectedSale: SalesReportSale | null;
  showSaleDetail: boolean;
  showExportDialog: boolean;
  showFilterDialog: boolean;
  currentTab: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Sales report export options
export interface SalesReportExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeItems: boolean;
  includeCustomer: boolean;
  includeCashier: boolean;
  includeStore: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: SalesReportFilters;
}

// Sales report import options
export interface SalesReportImportOptions {
  file: File;
  mapping: {
    receipt_number: string;
    customer_name: string;
    total_amount: string;
    payment_method: string;
    transaction_date: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateData: boolean;
  };
}

// Sales report notification
export interface SalesReportNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  sale_id?: string;
  created_at: string;
  read: boolean;
}

// Sales report settings
export interface SalesReportSettings {
  default_date_range: number; // days
  default_payment_method: string;
  default_status: string;
  auto_refresh_interval: number; // minutes
  chart_types: string[];
  export_format: string;
  notification_enabled: boolean;
  notification_types: string[];
}

// Sales report performance metrics
export interface SalesReportPerformance {
  total_reports_generated: number;
  average_generation_time: number;
  most_used_filters: string[];
  most_exported_formats: string[];
  user_activity: Array<{
    user_id: string;
    user_name: string;
    reports_generated: number;
    last_activity: string;
  }>;
}

// Sales report audit log
export interface SalesReportAuditLog {
  id: string;
  action: 'report_generated' | 'report_exported' | 'filter_applied' | 'settings_updated';
  report_id?: string;
  user_id: string;
  user_name: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// Sales report template
export interface SalesReportTemplate {
  id: string;
  name: string;
  description?: string;
  filters: SalesReportFilters;
  columns: string[];
  chart_types: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Sales report schedule
export interface SalesReportSchedule {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  last_run?: string;
  next_run: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Sales report alert
export interface SalesReportAlert {
  id: string;
  type: 'threshold_exceeded' | 'anomaly_detected' | 'goal_achieved' | 'warning';
  metric: string;
  threshold: number;
  current_value: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Sales report dashboard data
export interface SalesReportDashboardData {
  stats: SalesReportStats;
  recentSales: SalesReportSale[];
  topProducts: ProductPerformance[];
  topCategories: CategoryPerformance[];
  paymentBreakdown: PaymentMethodBreakdown[];
  dailyRevenue: DailyRevenue[];
  alerts: SalesReportAlert[];
  performance: SalesReportPerformance;
}

// Sales report search result
export interface SalesReportSearchResult {
  id: string;
  type: 'sale' | 'product' | 'customer' | 'cashier';
  title: string;
  description: string;
  metadata: Record<string, unknown>;
}

// Sales report bulk action
export interface SalesReportBulkAction {
  sale_ids: string[];
  action: 'export' | 'refund' | 'update_status' | 'delete';
  options?: Record<string, unknown>;
}

// Sales report conflict
export interface SalesReportConflict {
  id: string;
  type: 'data_conflict' | 'permission_conflict' | 'validation_conflict';
  description: string;
  affected_sales: string[];
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

// Sales report comparison
export interface SalesReportComparison {
  id: string;
  name: string;
  description?: string;
  base_period: {
    start: Date;
    end: Date;
  };
  compare_period: {
    start: Date;
    end: Date;
  };
  metrics: Array<{
    name: string;
    base_value: number;
    compare_value: number;
    difference: number;
    percentage_change: number;
  }>;
  created_at: string;
  created_by: string;
}

// Sales report trend
export interface SalesReportTrend {
  id: string;
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

// Sales report forecast
export interface SalesReportForecast {
  id: string;
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

// Sales report insight
export interface SalesReportInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
}

// Sales report widget
export interface SalesReportWidget {
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

// Sales report dashboard
export interface SalesReportDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: SalesReportWidget[];
  layout: 'grid' | 'list' | 'custom';
  created_at: string;
  updated_at: string;
  created_by: string;
  is_public: boolean;
  shared_with: string[];
}

// Sales report sharing
export interface SalesReportSharing {
  id: string;
  report_id: string;
  shared_with_user_ids: string[];
  shared_with_role_ids: string[];
  share_link?: string;
  expires_at?: string;
  permissions: string[];
  created_at: string;
  created_by: string;
}

// Sales report comment
export interface SalesReportComment {
  id: string;
  report_id: string;
  user_id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
}

// Sales report bookmark
export interface SalesReportBookmark {
  id: string;
  user_id: string;
  report_id: string;
  name: string;
  filters: SalesReportFilters;
  created_at: string;
  updated_at: string;
}

// Sales report integration
export interface SalesReportIntegration {
  id: string;
  name: string;
  type: 'export' | 'import' | 'sync' | 'webhook';
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Sales report backup
export interface SalesReportBackup {
  id: string;
  name: string;
  description?: string;
  data: {
    reports: SalesReportSale[];
    templates: SalesReportTemplate[];
    settings: SalesReportSettings;
  };
  created_at: string;
  created_by: string;
}

// Sales report restore
export interface SalesReportRestore {
  id: string;
  backup_id: string;
  options: {
    restoreReports: boolean;
    restoreTemplates: boolean;
    restoreSettings: boolean;
  };
  created_at: string;
  created_by: string;
}
