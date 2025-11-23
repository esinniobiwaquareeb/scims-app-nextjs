import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { StockAdjustment, StockAdjustmentFormData } from '@/types';

export const useStockAdjustments = (storeId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['stock-adjustments', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stock-adjustments?store_id=${storeId}`);
      if (!response.ok) throw new Error('Failed to fetch stock adjustments');
      const data = await response.json();
      return data.adjustments || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateStockAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adjustmentData: StockAdjustmentFormData) => {
      const response = await fetch('/api/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustmentData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create stock adjustment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      toast.success('Stock adjustment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create stock adjustment');
    },
  });
};

export const useDeleteStockAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adjustmentId: string) => {
      const response = await fetch(`/api/stock-adjustments/${adjustmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete stock adjustment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      toast.success('Stock adjustment deleted and reversed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete stock adjustment');
    },
  });
};

