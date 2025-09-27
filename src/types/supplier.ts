// ============================================================================
// SUPPLIER RELATED TYPES
// ============================================================================

import { Supplier as DatabaseSupplier } from './database';

// Supplier management component props
export interface SupplierProps {
  onBack: () => void;
}

// Extended supplier interface for UI display
export interface Supplier extends DatabaseSupplier {
  // Additional computed fields for UI display
  display_name: string;
  status_color: string;
  status_label: string;
  contact_summary: string;
  location_summary: string;
  performance_score: number;
  last_activity: string;
  total_orders: number;
  total_value: number;
  average_order_value: number;
  on_time_delivery_rate: number;
  quality_rating: number;
}

// Supplier form data
export interface SupplierFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
}

// Supplier filters
export interface SupplierFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  locationFilter: string;
  performanceFilter: 'all' | 'high' | 'medium' | 'low';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

// Supplier statistics
export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  totalValue: number;
  averageOrderValue: number;
  topSuppliers: Supplier[];
  recentActivity: Array<{
    supplier_id: string;
    supplier_name: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

// Supplier table column
export interface SupplierColumn {
  key: string;
  label: string;
  render: (supplier: Supplier) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

// Supplier action
export interface SupplierAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (supplier: Supplier) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (supplier: Supplier) => boolean;
}

// Supplier state
export interface SupplierState {
  searchTerm: string;
  statusFilter: string;
  locationFilter: string;
  performanceFilter: string;
  selectedSupplier: Supplier | null;
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  showDetailsDialog: boolean;
  currentTab: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Supplier export options
export interface SupplierExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeOrders: boolean;
  includeProducts: boolean;
  includePerformance: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: SupplierFilters;
}

// Supplier import options
export interface SupplierImportOptions {
  file: File;
  mapping: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateData: boolean;
  };
}

// Supplier notification
export interface SupplierNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  supplier_id?: string;
  created_at: string;
  read: boolean;
}

// Supplier settings
export interface SupplierSettings {
  default_currency: string;
  auto_approval: boolean;
  minimum_order_value: number;
  payment_terms: string;
  delivery_lead_time: number;
  notification_enabled: boolean;
  notification_types: string[];
  performance_thresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

// Supplier performance metrics
export interface SupplierPerformance {
  supplier_id: string;
  period: string;
  metrics: {
    total_orders: number;
    total_value: number;
    average_order_value: number;
    on_time_delivery_rate: number;
    quality_rating: number;
    response_time: number;
    defect_rate: number;
    return_rate: number;
  };
  trends: {
    order_trend: 'up' | 'down' | 'stable';
    value_trend: 'up' | 'down' | 'stable';
    quality_trend: 'up' | 'down' | 'stable';
  };
  benchmarks: {
    vs_industry_average: number;
    vs_previous_period: number;
  };
}

// Supplier audit log
export interface SupplierAuditLog {
  id: string;
  supplier_id: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'order_placed' | 'order_received';
  details: Record<string, unknown>;
  performed_by: string;
  performed_by_name: string;
  timestamp: string;
}

// Supplier template
export interface SupplierTemplate {
  id: string;
  name: string;
  description?: string;
  supplier_data: SupplierFormData;
  default_terms: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Supplier comparison
export interface SupplierComparison {
  id: string;
  name: string;
  description?: string;
  supplier_id_1: string;
  supplier_id_2: string;
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

// Supplier trend
export interface SupplierTrend {
  id: string;
  supplier_id: string;
  metric: string;
  period: string;
  data: Array<{
    date: string;
    value: number;
    change: number;
    percentage_change: number;
  }>;
  analysis: string;
  created_at: string;
  updated_at: string;
}

// Supplier forecast
export interface SupplierForecast {
  id: string;
  supplier_id: string;
  metric: string;
  period: string;
  forecast_data: Array<{
    date: string;
    value: number;
    confidence_interval_lower: number;
    confidence_interval_upper: number;
  }>;
  accuracy_metrics: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Supplier insight
export interface SupplierInsight {
  id: string;
  supplier_id: string;
  type: 'opportunity' | 'risk' | 'observation';
  title: string;
  description: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

// Supplier widget
export interface SupplierWidget {
  id: string;
  supplier_id: string;
  type: 'chart' | 'table' | 'metric' | 'list';
  title: string;
  config: Record<string, unknown>;
  data_source: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  created_at: string;
  updated_at: string;
}

// Supplier dashboard
export interface SupplierDashboard {
  id: string;
  supplier_id: string;
  name: string;
  description?: string;
  widgets: SupplierWidget[];
  layout: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Supplier sharing
export interface SupplierSharing {
  id: string;
  supplier_id: string;
  shared_by_user_id: string;
  shared_with_user_id: string;
  permission_level: 'viewer' | 'editor' | 'admin';
  created_at: string;
  expires_at?: string;
}

// Supplier comment
export interface SupplierComment {
  id: string;
  supplier_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
}

// Supplier bookmark
export interface SupplierBookmark {
  id: string;
  supplier_id: string;
  user_id: string;
  created_at: string;
}

// Supplier integration
export interface SupplierIntegration {
  id: string;
  supplier_id: string;
  type: 'erp' | 'inventory_management' | 'accounting' | 'communication';
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, unknown>;
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Supplier backup
export interface SupplierBackup {
  id: string;
  supplier_id: string;
  timestamp: string;
  size_bytes: number;
  location: string;
  created_by_user_id: string;
  status: 'completed' | 'failed' | 'in_progress';
}

// Supplier restore
export interface SupplierRestore {
  id: string;
  supplier_id: string;
  backup_id: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiated_by_user_id: string;
  error_message?: string;
}
