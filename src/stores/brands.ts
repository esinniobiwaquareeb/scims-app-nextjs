// ============================================================================
// BRAND STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BrandFormData } from '@/types';

// Hook for fetching business brands
export const useBusinessBrands = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-brands', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/brands?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      return data.brands || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching a single brand
export const useBrand = (brandId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      const response = await fetch(`/api/brands/${brandId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch brand');
      }
      const data = await response.json();
      return data.brand || data;
    },
    enabled: enabled && !!brandId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating a brand
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brandData: BrandFormData & { business_id: string }) => {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: ['business-brands', variables.business_id] });
      
      toast.success('Brand created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create brand');
    },
  });
};

// Hook for creating a business brand (with business_id parameter)
export const useCreateBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brandData: BrandFormData) => {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...brandData,
          business_id: businessId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: ['business-brands', businessId] });
      
      toast.success('Brand created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create brand');
    },
  });
};

// Hook for updating a brand
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...brandData }: BrandFormData & { id: string; business_id: string }) => {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: ['business-brands', variables.business_id] });
      queryClient.invalidateQueries({ queryKey: ['brand', variables.id] });
      
      toast.success('Brand updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update brand');
    },
  });
};

// Hook for updating a business brand (with business_id parameter)
export const useUpdateBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...brandData }: BrandFormData & { id: string }) => {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: ['business-brands', businessId] });
      queryClient.invalidateQueries({ queryKey: ['brand', variables.id] });
      
      toast.success('Brand updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update brand');
    },
  });
};

// Hook for deleting a brand
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ brandId, businessId }: { brandId: string; businessId: string }) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: ['business-brands', variables.businessId] });
      queryClient.removeQueries({ queryKey: ['brand', variables.brandId] });
      
      toast.success('Brand deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete brand');
    },
  });
};

// Hook for deleting a business brand (with business_id parameter)
export const useDeleteBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brandId: string) => {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: ['business-brands', businessId] });
      queryClient.removeQueries({ queryKey: ['brand', variables] });
      
      toast.success('Brand deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete brand');
    },
  });
};
