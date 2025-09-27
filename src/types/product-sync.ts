// ============================================================================
// PRODUCT SYNC SPECIFIC TYPES
// ============================================================================

import React from 'react';
import { Product, Store } from './database';

// Product sync component props
export interface ProductSyncProps {
  onBack: () => void;
}

// Extended product interface for sync display
export interface ProductSyncDisplay extends Product {
  category_name?: string;
  supplier_name?: string;
  brand_name?: string;
  store_name?: string;
  is_synced?: boolean;
  sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
  sync_error?: string;
  last_synced?: string;
  target_stores?: string[];
}

// Product sync operation
export interface ProductSyncOperation {
  id: string;
  product_id: string;
  source_store_id: string;
  target_store_ids: string[];
  operation_type: 'copy' | 'sync';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  error_message?: string;
  progress?: number;
}

// Product sync configuration
export interface ProductSyncConfig {
  auto_sync: boolean;
  sync_interval: number; // in minutes
  sync_on_create: boolean;
  sync_on_update: boolean;
  sync_on_delete: boolean;
  conflict_resolution: 'source_wins' | 'target_wins' | 'manual';
  sync_fields: string[];
  exclude_fields: string[];
}

// Product sync filters
export interface ProductSyncFilters {
  searchTerm: string;
  categoryFilter: string;
  syncStatusFilter: 'all' | 'synced' | 'pending' | 'error';
  storeFilter: string;
}

// Product sync statistics
export interface ProductSyncStats {
  totalProducts: number;
  syncedProducts: number;
  pendingProducts: number;
  errorProducts: number;
  lastSyncTime?: string;
  syncSuccessRate: number;
  totalSyncOperations: number;
  completedSyncOperations: number;
  failedSyncOperations: number;
}

// Product sync table column
export interface ProductSyncColumn {
  key: string;
  label: string;
  render: (product: ProductSyncDisplay) => React.ReactNode;
}

// Product sync action
export interface ProductSyncAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (product: ProductSyncDisplay) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (product: ProductSyncDisplay) => boolean;
}

// Product sync state
export interface ProductSyncState {
  selectedProducts: string[];
  selectedStores: string[];
  searchTerm: string;
  categoryFilter: string;
  syncMode: 'copy' | 'sync';
  showSyncDialog: boolean;
  isSyncing: boolean;
  syncProgress: number;
}

// Product sync form data
export interface ProductSyncFormData {
  product_ids: string[];
  target_store_ids: string[];
  operation_type: 'copy' | 'sync';
  sync_fields: string[];
  conflict_resolution: 'source_wins' | 'target_wins' | 'manual';
  update_existing: boolean;
  create_missing: boolean;
}

// Product sync validation errors
export interface ProductSyncValidationErrors {
  product_ids?: string;
  target_store_ids?: string;
  operation_type?: string;
  sync_fields?: string;
  conflict_resolution?: string;
  general?: string;
}

// Product sync export options
export interface ProductSyncExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeSyncStatus?: boolean;
  includeSyncHistory?: boolean;
  includeTargetStores?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Product sync import options
export interface ProductSyncImportOptions {
  file: File;
  mapping: {
    product_id: string;
    target_store_ids: string;
    operation_type: string;
    sync_fields: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validateProducts: boolean;
    validateStores: boolean;
  };
}

// Product sync conflict
export interface ProductSyncConflict {
  product_id: string;
  field: string;
  source_value: any;
  target_value: any;
  conflict_type: 'value_mismatch' | 'field_missing' | 'type_mismatch';
  resolution?: 'source_wins' | 'target_wins' | 'manual';
  resolved_value?: any;
}

// Product sync history
export interface ProductSyncHistory {
  id: string;
  product_id: string;
  source_store_id: string;
  target_store_id: string;
  operation_type: 'copy' | 'sync';
  status: 'success' | 'failed' | 'partial';
  sync_fields: string[];
  conflicts: ProductSyncConflict[];
  error_message?: string;
  synced_at: string;
  synced_by: string;
}

// Product sync batch
export interface ProductSyncBatch {
  id: string;
  name: string;
  description?: string;
  product_ids: string[];
  target_store_ids: string[];
  operation_type: 'copy' | 'sync';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  created_by: string;
  progress: number;
  total_operations: number;
  completed_operations: number;
  failed_operations: number;
}

// Product sync template
export interface ProductSyncTemplate {
  id: string;
  name: string;
  description?: string;
  sync_fields: string[];
  conflict_resolution: 'source_wins' | 'target_wins' | 'manual';
  auto_sync: boolean;
  sync_interval: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Product sync notification
export interface ProductSyncNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  product_id?: string;
  store_id?: string;
  created_at: string;
  read: boolean;
}

// Product sync settings
export interface ProductSyncSettings {
  enable_auto_sync: boolean;
  sync_interval: number;
  max_concurrent_syncs: number;
  retry_failed_syncs: boolean;
  max_retry_attempts: number;
  notification_enabled: boolean;
  notification_types: string[];
  conflict_resolution_default: 'source_wins' | 'target_wins' | 'manual';
  sync_fields_default: string[];
  exclude_fields_default: string[];
}

// Product sync performance metrics
export interface ProductSyncPerformance {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  average_sync_time: number;
  fastest_sync_time: number;
  slowest_sync_time: number;
  sync_volume_by_day: Array<{
    date: string;
    syncs: number;
  }>;
  sync_volume_by_store: Array<{
    store_id: string;
    store_name: string;
    syncs: number;
  }>;
}

// Product sync audit log
export interface ProductSyncAuditLog {
  id: string;
  action: 'sync_started' | 'sync_completed' | 'sync_failed' | 'sync_cancelled' | 'conflict_resolved';
  product_id: string;
  source_store_id: string;
  target_store_id?: string;
  operation_type: 'copy' | 'sync';
  details: Record<string, any>;
  user_id: string;
  user_name: string;
  timestamp: string;
}
