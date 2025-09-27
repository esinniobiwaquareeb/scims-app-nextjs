// ============================================================================
// SUBSCRIPTION RELATED TYPES
// ============================================================================

import { SubscriptionPlan as DatabaseSubscriptionPlan } from './database';

// Subscription management component props
export interface SubscriptionProps {
  onBack: () => void;
}

// Extended subscription plan interface for UI display
export interface SubscriptionPlan extends DatabaseSubscriptionPlan {
  // Additional computed fields for UI display
  display_name: string;
  status_color: string;
  status_label: string;
  price_display: {
    monthly: string;
    yearly: string;
    savings: string;
  };
  feature_count: number;
  is_popular: boolean;
  popularity_badge: string;
}

// Subscription plan input for forms
export interface SubscriptionPlanInput {
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_stores: number;
  max_products: number;
  max_users: number;
  is_active: boolean;
  display_order: number;
  is_popular?: boolean;
}

// Subscription plan statistics
export interface SubscriptionPlanStats {
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  averageMonthlyPrice: number;
  averageYearlyPrice: number;
  highestMonthlyPrice: number;
  highestYearlyPrice: number;
  totalRevenue: number;
  popularPlans: SubscriptionPlan[];
  recentActivity: Array<{
    plan_id: string;
    plan_name: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

// Subscription plan filters
export interface SubscriptionPlanFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  priceRange: {
    min: number;
    max: number;
  };
  featureFilter: string[];
}

// Subscription plan form data
export interface SubscriptionPlanFormData {
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_stores: number;
  max_products: number;
  max_users: number;
  is_active: boolean;
  display_order: number;
  is_popular: boolean;
}

// Subscription plan table column
export interface SubscriptionPlanColumn {
  key: string;
  label: string;
  render: (plan: SubscriptionPlan) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

// Subscription plan action
export interface SubscriptionPlanAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (plan: SubscriptionPlan) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (plan: SubscriptionPlan) => boolean;
}

// Subscription plan state
export interface SubscriptionPlanState {
  searchTerm: string;
  statusFilter: string;
  selectedPlan: SubscriptionPlan | null;
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  currentTab: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Subscription plan export options
export interface SubscriptionPlanExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeFeatures: boolean;
  includeStats: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: SubscriptionPlanFilters;
}

// Subscription plan import options
export interface SubscriptionPlanImportOptions {
  file: File;
  mapping: {
    name: string;
    description: string;
    price_monthly: string;
    price_yearly: string;
    features: string;
    max_stores: string;
    max_products: string;
    max_users: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateData: boolean;
  };
}

// Subscription plan notification
export interface SubscriptionPlanNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  plan_id?: string;
  created_at: string;
  read: boolean;
}

// Subscription plan settings
export interface SubscriptionPlanSettings {
  default_currency: string;
  default_billing_cycle: 'monthly' | 'yearly';
  auto_renewal: boolean;
  trial_period_days: number;
  grace_period_days: number;
  notification_enabled: boolean;
  notification_types: string[];
  pricing_tiers: {
    basic: number;
    standard: number;
    premium: number;
    enterprise: number;
  };
}

// Subscription plan performance metrics
export interface SubscriptionPlanPerformance {
  plan_id: string;
  period: string;
  metrics: {
    total_subscriptions: number;
    new_subscriptions: number;
    cancellations: number;
    revenue: number;
    average_revenue_per_user: number;
    churn_rate: number;
    conversion_rate: number;
  };
  trends: {
    subscription_trend: 'up' | 'down' | 'stable';
    revenue_trend: 'up' | 'down' | 'stable';
    churn_trend: 'up' | 'down' | 'stable';
  };
  benchmarks: {
    vs_industry_average: number;
    vs_previous_period: number;
  };
}

// Subscription plan audit log
export interface SubscriptionPlanAuditLog {
  id: string;
  plan_id: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'feature_change' | 'price_change';
  details: Record<string, unknown>;
  performed_by: string;
  performed_by_name: string;
  timestamp: string;
}

// Subscription plan template
export interface SubscriptionPlanTemplate {
  id: string;
  name: string;
  description?: string;
  plan_data: SubscriptionPlanFormData;
  default_features: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Subscription plan comparison
export interface SubscriptionPlanComparison {
  id: string;
  name: string;
  description?: string;
  plan_id_1: string;
  plan_id_2: string;
  features: Array<{
    feature: string;
    plan_1_value: string | boolean;
    plan_2_value: string | boolean;
    difference: string;
  }>;
  pricing: {
    monthly_1: number;
    monthly_2: number;
    yearly_1: number;
    yearly_2: number;
    savings_1: number;
    savings_2: number;
  };
  created_at: string;
  created_by: string;
}

// Subscription plan trend
export interface SubscriptionPlanTrend {
  id: string;
  plan_id: string;
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

// Subscription plan forecast
export interface SubscriptionPlanForecast {
  id: string;
  plan_id: string;
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

// Subscription plan insight
export interface SubscriptionPlanInsight {
  id: string;
  plan_id: string;
  type: 'opportunity' | 'risk' | 'observation';
  title: string;
  description: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

// Subscription plan widget
export interface SubscriptionPlanWidget {
  id: string;
  plan_id: string;
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

// Subscription plan dashboard
export interface SubscriptionPlanDashboard {
  id: string;
  plan_id: string;
  name: string;
  description?: string;
  widgets: SubscriptionPlanWidget[];
  layout: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Subscription plan sharing
export interface SubscriptionPlanSharing {
  id: string;
  plan_id: string;
  shared_by_user_id: string;
  shared_with_user_id: string;
  permission_level: 'viewer' | 'editor' | 'admin';
  created_at: string;
  expires_at?: string;
}

// Subscription plan comment
export interface SubscriptionPlanComment {
  id: string;
  plan_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
}

// Subscription plan bookmark
export interface SubscriptionPlanBookmark {
  id: string;
  plan_id: string;
  user_id: string;
  created_at: string;
}

// Subscription plan integration
export interface SubscriptionPlanIntegration {
  id: string;
  plan_id: string;
  type: 'payment_gateway' | 'billing_system' | 'analytics' | 'crm';
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, unknown>;
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Subscription plan backup
export interface SubscriptionPlanBackup {
  id: string;
  plan_id: string;
  timestamp: string;
  size_bytes: number;
  location: string;
  created_by_user_id: string;
  status: 'completed' | 'failed' | 'in_progress';
}

// Subscription plan restore
export interface SubscriptionPlanRestore {
  id: string;
  plan_id: string;
  backup_id: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiated_by_user_id: string;
  error_message?: string;
}
