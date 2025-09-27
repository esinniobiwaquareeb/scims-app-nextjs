/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// REPORT SPECIFIC TYPES
// ============================================================================

import React from 'react';
import { Product, Sale, Customer } from './database';
import { DateRange } from 'react-day-picker';

// Report component props
export interface ReportProps {
  onBack: () => void;
}

// Transformed sales data for reporting
export interface TransformedSalesData {
  id: string;
  date: Date;
  customerName: string;
  products: string[];
  total: number;
  payment: string;
  cashier: string;
  storeId: string;
}

// Raw sales data from API (updated to match actual API response)
export interface RawSalesData {
  id: string;
  created_at?: string;
  transaction_date?: string;
  customer?: { name: string };
  sale_item?: Array<{ product?: { name: string } }>;
  total_amount?: string | number;
  payment_method?: string;
  cashier?: { username: string };
  store_id?: string;
}

// Product performance data
export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  soldQuantity: number;
  revenue: number;
  profit: number;
}

// Customer data for reporting
export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  totalSpent: number;
  avgOrderValue: number;
  lastVisit: string | null;
  firstVisit: string | null;
}

// Top sale data
export interface TopSaleData {
  id: string;
  date: Date;
  customerName: string;
  amount: number;
  itemsCount: number;
  paymentMethod: string;
  cashier: string;
  storeId: string;
}

// Report filters
export interface ReportFilters {
  searchTerm: string;
  dateRange: DateRange;
  selectedCategory: string;
  selectedPayment: string;
  selectedStore: string;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}

// Report statistics
export interface ReportStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  topSellingProduct: string;
  topCustomer: string;
  revenueGrowth: number;
  salesGrowth: number;
  customerGrowth: number;
}

// Report table column
export interface ReportColumn {
  key: string;
  label: string;
  render: (data: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

// Report chart data
export interface ReportChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
  color?: string;
}

// Report export options
export interface ReportExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeCharts?: boolean;
  includeRawData?: boolean;
  dateRange?: DateRange;
  filters?: ReportFilters;
}

// Report dashboard data
export interface ReportDashboardData {
  salesStats: ReportStats;
  productPerformance: ProductPerformance[];
  customerAnalytics: CustomerData[];
  topSales: TopSaleData[];
  chartData: ReportChartData[];
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    amount?: number;
  }>;
}

// Report section
export interface ReportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ElementType;
  enabled: boolean;
}

// Report tab
export interface ReportTab {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ElementType;
  enabled: boolean;
}

// Report widget
export interface ReportWidget {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric' | 'list';
  data: any;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
  enabled: boolean;
}

// Report template
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  widgets: ReportWidget[];
  filters: ReportFilters;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Report schedule
export interface ReportSchedule {
  id: string;
  name: string;
  template_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  enabled: boolean;
  last_run?: string;
  next_run: string;
  created_at: string;
  updated_at: string;
}

// Report notification
export interface ReportNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  report_id?: string;
  created_at: string;
  read: boolean;
}

// Report settings
export interface ReportSettings {
  defaultDateRange: number; // days
  defaultPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  chartColors: string[];
  exportFormat: 'csv' | 'json' | 'xlsx' | 'pdf';
  emailReports: boolean;
  emailRecipients: string[];
}

// Report performance metrics
export interface ReportPerformance {
  totalReports: number;
  generatedReports: number;
  failedReports: number;
  averageGenerationTime: number;
  mostPopularTemplate: string;
  reportUsageByDay: Array<{
    date: string;
    reports: number;
  }>;
  reportUsageByUser: Array<{
    user_id: string;
    user_name: string;
    reports: number;
  }>;
}

// Report audit log
export interface ReportAuditLog {
  id: string;
  action: 'report_generated' | 'report_exported' | 'report_shared' | 'report_deleted' | 'template_created' | 'template_updated' | 'template_deleted';
  report_id?: string;
  template_id?: string;
  user_id: string;
  user_name: string;
  details: Record<string, any>;
  timestamp: string;
}

// Report sharing
export interface ReportSharing {
  id: string;
  report_id: string;
  shared_with: string[];
  permissions: 'view' | 'edit' | 'admin';
  expires_at?: string;
  created_at: string;
  created_by: string;
}

// Report comment
export interface ReportComment {
  id: string;
  report_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

// Report bookmark
export interface ReportBookmark {
  id: string;
  report_id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

// Report comparison
export interface ReportComparison {
  id: string;
  name: string;
  description: string;
  base_report_id: string;
  compare_report_id: string;
  comparison_metrics: string[];
  created_at: string;
  created_by: string;
}

// Report alert
export interface ReportAlert {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  enabled: boolean;
  recipients: string[];
  last_triggered?: string;
  created_at: string;
  created_by: string;
}

// Report data source
export interface ReportDataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'external';
  connection_string?: string;
  api_endpoint?: string;
  file_path?: string;
  credentials?: Record<string, any>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Report field mapping
export interface ReportFieldMapping {
  id: string;
  report_id: string;
  source_field: string;
  target_field: string;
  transformation?: string;
  created_at: string;
}

// Report validation
export interface ReportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Report cache
export interface ReportCache {
  id: string;
  report_id: string;
  data: any;
  expires_at: string;
  created_at: string;
}
