// ============================================================================
// SUPPLY MANAGEMENT RELATED TYPES
// ============================================================================

import { 
  SupplyOrder, 
  SupplyOrderItem, 
  SupplyPayment, 
  SupplyReturn, 
  SupplyReturnItem,
  SupplyOrderSummary as DatabaseSupplyOrderSummary,
  PendingReturns as DatabasePendingReturns
} from './database';

// Supply management component props
export interface SupplyProps {
  onBack: () => void;
}

// Extended supply order interface for UI display
export interface SupplyOrderDisplay extends SupplyOrder {
  // Additional computed fields for UI display
  display_status: string;
  status_color: string;
  status_badge: string;
  formatted_amount: string;
  formatted_date: string;
  customer_summary: string;
  cashier_summary: string;
  store_summary: string;
  items_summary: string;
  progress_percentage: number;
  days_since_supply: number;
  is_overdue: boolean;
  can_return: boolean;
  can_accept_return: boolean;
  can_cancel: boolean;
}

// Supply order summary for lists
export interface SupplyOrderSummary extends DatabaseSupplyOrderSummary {
  // Additional computed fields
  display_status: string;
  status_color: string;
  status_badge: string;
  formatted_amount: string;
  formatted_date: string;
  customer_summary: string;
  cashier_summary: string;
  store_summary: string;
  items_summary: string;
  progress_percentage: number;
  days_since_supply: number;
  is_overdue: boolean;
  can_return: boolean;
  can_accept_return: boolean;
  can_cancel: boolean;
}

// Pending return for UI display
export interface PendingReturn extends DatabasePendingReturns {
  // Additional computed fields
  display_status: string;
  status_color: string;
  status_badge: string;
  formatted_date: string;
  customer_summary: string;
  days_pending: number;
  is_overdue: boolean;
  can_accept: boolean;
  can_reject: boolean;
}

// Supply order form data
export interface SupplyOrderFormData {
  store_id: string;
  customer_id: string;
  cashier_id: string;
  supply_number: string;
  status: 'supplied' | 'partially_returned' | 'fully_returned' | 'completed' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  supply_date: string;
  expected_return_date?: string;
  items: SupplyOrderItemFormData[];
}

// Supply order item form data
export interface SupplyOrderItemFormData {
  product_id: string;
  quantity_supplied: number;
  quantity_returned: number;
  quantity_accepted: number;
  unit_price: number;
  total_price: number;
  return_reason?: string;
}

// Supply payment form data
export interface SupplyPaymentFormData {
  supply_order_id: string;
  payment_number: string;
  payment_method: 'cash' | 'card' | 'mobile' | 'other';
  amount_paid: number;
  payment_date: string;
  processed_by?: string;
  notes?: string;
}

// Supply return form data
export interface SupplyReturnFormData {
  supply_order_id: string;
  return_number: string;
  return_reason: string;
  return_date: string;
  processed_by?: string;
  notes?: string;
  items: SupplyReturnItemFormData[];
}

// Supply return item form data
export interface SupplyReturnItemFormData {
  supply_order_item_id: string;
  quantity_returned: number;
  return_reason: string;
  condition: 'good' | 'damaged' | 'defective';
  notes?: string;
}

// Supply filters
export interface SupplyFilters {
  searchTerm: string;
  statusFilter: 'all' | 'supplied' | 'partially_returned' | 'fully_returned' | 'completed' | 'cancelled';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  customerFilter: string;
  cashierFilter: string;
  storeFilter: string;
}

