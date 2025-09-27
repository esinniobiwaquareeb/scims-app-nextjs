/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// CASHIER SPECIFIC TYPES
// ============================================================================

import React from 'react';

// Cashier sale interface for display
export interface CashierSale {
  id: string;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  transaction_date: string;
  customer_name?: string;
  items_count: number;
}

// Cashier activity log interface for display
export interface CashierActivityLog {
  id: string;
  description: string;
  action: string;
  module: string;
  timestamp: Date | string;
  userName: string;
  userRole: string;
  metadata?: Record<string, any>;
}

// Cashier detail component props
export interface CashierDetailProps {
  onBack: () => void;
  cashier: CashierInfo | null;
}

// Cashier information interface
export interface CashierInfo {
  id: string;
  name: string;
  username: string;
  email?: string;
  store_id?: string;
  storeName?: string;
}

// Cashier statistics
export interface CashierStats {
  totalSalesAmount: number;
  totalTransactions: number;
  avgTransaction: number;
  totalActivity: number;
}

// Cashier filters
export interface CashierFilters {
  search: string;
  dateFilter: 'all' | 'today' | 'week' | 'month';
  paymentFilter: 'all' | 'cash' | 'card' | 'mobile';
  activitySearch: string;
  activityType: 'all' | 'login' | 'create' | 'update' | 'delete';
}

// Cashier sales table column
export interface CashierSalesColumn {
  key: string;
  header: string;
  render: (sale: CashierSale) => React.ReactNode;
}

// Cashier activity table column
export interface CashierActivityColumn {
  key: string;
  header: string;
  render: (log: CashierActivityLog) => React.ReactNode;
}

// Cashier export options
export interface CashierExportOptions {
  cashierId: string;
  storeId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  format: 'csv' | 'json' | 'xlsx';
}

// Cashier performance metrics
export interface CashierPerformance {
  cashierId: string;
  period: string;
  totalSales: number;
  totalTransactions: number;
  avgTransactionValue: number;
  topPaymentMethod: string;
  completionRate: number;
  activityCount: number;
}

// Cashier sales summary
export interface CashierSalesSummary {
  cashierId: string;
  date: string;
  totalAmount: number;
  transactionCount: number;
  paymentMethods: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

// Cashier activity summary
export interface CashierActivitySummary {
  cashierId: string;
  date: string;
  totalActivities: number;
  actionBreakdown: Record<string, number>;
  moduleBreakdown: Record<string, number>;
  mostActiveHour: number;
}

// Cashier dashboard data
export interface CashierDashboardData {
  cashier: CashierInfo;
  stats: CashierStats;
  recentSales: CashierSale[];
  recentActivity: CashierActivityLog[];
  performance: CashierPerformance;
  salesSummary: CashierSalesSummary[];
  activitySummary: CashierActivitySummary[];
}
