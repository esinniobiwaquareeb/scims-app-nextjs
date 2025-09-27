// ============================================================================
// REPORTING STORE HOOKS
// ============================================================================

import { useQuery } from '@tanstack/react-query';

// Hook for fetching sales statistics
export const useReportingSales = (businessId: string, storeId: string | null, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-sales', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: 'sales',
        business_id: businessId,
        start_date: startDate,
        end_date: endDate
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales statistics');
      }
      const data = await response.json();
      return data;
    },
    enabled: enabled && !!businessId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching product performance
export const useReportingProductPerformance = (businessId: string, storeId: string | null, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-product-performance', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: 'inventory',
        business_id: businessId
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product performance');
      }
      const data = await response.json();
      return data.products || [];
    },
    enabled: enabled && !!businessId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching customer analytics
export const useReportingCustomerAnalytics = (businessId: string, storeId: string | null, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-customer-analytics', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: 'customers',
        business_id: businessId,
        start_date: startDate,
        end_date: endDate
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer analytics');
      }
      const data = await response.json();
      return data;
    },
    enabled: enabled && !!businessId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching inventory statistics
export const useReportingInventoryStats = (businessId: string, storeId: string | null, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-inventory-stats', businessId, storeId],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: 'inventory',
        business_id: businessId
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory statistics');
      }
      const data = await response.json();
      return data;
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching financial metrics
export const useReportingFinancialMetrics = (businessId: string, storeId: string | null, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-financial-metrics', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        business_id: businessId,
        start_date: startDate,
        end_date: endDate
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports/financial-metrics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch financial metrics');
      }
      const data = await response.json();
      return data;
    },
    enabled: enabled && !!businessId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching chart data
export const useReportingChartData = (businessId: string, storeId: string | null, chartType: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-chart-data', businessId, storeId, chartType, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        business_id: businessId,
        chart_type: chartType,
        start_date: startDate,
        end_date: endDate
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports/chart-data?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      const data = await response.json();
      return data.data || data;
    },
    enabled: enabled && !!businessId && !!chartType && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching daily revenue
export const useReportingDailyRevenue = (businessId: string, storeId: string | null, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-daily-revenue', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        business_id: businessId,
        start_date: startDate,
        end_date: endDate
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports/daily-revenue?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch daily revenue');
      }
      const data = await response.json();
      return data;
    },
    enabled: enabled && !!businessId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching payment method breakdown
export const useReportingPaymentMethodBreakdown = (businessId: string, storeId: string | null, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-payment-method-breakdown', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        business_id: businessId,
        start_date: startDate,
        end_date: endDate
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports/payment-method-breakdown?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment method breakdown');
      }
      const data = await response.json();
      return data;
    },
    enabled: enabled && !!businessId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching category performance
export const useReportingCategoryPerformance = (businessId: string, storeId: string | null, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['reporting-category-performance', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        business_id: businessId,
        start_date: startDate,
        end_date: endDate
      });
      
      if (storeId) {
        params.append('store_id', storeId);
      }
      
      const response = await fetch(`/api/reports/category-performance?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category performance');
      }
      const data = await response.json();
      return data;
    },
    enabled: enabled && !!businessId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
