import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { SaleReturn, SaleReturnFormData } from '@/types';

export const useSaleReturns = (storeId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['sale-returns', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sale-returns?store_id=${storeId}`);
      if (!response.ok) throw new Error('Failed to fetch sale returns');
      const data = await response.json();
      return data.returns || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateSaleReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (returnData: SaleReturnFormData) => {
      const response = await fetch('/api/sale-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sale return');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-returns'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      toast.success('Sale return created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create sale return');
    },
  });
};

export const useUpdateSaleReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ returnId, data }: { returnId: string; data: Partial<SaleReturn> }) => {
      const response = await fetch(`/api/sale-returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sale return');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-returns'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      toast.success('Sale return updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update sale return');
    },
  });
};

