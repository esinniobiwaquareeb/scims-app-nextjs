import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CategoryFormData } from '@/types';
import { offlineStoreIndexedDB } from '../offline-store-indexeddb';

export const useCategories = (businessId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['categories', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/categories?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });
};

export const useBusinessCategories = useCategories;

export const useCreateBusinessCategory = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData: CategoryFormData) => {
      const response = await fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
      // Invalidate products that use categories
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create category');
      console.error('Create category error:', error);
    },
  });
};

export const useUpdateBusinessCategory = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, categoryData }: { categoryId: string; categoryData: CategoryFormData }) => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
      // Invalidate products that use categories
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update category');
      console.error('Update category error:', error);
    },
  });
};

export const useDeleteBusinessCategory = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
      // Invalidate products that use categories
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category');
      console.error('Delete category error:', error);
    },
  });
};

export const useOfflineCategories = (businessId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['categories', businessId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/categories?business_id=${businessId}`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        const categories = data.categories || [];
        await offlineStoreIndexedDB.init();
        for (const category of categories) await offlineStoreIndexedDB.put('categories', category);
        return categories;
      } catch {
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getCategoriesByBusiness(businessId);
      }
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });
};


