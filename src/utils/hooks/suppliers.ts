import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { SupplierFormData } from '@/types';

export const useBusinessSuppliers = (businessId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['suppliers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      return data.suppliers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useCreateBusinessSupplier = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplierData: SupplierFormData) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supplierData),
      });
      if (!response.ok) throw new Error('Failed to create supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
      toast.success('Supplier created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create supplier');
      console.error('Create supplier error:', error);
    },
  });
};

export const useUpdateBusinessSupplier = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ supplierId, supplierData }: { supplierId: string; supplierData: SupplierFormData }) => {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supplierData),
      });
      if (!response.ok) throw new Error('Failed to update supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
      toast.success('Supplier updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update supplier');
      console.error('Update supplier error:', error);
    },
  });
};

export const useDeleteBusinessSupplier = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplierId: string) => {
      const response = await fetch(`/api/suppliers/${supplierId}?business_id=${businessId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete supplier');
      console.error('Delete supplier error:', error);
    },
  });
};


