// ============================================================================
// CATEGORY STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CategoryFormData } from '@/types';

// Hook for fetching business categories
export const useBusinessCategories = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-categories', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/categories?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data.categories || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching a single category
export const useCategory = (categoryId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      const data = await response.json();
      return data.category;
    },
    enabled: enabled && !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating a category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: CategoryFormData & { business_id: string }) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['business-categories', variables.business_id] });
      
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
};

// Hook for updating a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...categoryData }: CategoryFormData & { id: string; business_id: string }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['business-categories', variables.business_id] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
      
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
};

// Hook for deleting a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, businessId }: { categoryId: string; businessId: string }) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['business-categories', variables.businessId] });
      queryClient.removeQueries({ queryKey: ['category', variables.categoryId] });
      
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
};
