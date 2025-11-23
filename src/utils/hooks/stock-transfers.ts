import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { StockTransfer, StockTransferFormData } from '@/types';

export const useStockTransfers = (businessId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['stock-transfers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/stock-transfers?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch stock transfers');
      const data = await response.json();
      return data.transfers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateStockTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transferData: StockTransferFormData) => {
      const response = await fetch('/api/stock-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create stock transfer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      toast.success('Stock transfer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create stock transfer');
    },
  });
};

export const useUpdateStockTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ transferId, data }: { transferId: string; data: Partial<StockTransfer> }) => {
      const response = await fetch(`/api/stock-transfers/${transferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stock transfer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      toast.success('Stock transfer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stock transfer');
    },
  });
};

