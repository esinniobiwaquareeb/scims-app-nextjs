// ============================================================================
// STAFF DETAIL SPECIFIC TYPES
// ============================================================================

import React from 'react';
import { User, Sale } from './database';
import { Staff } from './staff';

// Staff detail component props
export interface StaffDetailProps {
  onBack: () => void;
  staffMember: Staff | null;
}

// Extended staff interface for detail view
export interface StaffDetail extends Staff {
  // Additional computed fields for detail view
  full_name: string;
  display_name: string;
  initials: string;
  status_color: string;
  status_label: string;
  role_color: string;
  role_label: string;
  last_activity: string;
  performance_score: number;
  sales_trend: 'up' | 'down' | 'stable';
  activity_level: 'high' | 'medium' | 'low';
}

// Staff sale interface for detail view
export interface StaffSale extends Sale {
  // Additional computed fields for staff sales
  formatted_amount: string;
  formatted_date: string;
  formatted_time: string;
  payment_icon: React.ElementType;
  status_color: string;
  status_label: string;
  customer_name: string;
  items_count: number;
  items_summary: string;
}

// Staff activity interface
export interface StaffActivity {
  id: string;
  type: 'sale' | 'login' | 'logout' | 'password_change' | 'profile_update' | 'permission_change';
  description: string;
  timestamp: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// Staff performance metrics
export interface StaffPerformance {
  total_sales: number;
  total_revenue: number;
  average_sale_value: number;
  sales_count: number;
  conversion_rate: number;
  customer_satisfaction: number;
  efficiency_score: number;
  attendance_rate: number;
  last_30_days: {
    sales: number;
    revenue: number;
    growth: number;
  };
  last_7_days: {
    sales: number;
    revenue: number;
    growth: number;
  };
  today: {
    sales: number;
    revenue: number;
  };
}

// Staff filters
export interface StaffDetailFilters {
  searchTerm: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter: 'all' | 'active' | 'inactive';
  activityFilter: 'all' | 'sales' | 'login' | 'logout' | 'other';
}

// Staff statistics
export interface StaffDetailStats {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  salesCount: number;
  conversionRate: number;
  customerSatisfaction: number;
  efficiencyScore: number;
  attendanceRate: number;
  lastLogin: string;
  accountAge: number;
  performanceTrend: 'up' | 'down' | 'stable';
}

// Staff table column
export interface StaffDetailColumn {
  key: string;
  label: string;
  render: (item: StaffSale | StaffActivity) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

// Staff action
export interface StaffDetailAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (item: StaffSale | StaffActivity) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (item: StaffSale | StaffActivity) => boolean;
}

// Staff detail state
export interface StaffDetailState {
  searchTerm: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter: string;
  activityFilter: string;
  selectedSale: StaffSale | null;
  selectedActivity: StaffActivity | null;
  showSaleDetail: boolean;
  showActivityDetail: boolean;
  currentTab: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Staff export options
export interface StaffDetailExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeSales: boolean;
  includeActivity: boolean;
  includePerformance: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: StaffDetailFilters;
}

// Staff import options
export interface StaffDetailImportOptions {
  file: File;
  mapping: {
    name: string;
    email: string;
    phone: string;
    role: string;
    permissions: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateData: boolean;
  };
}

// Staff notification
export interface StaffDetailNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  staff_id?: string;
  created_at: string;
  read: boolean;
}

