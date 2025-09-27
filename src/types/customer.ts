// ============================================================================
// CUSTOMER SPECIFIC TYPES
// ============================================================================

import React from 'react';

// Customer management component props
export interface CustomerProps {
  onBack: () => void;
}

// Extended customer interface for UI display
export interface CustomerDisplay {
  id: string;
  store_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  total_purchases: number;
  last_purchase_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase?: Date;
  createdAt: Date;
  storeName?: string;
}

// Customer sale interface for display
export interface CustomerSale {
  id: string;
  customer_id: string;
  total_amount: number;
  transaction_date: string;
  created_at: string;
  receipt_number: string;
  payment_method: string;
  status: string;
  sale_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  [key: string]: unknown;
}

// Customer form data
export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
}

// Customer table column
export interface CustomerColumn {
  key: string;
  label: string;
  render: (customer: CustomerDisplay) => React.ReactNode;
}

// Customer filters
export interface CustomerFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  storeFilter: string;
  dateFilter: 'all' | 'today' | 'week' | 'month' | 'year';
}

// Customer statistics
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalPurchases: number;
  totalSpent: number;
  avgPurchaseValue: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
}

// Customer export options
export interface CustomerExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeSales?: boolean;
  includeNotes?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Customer bulk actions
export interface CustomerBulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: (customers: CustomerDisplay[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  requiresConfirmation?: boolean;
}

// Customer management state
export interface CustomerState {
  selectedCustomers: string[];
  isBulkActionMode: boolean;
  filters: CustomerFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'table';
}

// Customer form component props
export interface CustomerFormProps {
  customer: Partial<CustomerDisplay> | CustomerDisplay;
  onChange: (customer: Partial<CustomerDisplay>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

// Customer management actions
export interface CustomerAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (customer: CustomerDisplay) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (customer: CustomerDisplay) => boolean;
}

// Customer detail view props
export interface CustomerDetailProps {
  customer: CustomerDisplay | null;
  onBack: () => void;
  onEdit: (customer: CustomerDisplay) => void;
  onDelete: (customer: CustomerDisplay) => void;
}

// Customer sales summary
export interface CustomerSalesSummary {
  totalSales: number;
  totalAmount: number;
  avgOrderValue: number;
  lastPurchaseDate?: string;
  favoriteProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    totalAmount: number;
  }>;
}

// Customer activity log
export interface CustomerActivity {
  id: string;
  type: 'purchase' | 'return' | 'refund' | 'note_added' | 'info_updated';
  description: string;
  amount?: number;
  timestamp: string;
  user?: string;
  metadata?: Record<string, unknown>;
}

// Customer search result
export interface CustomerSearchResult {
  customers: CustomerDisplay[];
  total: number;
  hasMore: boolean;
}

// Customer import options
export interface CustomerImportOptions {
  format: 'csv' | 'json' | 'xlsx';
  mapping: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  options: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    validateEmail: boolean;
    validatePhone: boolean;
  };
}

// Customer validation errors
export interface CustomerValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  general?: string;
}
