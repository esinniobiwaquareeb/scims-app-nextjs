// ============================================================================
// CASHIER MANAGEMENT STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CashierManagement, CashierFormData, CashierManagementSale, CashierCredentials, ApiResponse } from '@/types';

// Hook for fetching business cashiers
export const useBusinessCashiers = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<CashierManagement[], Error>({
    queryKey: ['business-cashiers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/cashiers?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business cashiers');
      }
      const data = await response.json();
      return data.cashiers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching business stores for cashier assignment
export const useBusinessStores = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<{ stores: Array<{ id: string; name: string; is_active?: boolean }> }, Error>({
    queryKey: ['business-stores', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/stores?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business stores');
      }
      const data = await response.json();
      return { stores: data.stores || [] };
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching cashier sales
export const useCashierSales = (cashierId: string, storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};

  return useQuery<CashierManagementSale[], Error>({
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
        created_at: s.created_at as string,
        customer_id: s.customer_id as string,
        customer_name: s.customer_name as string || 'Walk-in Customer',
        items_count: (s.sale_items as unknown[])?.length || 0
      }));
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for creating a cashier
export const useCreateCashier = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CashierManagement & { credentials?: CashierCredentials }>, Error, CashierFormData>({
    mutationFn: async (cashierData: CashierFormData) => {
      const response = await fetch(`/api/cashiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cashierData,
          business_id: businessId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create cashier');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-stores', businessId] });
      toast.success('Cashier created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create cashier');
    },
  });
};

// Hook for updating a cashier
export const useUpdateCashier = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CashierManagement>, Error, { id: string; cashierData: Partial<CashierFormData> }>({
    mutationFn: async ({ id, cashierData }) => {
      const response = await fetch(`/api/cashiers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cashierData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update cashier');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      queryClient.invalidateQueries({ queryKey: ['cashier-sales', variables.id] });
      toast.success('Cashier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update cashier');
    },
  });
};

// Hook for updating cashier store assignment
export const useUpdateCashierStore = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CashierManagement>, Error, { id: string; storeId: string }>({
    mutationFn: async ({ id, storeId }) => {
      const response = await fetch(`/api/cashiers/${id}/store`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store_id: storeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update cashier store');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      queryClient.invalidateQueries({ queryKey: ['cashier-sales', variables.id] });
      toast.success('Cashier store updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update cashier store');
    },
  });
};

// Hook for deleting a cashier
export const useDeleteCashier = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (cashierId: string) => {
      const response = await fetch(`/api/cashiers/${cashierId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete cashier');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      queryClient.invalidateQueries({ queryKey: ['cashier-sales', variables] });
      toast.success('Cashier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete cashier');
    },
  });
};

// Hook for resetting user password
export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CashierCredentials>, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers'] });
      toast.success('Password reset successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
};

// Note: Bulk operations and export functionality would require additional API endpoints
// These hooks are commented out until the corresponding endpoints are implemented
