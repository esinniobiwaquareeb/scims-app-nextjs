// ============================================================================
// SUPPLIER STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  SupplierFormData
} from '@/types';

// Hook for fetching business suppliers
export const useBusinessSuppliers = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-suppliers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }
      const data = await response.json();
      return data.suppliers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching a single supplier
export const useSupplier = (supplierId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${supplierId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier');
      }
      const data = await response.json();
      return data.supplier || data;
    },
    enabled: enabled && !!supplierId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating a supplier
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplierData: SupplierFormData & { business_id: string }) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create supplier');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch suppliers
      queryClient.invalidateQueries({ queryKey: ['business-suppliers', variables.business_id] });
      
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create supplier');
    },
  });
};

// Hook for updating a supplier
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...supplierData }: SupplierFormData & { id: string; business_id: string }) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update supplier');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch suppliers
      queryClient.invalidateQueries({ queryKey: ['business-suppliers', variables.business_id] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
      
      toast.success('Supplier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update supplier');
    },
  });
};

// Hook for deleting a supplier
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ supplierId, businessId }: { supplierId: string; businessId: string }) => {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete supplier');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch suppliers
      queryClient.invalidateQueries({ queryKey: ['business-suppliers', variables.businessId] });
      queryClient.removeQueries({ queryKey: ['supplier', variables.supplierId] });
      
      toast.success('Supplier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete supplier');
    },
  });
};

// Hook for fetching supplier statistics
export const useSupplierStats = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['supplier-stats', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/stats?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier statistics');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching supplier performance
export const useSupplierPerformance = (supplierId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['supplier-performance', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${supplierId}/performance`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier performance');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: enabled && !!supplierId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching supplier audit logs
export const useSupplierAuditLogs = (supplierId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['supplier-audit-logs', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${supplierId}/audit-logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier audit logs');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: enabled && !!supplierId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
