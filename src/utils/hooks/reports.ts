import { useQuery } from '@tanstack/react-query';

export const useReport = (businessId: string, reportType: string, storeId?: string, startDate?: string, endDate?: string, compareType?: string) => {
  return useQuery({
    queryKey: ['report', businessId, reportType, storeId, startDate, endDate, compareType],
    queryFn: async () => {
      const params = new URLSearchParams({ business_id: businessId, type: reportType });
      if (storeId) params.append('store_id', storeId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (compareType) params.append('compare_type', compareType);
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    enabled: !!businessId && !!reportType,
    staleTime: 2 * 60 * 1000, // Reports can be stale faster since they're time-based
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });
};

export const useReportingSales = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'sales', storeId, startDate, endDate);
};

export const useReportingProductPerformance = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'products', storeId, startDate, endDate);
};

export const useReportingCustomerAnalytics = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'customers', storeId);
};

export const useReportingInventoryStats = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'inventory', storeId, startDate, endDate);
};

export const useReportingFinancialMetrics = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'sales', storeId, startDate, endDate);
};

export const useReportingChartData = (businessId: string, reportType: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, reportType, storeId, startDate, endDate);
};

// New report hooks
export const useProfitLossReport = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'profit-loss', storeId, startDate, endDate);
};

export const useCashFlowReport = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'cash-flow', storeId, startDate, endDate);
};

export const useStaffPerformanceReport = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'staff-performance', storeId, startDate, endDate);
};

export const useStoreComparisonReport = (businessId: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'store-comparison', undefined, startDate, endDate);
};

export const usePeriodComparisonReport = (businessId: string, storeId?: string, startDate?: string, endDate?: string, compareType?: string) => {
  return useReport(businessId, 'period-comparison', storeId, startDate, endDate, compareType);
};

export const usePeakHoursReport = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'peak-hours', storeId, startDate, endDate);
};

export const useDiscountEffectivenessReport = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'discount-effectiveness', storeId, startDate, endDate);
};

export const useReturnsReport = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'returns', storeId, startDate, endDate);
};

export const useCustomerLifetimeValueReport = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'customer-lifetime-value', storeId);
};


