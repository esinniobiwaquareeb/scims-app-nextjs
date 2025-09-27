// ============================================================================
// SALES STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SaleFormData } from '@/types';

// Hook for fetching store sales
export const useStoreSales = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-sales', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?store_id=${storeId}&status=completed`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching cashier sales
export const useCashierSales = (cashierId: string, storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['cashier-sales', cashierId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?cashier_id=${cashierId}&store_id=${storeId}&status=completed`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier sales');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching customer sales
export const useCustomerSales = (customerId: string, storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['customer-sales', customerId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?customer_id=${customerId}&store_id=${storeId}&status=completed`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer sales');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!customerId && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching a single sale
export const useSale = (saleId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      const response = await fetch(`/api/sales/${saleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sale');
      }
      const data = await response.json();
      return data.sale || data;
    },
    enabled: enabled && !!saleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating a sale
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleData: SaleFormData & { store_id: string; cashier_id: string }) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create sale');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch sales
      queryClient.invalidateQueries({ queryKey: ['store-sales', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['cashier-sales', variables.cashier_id, variables.store_id] });
      if (variables.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['customer-sales', variables.customer_id, variables.store_id] });
      }
      
      toast.success('Sale completed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create sale');
    },
  });
};

// Hook for updating a sale
export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...saleData }: Partial<SaleFormData> & { id: string }) => {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update sale');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch sales
      queryClient.invalidateQueries({ queryKey: ['store-sales'] });
      queryClient.invalidateQueries({ queryKey: ['cashier-sales'] });
      queryClient.invalidateQueries({ queryKey: ['customer-sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
      
      toast.success('Sale updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update sale');
    },
  });
};

// Hook for deleting a sale (refund)
export const useRefundSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleId: string) => {
      const response = await fetch(`/api/sales/${saleId}/refund`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refund sale');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch sales
      queryClient.invalidateQueries({ queryKey: ['store-sales'] });
      queryClient.invalidateQueries({ queryKey: ['cashier-sales'] });
      queryClient.invalidateQueries({ queryKey: ['customer-sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables] });
      
      toast.success('Sale refunded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to refund sale');
    },
  });
};

// Hook for fetching sales by date range
export const useSalesByDateRange = (storeId: string, startDate: string, endDate: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['sales-date-range', storeId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/sales?store_id=${storeId}&start_date=${startDate}&end_date=${endDate}&status=completed`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales by date range');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!storeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
