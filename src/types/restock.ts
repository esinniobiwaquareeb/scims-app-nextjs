// ============================================================================
// RESTOCK MANAGEMENT SPECIFIC TYPES
// ============================================================================

import React from 'react';
import { RestockOrder, RestockItem, Product, Supplier } from './database';
import { RestockOrderFormData, RestockItemFormData } from './forms';

// Restock management component props
export interface RestockProps {
  onBack: () => void;
}

// Extended restock order interface for UI display
export interface RestockOrderDisplay extends RestockOrder {
  supplier?: {
    name: string;
    contact_person: string;
    phone: string;
  };
  items?: RestockItemDisplay[];
  total_items: number;
  total_quantity: number;
  status_label: string;
  status_color: string;
  can_edit: boolean;
  can_cancel: boolean;
  can_receive: boolean;
}

// Extended restock item interface for UI display
export interface RestockItemDisplay extends RestockItem {
  product?: {
    name: string;
    sku: string;
    current_stock: number;
    reorder_level: number;
    min_stock_level: number;
    image_url?: string;
  };
  supplier?: {
    name: string;
  };
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// Product interface for restock management
export interface RestockProduct extends Product {
  suppliers?: {
    name: string;
  };
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  days_until_out_of_stock?: number;
  suggested_quantity: number;
}

// Supplier interface for restock management
export interface RestockSupplier extends Supplier {
  total_orders: number;
  total_amount: number;
  last_order_date?: string;
  average_delivery_time: number;
  reliability_score: number;
}

// Restock filters
export interface RestockFilters {
  searchTerm: string;
  statusFilter: 'all' | 'pending' | 'ordered' | 'received' | 'cancelled';
  supplierFilter: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

// Restock statistics
export interface RestockStats {
  totalOrders: number;
  pendingOrders: number;
  orderedOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  totalValue: number;
  averageOrderValue: number;
  totalItems: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

// Restock table column
export interface RestockColumn {
  key: string;
  label: string;
  render: (order: RestockOrderDisplay) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

// Restock action
export interface RestockAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (order: RestockOrderDisplay) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (order: RestockOrderDisplay) => boolean;
}

// Restock state
export interface RestockState {
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showReceiveDialog: boolean;
  selectedOrder: RestockOrderDisplay | null;
  searchTerm: string;
  statusFilter: string;
  supplierFilter: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

// Restock form data
export type RestockFormData = RestockOrderFormData;

// Restock validation errors
export interface RestockValidationErrors {
  supplier_id?: string;
  notes?: string;
  expected_delivery?: string;
  items?: string;
  general?: string;
}

// Restock export options
export interface RestockExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeItems?: boolean;
  includeSupplier?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  statusFilter?: string;
}

// Restock import options
export interface RestockImportOptions {
  file: File;
  mapping: {
    supplier_id: string;
    notes: string;
    expected_delivery: string;
    items: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateSuppliers: boolean;
    validateProducts: boolean;
  };
}

// Restock notification
export interface RestockNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  order_id?: string;
  created_at: string;
  read: boolean;
}

// Restock settings
export interface RestockSettings {
  auto_reorder: boolean;
  reorder_threshold: number;
  notification_enabled: boolean;
  notification_types: string[];
  default_supplier: string;
  approval_required: boolean;
  max_order_amount: number;
  min_order_amount: number;
}

// Restock performance metrics
export interface RestockPerformance {
  total_orders: number;
  successful_orders: number;
  failed_orders: number;
  average_order_time: number;
  average_delivery_time: number;
  supplier_performance: Array<{
    supplier_id: string;
    supplier_name: string;
    orders: number;
    success_rate: number;
    average_delivery_time: number;
  }>;
  product_performance: Array<{
    product_id: string;
    product_name: string;
    reorder_frequency: number;
    average_quantity: number;
  }>;
}

// Restock audit log
export interface RestockAuditLog {
  id: string;
  action: 'order_created' | 'order_updated' | 'order_cancelled' | 'order_received' | 'item_added' | 'item_removed' | 'item_updated';
  order_id: string;
  item_id?: string;
  details: Record<string, unknown>;
  user_id: string;
  user_name: string;
  timestamp: string;
}

// Restock template
export interface RestockTemplate {
  id: string;
  name: string;
  description?: string;
  supplier_id: string;
  items: RestockItemFormData[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Restock schedule
export interface RestockSchedule {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  enabled: boolean;
  last_run?: string;
  next_run: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Restock alert
export interface RestockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'reorder_reminder' | 'delivery_overdue';
  product_id?: string;
  order_id?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Restock report
export interface RestockReport {
  id: string;
  name: string;
  description?: string;
  type: 'orders' | 'products' | 'suppliers' | 'performance';
  filters: RestockFilters;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Restock dashboard data
export interface RestockDashboardData {
  stats: RestockStats;
  recentOrders: RestockOrderDisplay[];
  lowStockProducts: RestockProduct[];
  upcomingDeliveries: RestockOrderDisplay[];
  alerts: RestockAlert[];
  performance: RestockPerformance;
}

// Restock workflow
export interface RestockWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    id: string;
    name: string;
    type: 'approval' | 'notification' | 'action';
    config: Record<string, unknown>;
    order: number;
  }>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Restock integration
export interface RestockIntegration {
  id: string;
  name: string;
  type: 'supplier' | 'erp' | 'inventory';
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Restock backup
export interface RestockBackup {
  id: string;
  name: string;
  description?: string;
  data: {
    orders: RestockOrder[];
    items: RestockItem[];
    templates: RestockTemplate[];
    settings: RestockSettings;
  };
  created_at: string;
  created_by: string;
}

// Restock restore
export interface RestockRestore {
  id: string;
  backup_id: string;
  options: {
    restoreOrders: boolean;
    restoreItems: boolean;
    restoreTemplates: boolean;
    restoreSettings: boolean;
  };
  created_at: string;
  created_by: string;
}
