// ============================================================================
// PRODUCT SPECIFIC TYPES
// ============================================================================

import React from 'react';

// Product management component props
export interface ProductProps {
  onBack: () => void;
}

// Extended product interface for UI display
export interface ProductDisplay {
  id: string;
  store_id: string;
  category_id?: string;
  supplier_id?: string;
  business_id?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  brand_id?: string;
  image_url?: string;
  is_active: boolean;
  total_sold?: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
  reorder_level?: number;
  is_public?: boolean;
  public_description?: string;
  public_images?: string[];
  // Additional UI fields
  category_name?: string;
  supplier_name?: string;
  brand_name?: string;
  store_name?: string;
  profit_margin?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_low_stock?: boolean;
  is_out_of_stock?: boolean;
}

// Product form data
export interface ProductFormData {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_level?: number;
  category_id?: string;
  supplier_id?: string;
  brand_id?: string;
  image_url?: string;
  is_active: boolean;
  is_public?: boolean;
  public_description?: string;
  public_images?: string[];
}

// Product table column
export interface ProductColumn {
  key: string;
  label: string;
  render: (product: ProductDisplay) => React.ReactNode;
}

// Product filters
export interface ProductFilters {
  searchTerm: string;
  categoryFilter: string;
  supplierFilter: string;
  brandFilter: string;
  storeFilter: string;
  stockFilter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  statusFilter: 'all' | 'active' | 'inactive';
  priceRange: {
    min: number;
    max: number;
  };
}

// Product statistics
export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  avgProfitMargin: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}

// Product export options
export interface ProductExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeImages?: boolean;
  includeStock?: boolean;
  includePricing?: boolean;
  includeCategories?: boolean;
  includeSuppliers?: boolean;
  includeBrands?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Product bulk actions
export interface ProductBulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: (products: ProductDisplay[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  requiresConfirmation?: boolean;
}

// Product management state
export interface ProductState {
  selectedProducts: string[];
  isBulkActionMode: boolean;
  filters: ProductFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'table';
}

// Product form component props
export interface ProductFormProps {
  product: Partial<ProductDisplay> | ProductDisplay;
  onChange: (product: Partial<ProductDisplay>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  categories: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}

// Product management actions
export interface ProductAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (product: ProductDisplay) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (product: ProductDisplay) => boolean;
}

// Product detail view props
export interface ProductDetailProps {
  product: ProductDisplay | null;
  onBack: () => void;
  onEdit: (product: ProductDisplay) => void;
  onDelete: (product: ProductDisplay) => void;
}

// Product image upload state
export interface ProductImageState {
  selectedImageFile: File | null;
  imagePreview: string | null;
  editingImageFile: File | null;
  editingImagePreview: string | null;
}

// Product validation errors
export interface ProductValidationErrors {
  name?: string;
  price?: string;
  cost?: string;
  stock_quantity?: string;
  min_stock_level?: string;
  max_stock_level?: string;
  reorder_level?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  supplier_id?: string;
  brand_id?: string;
  image_url?: string;
  general?: string;
}

// Product search result
export interface ProductSearchResult {
  products: ProductDisplay[];
  total: number;
  hasMore: boolean;
}

// Product import options
export interface ProductImportOptions {
  format: 'csv' | 'json' | 'xlsx';
  mapping: {
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    price: string;
    cost: string;
    stock_quantity: string;
    category?: string;
    supplier?: string;
    brand?: string;
  };
  options: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    validateSKU: boolean;
    validateBarcode: boolean;
    createMissingCategories: boolean;
    createMissingSuppliers: boolean;
    createMissingBrands: boolean;
  };
}

// Product performance metrics
export interface ProductPerformance {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  avgPrice: number;
  profitMargin: number;
  stockTurnover: number;
  lastSold?: string;
  topCategory?: string;
  topSupplier?: string;
}

// Product inventory alert
export interface ProductInventoryAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  reorderLevel: number;
  alertType: 'low_stock' | 'out_of_stock' | 'reorder_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

// Product category assignment
export interface ProductCategoryAssignment {
  productId: string;
  categoryId: string;
  categoryName: string;
  assignedAt: string;
  assignedBy: string;
}

// Product supplier assignment
export interface ProductSupplierAssignment {
  productId: string;
  supplierId: string;
  supplierName: string;
  assignedAt: string;
  assignedBy: string;
}

// Product brand assignment
export interface ProductBrandAssignment {
  productId: string;
  brandId: string;
  brandName: string;
  assignedAt: string;
  assignedBy: string;
}
