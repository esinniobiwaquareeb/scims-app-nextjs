// ============================================================================
// CATEGORY SPECIFIC TYPES
// ============================================================================

import React from 'react';

// Category management component props
export interface CategoryProps {
  onBack: () => void;
}

// Category interface for management (extends database Category)
export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  color?: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

// Category form data
export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
}

// Category table column
export interface CategoryColumn {
  key: string;
  label: string;
  render: (category: Category) => React.ReactNode;
}

// Category filters
export interface CategoryFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  colorFilter: string;
}

// Category statistics
export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalProducts: number;
  avgProductsPerCategory: number;
}

// Category color options
export interface CategoryColorOption {
  value: string;
  label: string;
  color: string;
}

// Category export options
export interface CategoryExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeProducts?: boolean;
  includeStats?: boolean;
}

// Category bulk actions
export interface CategoryBulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: (categories: Category[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  requiresConfirmation?: boolean;
}

// Category management state
export interface CategoryState {
  selectedCategories: string[];
  isBulkActionMode: boolean;
  filters: CategoryFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Category form component props
export interface CategoryFormProps {
  category: Partial<Category> | Category;
  onChange: (category: Partial<Category>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

// Category management actions
export interface CategoryAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (category: Category) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (category: Category) => boolean;
}
