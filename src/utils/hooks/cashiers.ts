import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useBusinessCashiers = (businessId: string, options?: { enabled?: boolean; forceRefresh?: boolean }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['business-cashiers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/cashiers?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch business cashiers');
      const data = await response.json();
      return data.cashiers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useCreateCashier = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cashierData: { name: string; username: string; email: string; phone?: string; store_id?: string; }) => {
      const response = await fetch(`/api/cashiers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...cashierData, business_id: businessId }) });
      if (!response.ok) throw new Error('Failed to create cashier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create cashier: ${error.message}`);
    },
  });
};

export const useUpdateCashier = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cashierId, cashierData }: { cashierId: string; cashierData: Partial<{ name: string; username: string; email: string; phone: string; store_id: string; is_active: boolean; }>; }) => {
      const response = await fetch(`/api/cashiers/${cashierId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cashierData) });
      if (!response.ok) throw new Error('Failed to update cashier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update cashier: ${error.message}`);
    },
  });
};

export const useUpdateCashierStore = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cashierId, storeId }: { cashierId: string; storeId: string | null; }) => {
      const response = await fetch(`/api/cashiers/${cashierId}/store`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store_id: storeId }) });
      if (!response.ok) throw new Error('Failed to update cashier store');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier store assignment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update cashier store: ${error.message}`);
    },
  });
};

export const useDeleteCashier = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cashierId: string) => {
      const response = await fetch(`/api/cashiers/${cashierId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete cashier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete cashier: ${error.message}`);
    },
  });
};


