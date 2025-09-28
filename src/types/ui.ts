/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

import { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Table related types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

export interface TableRow<T = any> {
  key: string;
  data: T;
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface LineChartData {
  date: string;
  value: number;
  [key: string]: any;
}

export interface BarChartData {
  category: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

// Dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  salesGrowth: number;
  customerGrowth: number;
  productGrowth: number;
}

export interface StoreDashboardStats {
  storeId: string;
  storeName: string;
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  salesGrowth: number;
  customerGrowth: number;
  productGrowth: number;
}

// Reporting types
export interface SalesStats {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  topSellingProducts: ProductPerformance[];
  revenueByDay: DailyRevenue[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  productCount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  sales: number;
  customers: number;
}

export interface FinancialStats {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  operatingExpenses: number;
  taxAmount: number;
}

// Modal and dialog types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

// Form field types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface StatusState {
  status: Status;
  message?: string;
  error?: string;
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    input: string;
    ring: string;
  };
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

// Breadcrumb types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Tab types
export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// Step types
export interface StepItem {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
  disabled?: boolean;
}

// Alert types
export type AlertVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  onClose?: () => void;
}

// Toast types
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ReactNode;
  onClose?: () => void;
}
