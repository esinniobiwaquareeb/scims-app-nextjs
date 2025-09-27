/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// REPORTING STORE HOOKS
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { ApiResponse, SalesStats, ProductPerformance, CategoryPerformance, PaymentMethodBreakdown, DailyRevenue, FinancialStats, ChartData } from '@/types';

// Hook for fetching sales statistics
export const useReportingSales = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-sales', storeId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports?type=sales&business_id=${storeId}&start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales statistics');
      }
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching product performance
export const useReportingProductPerformance = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-product-performance', storeId, startDate, endDate],
    queryFn: async () => {
      // TODO: Implement product performance report - use inventory report for now
      const response = await fetch(`/api/reports?type=inventory&business_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product performance');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching customer analytics
export const useReportingCustomerAnalytics = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-customer-analytics', storeId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports?type=customers&business_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer analytics');
      }
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching inventory statistics
export const useReportingInventoryStats = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-inventory-stats', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/reports?type=inventory&business_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory statistics');
      }
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching financial metrics
export const useReportingFinancialMetrics = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-financial-metrics', storeId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/financial-metrics?store_id=${storeId}&start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch financial metrics');
      }
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching chart data
export const useReportingChartData = (storeId: string, chartType: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-chart-data', storeId, chartType, startDate, endDate],
    queryFn: async () => {
      // TODO: Implement chart data report
      return {
        labels: [],
        datasets: []
      };
    },
    enabled: enabled && !!storeId && !!chartType && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching daily revenue
export const useReportingDailyRevenue = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-daily-revenue', storeId, startDate, endDate],
    queryFn: async () => {
      // TODO: Implement daily revenue report
      return [];
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching payment method breakdown
export const useReportingPaymentMethodBreakdown = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-payment-method-breakdown', storeId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/payment-method-breakdown?store_id=${storeId}&start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment method breakdown');
      }
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching category performance
export const useReportingCategoryPerformance = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-category-performance', storeId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/category-performance?store_id=${storeId}&start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category performance');
      }
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
