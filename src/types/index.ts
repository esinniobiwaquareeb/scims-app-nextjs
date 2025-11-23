/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// CORE BUSINESS TYPES
// ============================================================================

import { ReactNode } from "react";

export interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country_id?: string;
  currency_id?: string;
  language_id?: string;
  subscription_plan_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  address?: string;
  business_id: string;
  currency_id?: string;
  language_id?: string;
  country_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  role: 'superadmin' | 'business_admin' | 'store_admin' | 'cashier';
  is_active: boolean;
  is_demo: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PRODUCT & INVENTORY TYPES
// ============================================================================

export interface Product {
  category: ReactNode;
  soldQuantity: ReactNode;
  revenue: any;
  profit: any;
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  reorder_level?: number;
  min_stock_level?: number;
  sku?: string;
  barcode?: string;
  store_id: string;
  category_id?: string;
  supplier_id?: string;
  brand_id?: string;
  is_active: boolean;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SALES & TRANSACTION TYPES
// ============================================================================

export interface Sale {
  amount(amount: any): ReactNode;
  id: string;
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  receipt_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  cash_received?: number;
  change_given?: number;
  delivery_cost?: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_status?: string;
  payment_history?: unknown[];
  is_editable?: boolean;
  notes?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    price?: number;
    stock_quantity?: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  store_id: string;
  total_purchases: number;
  last_purchase_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedCart {
  id: string;
  store_id: string;
  cashier_id: string;
  cart_data: CartData;
  created_at: string;
  updated_at: string;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  customer_id?: string;
  notes?: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
}

// ============================================================================
// RESTOCK & INVENTORY TYPES
// ============================================================================

export interface RestockOrder {
  id: string;
  store_id: string;
  supplier_id: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  expected_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface RestockItem {
  products: Product;
  total_price: number;
  id: string;
  restock_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  received_quantity?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ROLES & PERMISSIONS TYPES
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description?: string;
  business_id: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  store_id?: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SETTINGS & CONFIGURATION TYPES
// ============================================================================

export interface BusinessSettings {
  id: string;
  business_id: string;
  default_currency_id?: string;
  default_language_id?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  tax_rate?: number;
  enable_tax?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id?: string;
  store_id: string;
  currency_id?: string;
  language_id?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
  receipt_header?: string;
  receipt_footer?: string;
  return_policy?: string;
  contact_person?: string;
  store_hours?: string;
  store_promotion_info?: string;
  custom_receipt_message?: string;
  allow_returns?: boolean;
  return_period_days?: number;
  enable_tax?: boolean;
  tax_rate?: number;
  enable_discount?: boolean;
  discount_rate?: number;
  enable_sounds?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SystemSettings {
  defaultCurrency: string;
  defaultLanguage: string;
  supportedCurrencies: Currency[];
  supportedLanguages: Language[];
  demoMode: boolean;
  maintenanceMode: boolean;
  platformName: string;
  platformVersion: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  allowUsernameLogin: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  systemStatus: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  lastHealthCheck: Date;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

// ============================================================================
// ACTIVITY LOG TYPES
// ============================================================================

export interface ActivityLog {
  id: string;
  user_id?: string;
  business_id?: string;
  store_id?: string;
  activity_type: string;
  category: string;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================================================
// REPORTING & ANALYTICS TYPES
// ============================================================================

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalTax: number;
  averageOrderValue: number;
  totalOrders: number;
  uniqueCustomers: number;
  topProducts: ProductPerformance[];
  topCategories: CategoryPerformance[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  dailyRevenue: DailyRevenue[];
}

export interface ProductPerformance {
  name: string;
  quantity: number;
  revenue: number;
  sku: string;
  category?: string;
  profit?: number;
}

export interface CategoryPerformance {
  name: string;
  quantity: number;
  revenue: number;
  profit?: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
  cash_received?: number;
  change_given?: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface FinancialStats {
  totalProfit: number;
  operatingExpenses: number;
  netProfit: number;
  profitMargin: number;
  returnRate: number;
  customerRetention: number;
  inventoryTurnover: number;
}

export interface ChartData {
  revenueData: Array<{ date: string; revenue: number }>;
  categoryData: Array<{ category: string; amount: number }>;
  paymentData: Array<{ method: string; amount: number }>;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalStores: number;
  totalOrders: number;
  lowStockCount: number;
  recentActivity: ActivityLog[];
}

export interface StoreDashboardStats {
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  lowStockCount: number;
  recentActivity: ActivityLog[];
}

// ============================================================================
// FORM & MUTATION TYPES
// ============================================================================

export interface ProductFormData {
  store_id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  category_id?: string;
  supplier_id?: string;
  brand_id?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  is_active: boolean;
}

export interface CustomerFormData {
  store_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface StaffFormData {
  username: string;
  email: string; // Required field
  name: string;
  phone?: string;
  role: string;
  store_id?: string;
}

export interface SupplierFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  business_id: string;
}

export interface BrandFormData {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  business_id: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
  business_id: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface SalesResponse {
  sales: Sale[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ProductsResponse {
  products: Product[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface CustomersResponse {
  customers: Customer[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TableName = 'products' | 'customers' | 'sales' | 'categories' | 'brands' | 'suppliers' | 'staff' | 'roles' | 'permissions';

export type SortDirection = 'asc' | 'desc';

export type FilterOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';

export interface FilterOption {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[];
}

export interface SortOption {
  field: string;
  direction: SortDirection;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface QueryOptions {
  filters?: FilterOption[];
  sort?: SortOption[];
  pagination?: PaginationOptions;
  search?: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  onBack?: () => void;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

export interface TableRow<T> {
  id: string;
  data: T;
  selected?: boolean;
}

// ============================================================================
// HOOK PARAMETER TYPES
// ============================================================================

export interface UseQueryOptions {
  enabled?: boolean;
  forceRefresh?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Core business types
  Business as BusinessType,
  Store as StoreType,
  User as UserType,
  
  // Product & inventory types
  Product as ProductType,
  Category as CategoryType,
  Brand as BrandType,
  Supplier as SupplierType,
  
  // Sales & transaction types
Sale as SaleType,
  SaleItem as SaleItemType,
  Customer as CustomerType,
  SavedCart as SavedCartType,
  CartData as CartDataType,
  CartItem as CartItemType,
  
  // Restock & inventory types
  RestockOrder as RestockOrderType,
  RestockItem as RestockItemType,
  
  // Roles & permissions types
  Role as RoleType,
  Permission as PermissionType,
  UserRole as UserRoleType,
  
  // Settings & configuration types
  BusinessSettings as BusinessSettingsType,
  StoreSettings as StoreSettingsType,
  SystemSettings as SystemSettingsType,
  Currency as CurrencyType,
  Language as LanguageType,
  
  // Activity log types
  ActivityLog as ActivityLogType,
  
  // Reporting & analytics types
  SalesStats as SalesStatsType,
  ProductPerformance as ProductPerformanceType,
  CategoryPerformance as CategoryPerformanceType,
  PaymentMethodBreakdown as PaymentMethodBreakdownType,
  DailyRevenue as DailyRevenueType,
  FinancialStats as FinancialStatsType,
  ChartData as ChartDataType,
  
  // Dashboard types
DashboardStats as DashboardStatsType,
  StoreDashboardStats as StoreDashboardStatsType,
  
  // Form & mutation types
  ProductFormData as ProductFormDataType,
  CustomerFormData as CustomerFormDataType,
  StaffFormData as StaffFormDataType,
  SupplierFormData as SupplierFormDataType,
  BrandFormData as BrandFormDataType,
  CategoryFormData as CategoryFormDataType,
  
  // API response types
  ApiResponse as ApiResponseType,
  PaginatedResponse as PaginatedResponseType,
  SalesResponse as SalesResponseType,
  ProductsResponse as ProductsResponseType,
  CustomersResponse as CustomersResponseType,
  
  // Utility types
  TableName as TableNameType,
  SortDirection as SortDirectionType,
  FilterOperator as FilterOperatorType,
  FilterOption as FilterOptionType,
  SortOption as SortOptionType,
  PaginationOptions as PaginationOptionsType,
  QueryOptions as QueryOptionsType,
  
  // Component prop types
  BaseComponentProps as BaseComponentPropsType,
  TableColumn as TableColumnType,
  TableRow as TableRowType,
  
  // Hook parameter types
  UseQueryOptions as UseQueryOptionsType,
  UseMutationOptions as UseMutationOptionsType,
};

// Export competitor features types
export * from './competitor-features';