// Supply statistics
export interface SupplyStats {
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  totalItems: number;
  totalQuantitySupplied: number;
  totalQuantityReturned: number;
  totalQuantityAccepted: number;
  returnRate: number;
  acceptanceRate: number;
  overdueOrders: number;
  pendingReturns: number;
  recentActivity: Array<{
    order_id: string;
    order_number: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

// Supply table column
export interface SupplyColumn {
  key: string;
  label: string;
  render: (order: SupplyOrderSummary) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

// Supply action
export interface SupplyAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (order: SupplyOrderSummary) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (order: SupplyOrderSummary) => boolean;
}

// Supply state
export interface SupplyState {
  searchTerm: string;
  statusFilter: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  selectedOrder: SupplyOrderSummary | null;
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  showDetailDialog: boolean;
  showReturnDialog: boolean;
  showPaymentDialog: boolean;
  showAcceptReturnDialog: boolean;
  currentTab: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Supply export options
export interface SupplyExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeItems: boolean;
  includePayments: boolean;
  includeReturns: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: SupplyFilters;
}

// Supply import options
export interface SupplyImportOptions {
  file: File;
  mapping: {
    supply_number: string;
    customer_id: string;
    cashier_id: string;
    supply_date: string;
    total_amount: string;
    status: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateData: boolean;
  };
}

// Supply notification
export interface SupplyNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  order_id?: string;
  created_at: string;
  read: boolean;
}

// Supply settings
export interface SupplySettings {
  default_payment_method: string;
  default_return_period_days: number;
  auto_approve_returns: boolean;
  require_return_reason: boolean;
  notification_enabled: boolean;
  notification_types: string[];
  performance_thresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

// Supply performance metrics
export interface SupplyPerformance {
  order_id: string;
  period: string;
  metrics: {
    total_orders: number;
    total_value: number;
    average_order_value: number;
    return_rate: number;
    acceptance_rate: number;
    average_processing_time: number;
    customer_satisfaction: number;
  };
  trends: {
    order_trend: 'up' | 'down' | 'stable';
    value_trend: 'up' | 'down' | 'stable';
    return_trend: 'up' | 'down' | 'stable';
  };
  benchmarks: {
    vs_previous_period: number;
    vs_target: number;
  };
}

// Supply audit log
export interface SupplyAuditLog {
  id: string;
  order_id: string;
  action: 'create' | 'update' | 'delete' | 'return' | 'accept_return' | 'payment' | 'cancel';
  details: Record<string, unknown>;
  performed_by: string;
  performed_by_name: string;
  timestamp: string;
}

// Supply template
export interface SupplyTemplate {
  id: string;
  name: string;
  description?: string;
  order_data: SupplyOrderFormData;
  default_items: SupplyOrderItemFormData[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Supply comparison
export interface SupplyComparison {
  id: string;
  name: string;
  description?: string;
  order_id_1: string;
  order_id_2: string;
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

// Supply trend
export interface SupplyTrend {
  id: string;
  order_id: string;
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

// Supply forecast
export interface SupplyForecast {
  id: string;
  order_id: string;
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

// Supply insight
export interface SupplyInsight {
  id: string;
  order_id: string;
  type: 'opportunity' | 'risk' | 'observation';
  title: string;
  description: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

// Supply widget
export interface SupplyWidget {
  id: string;
  order_id: string;
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

// Supply dashboard
export interface SupplyDashboard {
  id: string;
  order_id: string;
  name: string;
  description?: string;
  widgets: SupplyWidget[];
  layout: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Supply sharing
export interface SupplySharing {
  id: string;
  order_id: string;
  shared_by_user_id: string;
  shared_with_user_id: string;
  permission_level: 'viewer' | 'editor' | 'admin';
  created_at: string;
  expires_at?: string;
}

// Supply comment
export interface SupplyComment {
  id: string;
  order_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
}

// Supply bookmark
export interface SupplyBookmark {
  id: string;
  order_id: string;
  user_id: string;
  created_at: string;
}

// Supply integration
export interface SupplyIntegration {
  id: string;
  order_id: string;
  type: 'erp' | 'inventory_management' | 'accounting' | 'payment_gateway';
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, unknown>;
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Supply backup
export interface SupplyBackup {
  id: string;
  order_id: string;
  timestamp: string;
  size_bytes: number;
  location: string;
  created_by_user_id: string;
  status: 'completed' | 'failed' | 'in_progress';
}

// Supply restore
export interface SupplyRestore {
  id: string;
  order_id: string;
  backup_id: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiated_by_user_id: string;
  error_message?: string;
}
