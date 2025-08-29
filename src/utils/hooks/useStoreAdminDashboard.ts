import { useQuery } from '@tanstack/react-query';

interface StoreAdminStats {
  todaySales: number;
  totalProducts: number;
  lowStockItems: number;
  totalStaff: number;
}

interface RecentSale {
  id: string;
  receipt_number: string;
  total_amount: string;
  transaction_date: string;
  customer: { name: string } | null;
  cashier: { name: string } | null;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
}

interface StoreAdminDashboardData {
  stats: StoreAdminStats;
  recentSales: RecentSale[];
  lowStockProducts: LowStockProduct[];
}

export const useStoreAdminDashboard = (storeId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}) => {
  const { enabled = true, staleTime = 5 * 60 * 1000, refetchOnWindowFocus = false } = options || {};

  return useQuery({
    queryKey: ['store-admin-dashboard', storeId],
    queryFn: async (): Promise<StoreAdminDashboardData> => {
      const response = await fetch(`/api/dashboard/store-admin?store_id=${storeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch store admin dashboard data');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
      
      return result.data;
    },
    enabled: enabled && !!storeId,
    staleTime,
    refetchOnWindowFocus,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
