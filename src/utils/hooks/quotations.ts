import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Quotation, QuotationFormData } from '@/types';

export const useQuotations = (businessId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['quotations', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/quotations?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch quotations');
      const data = await response.json();
      return data.quotations || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationData: QuotationFormData) => {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create quotation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create quotation');
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quotationId, data }: { quotationId: string; data: Partial<Quotation> }) => {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update quotation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quotation');
    },
  });
};

export const useSendQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await fetch(`/api/quotations/${quotationId}/send`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send quotation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send quotation');
    },
  });
};

export const useConvertQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quotationId, data }: { quotationId: string; data: Record<string, unknown> }) => {
      const response = await fetch(`/api/quotations/${quotationId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to convert quotation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      toast.success('Quotation converted to sale successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert quotation');
    },
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete quotation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete quotation');
    },
  });
};

