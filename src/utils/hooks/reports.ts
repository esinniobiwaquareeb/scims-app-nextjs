import { useQuery } from '@tanstack/react-query';

export const useReport = (businessId: string, reportType: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['report', businessId, reportType, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ business_id: businessId, type: reportType });
      if (storeId) params.append('store_id', storeId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    enabled: !!businessId && !!reportType,
  });
};

export const useReportingSales = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'sales', storeId, startDate, endDate);
};

export const useReportingProductPerformance = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'inventory', storeId);
};

export const useReportingCustomerAnalytics = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'customers', storeId);
};

export const useReportingInventoryStats = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'inventory', storeId);
};

export const useReportingFinancialMetrics = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'sales', storeId, startDate, endDate);
};

export const useReportingChartData = (businessId: string, reportType: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, reportType, storeId, startDate, endDate);
};


