// ============================================================================
// CASHIER MANAGEMENT SPECIFIC TYPES
// ============================================================================

import React from 'react';

// Cashier management component props
export interface CashierManagementProps {
  onBack: () => void;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
}

// Cashier interface for management
export interface CashierManagement {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  store_id?: string;
  storeName?: string;
  is_active: boolean;
  role: 'cashier';
  permissions?: string[];
  created_at: string;
  last_login?: string;
  totalSales?: number;
  transactionCount?: number;
}

// Store interface for cashier assignment
export interface CashierStore {
  id: string;
  name: string;
  is_active?: boolean;
}

// Cashier form data
export interface CashierFormData {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  store_id?: string;
  is_active: boolean;
  role: 'cashier';
  permissions: string[];
}

// Cashier form component props
export interface CashierFormProps {
  cashier: Partial<CashierManagement> | CashierManagement;
  onChange: (cashier: Partial<CashierManagement>) => void;
  onSave: () => void;
  onCancel: () => void;
  stores: CashierStore[];
  isSaving: boolean;
}

// Cashier table column
export interface CashierColumn {
  key: string;
  label: string;
  render: (cashier: CashierManagement) => React.ReactNode;
}

// Cashier filters
export interface CashierFilters {
  searchTerm: string;
  storeFilter: string;
  statusFilter: 'all' | 'active' | 'inactive';
  roleFilter: 'all' | 'cashier';
}

// Cashier statistics
export interface CashierStats {
  totalCashiers: number;
  activeCashiers: number;
  inactiveCashiers: number;
  totalSales: number;
  totalTransactions: number;
  avgTransactionValue: number;
}

// Cashier sales data for management view
export interface CashierManagementSale {
  id: string;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  transaction_date: string;
  created_at: string;
  customer_id?: string;
  customer_name?: string;
  items_count: number;
}

// Cashier sales filters
export interface CashierSalesFilters {
  searchTerm: string;
  dateFilter: 'all' | 'today' | 'week' | 'month';
  statusFilter: 'all' | 'completed' | 'pending' | 'cancelled';
  paymentFilter: 'all' | 'cash' | 'card' | 'mobile';
}

// Cashier sales table column
export interface CashierSalesColumn {
  key: string;
  label: string;
  render: (sale: CashierManagementSale) => React.ReactNode;
}

// Cashier credentials
export interface CashierCredentials {
  username: string;
  password: string;
}

// Cashier permission options
export interface CashierPermission {
  key: string;
  label: string;
  description: string;
  default: boolean;
}

// Cashier management actions
export interface CashierAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (cashier: CashierManagement) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (cashier: CashierManagement) => boolean;
}

// Cashier export options
export interface CashierExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeSales?: boolean;
  includeActivity?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Cashier bulk actions
export interface CashierBulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: (cashiers: CashierManagement[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  requiresConfirmation?: boolean;
}

// Cashier management state
export interface CashierManagementState {
  selectedCashiers: string[];
  isBulkActionMode: boolean;
  filters: CashierFilters;
  salesFilters: CashierSalesFilters;
  showInactive: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Cashier management context
export interface CashierManagementContextType {
  state: CashierManagementState;
  setState: React.Dispatch<React.SetStateAction<CashierManagementState>>;
  selectedCashier: CashierManagement | null;
  setSelectedCashier: (cashier: CashierManagement | null) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isSalesViewOpen: boolean;
  setIsSalesViewOpen: (open: boolean) => void;
  isPasswordResetDialogOpen: boolean;
  setIsPasswordResetDialogOpen: (open: boolean) => void;
  cashierForPasswordReset: CashierManagement | null;
  setCashierForPasswordReset: (cashier: CashierManagement | null) => void;
  generatedCredentials: CashierCredentials | null;
  setGeneratedCredentials: (credentials: CashierCredentials | null) => void;
}
