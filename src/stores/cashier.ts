// ============================================================================
// CASHIER STORE HOOKS
// ============================================================================

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CashierSale, CashierActivityLog, CashierStats, CashierDashboardData, CashierExportOptions, ApiResponse } from '@/types';

// Hook for fetching cashier sales
export const useCashierSales = (cashierId: string, storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<CashierSale[], Error>({
    queryKey: ['cashier-sales', cashierId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?cashier_id=${cashierId}&store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier sales');
      }
      const data = await response.json();
      const salesData = data.sales || [];
      
      return salesData.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        receipt_number: s.receipt_number as string,
        total_amount: Number(s.total_amount || 0),
        payment_method: s.payment_method as string,
        status: s.status as string,
        transaction_date: s.transaction_date as string,
        customer_name: (s.customers as Record<string, unknown>)?.name as string || 'Walk-in',
        items_count: (s.sale_items as unknown[])?.length || 0
      }));
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching cashier activity logs
export const useCashierActivity = (cashierId: string, businessId: string, storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<CashierActivityLog[], Error>({
    queryKey: ['cashier-activity', cashierId, businessId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/activity-logs?user_id=${cashierId}&business_id=${businessId}&store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier activity');
      }
      const data = await response.json();
      return data.logs || [];
    },
    enabled: enabled && !!cashierId && !!businessId && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching cashier statistics
export const useCashierStats = (cashierId: string, storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<CashierStats, Error>({
    queryKey: ['cashier-stats', cashierId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/cashier/${cashierId}/stats?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier stats');
      }
      const data: ApiResponse<CashierStats> = await response.json();
      return data.data || {
        totalSalesAmount: 0,
        totalTransactions: 0,
        avgTransaction: 0,
        totalActivity: 0
      };
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching cashier dashboard data
export const useCashierDashboard = (cashierId: string, businessId: string, storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<CashierDashboardData, Error>({
    queryKey: ['cashier-dashboard', cashierId, businessId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/cashier/${cashierId}/dashboard?business_id=${businessId}&store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier dashboard data');
      }
      const data: ApiResponse<CashierDashboardData> = await response.json();
      return data.data || {
        cashier: { id: '', name: '', username: '' },
        stats: { totalSalesAmount: 0, totalTransactions: 0, avgTransaction: 0, totalActivity: 0 },
        recentSales: [],
        recentActivity: [],
        performance: { cashierId: '', period: '', totalSales: 0, totalTransactions: 0, avgTransactionValue: 0, topPaymentMethod: '', completionRate: 0, activityCount: 0 },
        salesSummary: [],
        activitySummary: []
      };
    },
    enabled: enabled && !!cashierId && !!businessId && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for exporting cashier data
export const useExportCashierData = () => {
  return useMutation<Blob, Error, CashierExportOptions>({
    mutationFn: async (exportOptions: CashierExportOptions) => {
      const params = new URLSearchParams();
      params.append('cashier_id', exportOptions.cashierId);
      if (exportOptions.storeId) params.append('store_id', exportOptions.storeId);
      if (exportOptions.dateRange) {
        params.append('start_date', exportOptions.dateRange.start);
        params.append('end_date', exportOptions.dateRange.end);
      }
      params.append('format', exportOptions.format);

      const response = await fetch(`/api/cashier/export?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export cashier data');
      }

      const blob = await response.blob();
      const filename = `cashier-${exportOptions.cashierId}-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Cashier data exported successfully');
      return blob;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export cashier data');
    },
  });
};

// Hook for fetching cashier performance metrics
export const useCashierPerformance = (cashierId: string, storeId: string, period: string = '30d', options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<Record<string, unknown>, Error>({
    queryKey: ['cashier-performance', cashierId, storeId, period],
    queryFn: async () => {
      const response = await fetch(`/api/cashier/${cashierId}/performance?store_id=${storeId}&period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier performance');
      }
      const data: ApiResponse<Record<string, unknown>> = await response.json();
      return data.data || {};
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching cashier sales summary
export const useCashierSalesSummary = (cashierId: string, storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<Record<string, unknown>, Error>({
    queryKey: ['cashier-sales-summary', cashierId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/cashier/${cashierId}/sales-summary?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier sales summary');
      }
      const data: ApiResponse<Record<string, unknown>> = await response.json();
      return data.data || {};
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};
