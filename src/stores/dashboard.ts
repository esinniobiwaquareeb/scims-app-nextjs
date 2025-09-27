// ============================================================================
// DASHBOARD STORE HOOKS
// ============================================================================

import { useQuery } from '@tanstack/react-query';
// Dashboard types are inferred from API responses

// Hook for fetching dashboard statistics
export const useDashboardStats = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['dashboard-stats', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?store_id=${storeId}&type=store`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }
      const data = await response.json();
      return data.stats;
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching business stores report
export const useBusinessStoresReport = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['business-stores-report', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/stores?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business stores report');
      }
      const data = await response.json();
      return data.stores || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching business stores
export const useBusinessStores = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['business-stores', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/stores?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business stores');
      }
      const data = await response.json();
      return data.stores || data.data || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};
