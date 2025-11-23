/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from "../offline-store-indexeddb";

export const useStoreSales = (
  storeId: string,
  options?: { enabled?: boolean; forceRefresh?: boolean }
) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ["store-sales", storeId],
    queryFn: async () => {
      const response = await fetch(
        `/api/sales?store_id=${storeId}&status=completed`
      );
      if (!response.ok) throw new Error("Failed to fetch sales");
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useCashierSales = (
  cashierId: string,
  storeId: string,
  options?: { enabled?: boolean; forceRefresh?: boolean }
) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ["cashier-sales", cashierId, storeId],
    queryFn: async () => {
      const response = await fetch(
        `/api/sales?store_id=${storeId}&cashier_id=${cashierId}&status=completed`
      );
      if (!response.ok) throw new Error("Failed to fetch cashier sales");
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useStoreSalesReport = (
  storeId: string,
  options?: {
    enabled?: boolean;
    forceRefresh?: boolean;
    startDate?: string;
    endDate?: string;
  }
) => {
  const {
    enabled = true,
    forceRefresh = false,
    startDate,
    endDate,
  } = options || {};
  return useQuery({
    queryKey: ["store-sales-report", storeId, startDate, endDate],
    queryFn: async () => {
      let url = `/api/sales?store_id=${storeId}&include_supply_orders=true`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch store sales report");
      const data = await response.json();
      return data.success ? data.sales : [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useAggregatedSalesReport = (
  storeIds: string[],
  options?: {
    enabled?: boolean;
    forceRefresh?: boolean;
    startDate?: string;
    endDate?: string;
  }
) => {
  const {
    enabled = true,
    forceRefresh = false,
    startDate,
    endDate,
  } = options || {};
  return useQuery({
    queryKey: ["aggregated-sales-report", storeIds, startDate, endDate],
    queryFn: async () => {
      let url = `/api/sales/aggregated?store_ids=${storeIds.join(",")}&include_supply_orders=true`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Failed to fetch aggregated sales report");
      const data = await response.json();
      return data.success ? data.sales : [];
    },
    enabled: enabled && storeIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

// Enhanced store sales hook with offline support
export const useOfflineStoreSales = (
  storeId: string,
  options?: {
    enabled?: boolean;
    forceRefresh?: boolean;
  }
) => {
  const { enabled = true, forceRefresh = false } = options || {};

  return useQuery({
    queryKey: ["store-sales", storeId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/sales?store_id=${storeId}&status=completed`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sales");
        }
        const data = await response.json();
        const sales = data.sales || [];

        // Cache the data for offline use
        await offlineStoreIndexedDB.init();
        for (const sale of sales) {
          await offlineStoreIndexedDB.put("sales", sale);
        }

        return sales;
      } catch (error) {
        // Fallback to offline data
        console.log("Falling back to offline data for sales");
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getSalesByStore(storeId);
      }
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useOfflineCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleData: { store_id: string } & Record<string, unknown>) => {
      try {
        const response = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saleData) });
        if (!response.ok) throw new Error('Failed to create sale');
        const result = await response.json();
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('sales', result.sale);
        return result;
      } catch (error) {
        if (!navigator.onLine) {
          await offlineStoreIndexedDB.init();
          const tempSale = { ...saleData, id: `temp-${Date.now()}`, offline_id: `temp-${Date.now()}`, created_at: new Date().toISOString(), is_temp: true, offline_storage_failed: false };
          await offlineStoreIndexedDB.put('sales', tempSale);
          await offlineStoreIndexedDB.addToSyncQueue({ operation: 'create', table: 'sales', data: tempSale });
          return { sale: tempSale, offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data: any, variables: { store_id: string; business_id?: string; customer_id?: string; cashier_id?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['store-sales', variables.store_id] });
      // Invalidate sales reports
      queryClient.invalidateQueries({ queryKey: ['store-sales-report', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-sales-report'] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ['store-dashboard-stats', variables.store_id] });
      if (variables.business_id) {
        queryClient.invalidateQueries({ queryKey: ['business-dashboard-stats', variables.business_id] });
      }
      // Invalidate customer sales if customer_id is available
      if (variables.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['customerSales', variables.customer_id] });
      }
      // Invalidate cashier sales if cashier_id is available
      if (variables.cashier_id) {
        queryClient.invalidateQueries({ queryKey: ['cashier-sales', variables.cashier_id] });
      }
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ['report'] });
      toast.success(data.offline ? 'Sale completed offline (will sync when online)' : 'Sale completed successfully');
    },
    onError: (error) => {
      toast.error('Failed to create sale');
      console.error('Create sale error:', error);
    },
  });
};