// Staff settings
export interface StaffDetailSettings {
  auto_refresh_interval: number; // minutes
  default_date_range: number; // days
  chart_types: string[];
  export_format: string;
  notification_enabled: boolean;
  notification_types: string[];
  performance_thresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

// Staff performance metrics
export interface StaffDetailPerformance {
  staff_id: string;
  period: string;
  metrics: StaffPerformance;
  trends: {
    sales_trend: 'up' | 'down' | 'stable';
    revenue_trend: 'up' | 'down' | 'stable';
    efficiency_trend: 'up' | 'down' | 'stable';
  };
  benchmarks: {
    vs_team_average: number;
    vs_previous_period: number;
    vs_company_goal: number;
  };
  created_at: string;
  updated_at: string;
}

// Staff audit log
export interface StaffDetailAuditLog {
  id: string;
  staff_id: string;
  action: 'view' | 'edit' | 'delete' | 'export' | 'password_reset' | 'permission_change';
  details: Record<string, unknown>;
  performed_by: string;
  performed_by_name: string;
  timestamp: string;
}

// Staff template
export interface StaffDetailTemplate {
  id: string;
  name: string;
  description?: string;
  filters: StaffDetailFilters;
  columns: string[];
  chart_types: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Staff schedule
export interface StaffDetailSchedule {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Staff alert
export interface StaffDetailAlert {
  id: string;
  staff_id: string;
  type: 'performance_low' | 'attendance_issue' | 'security_concern' | 'goal_achieved';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Staff dashboard data
export interface StaffDetailDashboardData {
  staff: StaffDetail;
  performance: StaffPerformance;
  recentSales: StaffSale[];
  recentActivity: StaffActivity[];
  alerts: StaffDetailAlert[];
  stats: StaffDetailStats;
}

// Staff search result
export interface StaffDetailSearchResult {
  id: string;
  type: 'sale' | 'activity' | 'staff';
  title: string;
  description: string;
  metadata: Record<string, unknown>;
}

// Staff bulk action
export interface StaffDetailBulkAction {
  item_ids: string[];
  action: 'export' | 'delete' | 'update_status';
  options?: Record<string, unknown>;
}

// Staff conflict
export interface StaffDetailConflict {
  id: string;
  type: 'data_conflict' | 'permission_conflict' | 'validation_conflict';
  description: string;
  affected_items: string[];
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

// Staff comparison
export interface StaffDetailComparison {
  id: string;
  name: string;
  description?: string;
  staff_id_1: string;
  staff_id_2: string;
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

// Staff trend
export interface StaffDetailTrend {
  id: string;
  staff_id: string;
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

// Staff forecast
export interface StaffDetailForecast {
  id: string;
  staff_id: string;
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

// Staff insight
export interface StaffDetailInsight {
  id: string;
  staff_id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
}

// Staff widget
export interface StaffDetailWidget {
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

// Staff dashboard
export interface StaffDetailDashboard {
  id: string;
  staff_id: string;
  name: string;
  description?: string;
  widgets: StaffDetailWidget[];
  layout: 'grid' | 'list' | 'custom';
  created_at: string;
  updated_at: string;
  is_public: boolean;
  shared_with: string[];
}

// Staff sharing
export interface StaffDetailSharing {
  id: string;
  staff_id: string;
  shared_with_user_ids: string[];
  shared_with_role_ids: string[];
  share_link?: string;
  expires_at?: string;
  permissions: string[];
  created_at: string;
  created_by: string;
}

// Staff comment
export interface StaffDetailComment {
  id: string;
  staff_id: string;
  user_id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
}

// Staff bookmark
export interface StaffDetailBookmark {
  id: string;
  user_id: string;
  staff_id: string;
  name: string;
  filters: StaffDetailFilters;
  created_at: string;
  updated_at: string;
}

// Staff integration
export interface StaffDetailIntegration {
  id: string;
  name: string;
  type: 'export' | 'import' | 'sync' | 'webhook';
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Staff backup
export interface StaffDetailBackup {
  id: string;
  staff_id: string;
  name: string;
  description?: string;
  data: {
    staff: StaffDetail;
    sales: StaffSale[];
    activities: StaffActivity[];
    performance: StaffPerformance;
  };
  created_at: string;
  created_by: string;
}

// Staff restore
export interface StaffDetailRestore {
  id: string;
  backup_id: string;
  staff_id: string;
  options: {
    restoreStaff: boolean;
    restoreSales: boolean;
    restoreActivities: boolean;
    restorePerformance: boolean;
  };
  created_at: string;
  created_by: string;
}
