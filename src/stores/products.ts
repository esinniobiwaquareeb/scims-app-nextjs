// ============================================================================
// PRODUCT STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Product, ProductFormData, ApiResponse } from '@/types';

// Hook for fetching store products
export const useStoreProducts = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
  businessId?: string;
}) => {
  const { enabled = true, forceRefresh = false, businessId } = options || {};
  
  return useQuery({
    queryKey: ['store-products', storeId, businessId],
    queryFn: async () => {
      // Handle "All" case by using business_id
      if (storeId === 'All') {
        if (!businessId) {
          throw new Error('business_id is required when store_id is "All"');
        }
        const response = await fetch(`/api/products?store_id=All&business_id=${businessId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch business products');
        }
        const data = await response.json();
        return data.products || [];
      }
      
      const response = await fetch(`/api/products?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return data.products || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Important for POS
    refetchOnMount: !forceRefresh, // Don't refetch if forcing refresh
  });
};

// Hook for fetching all products (for admin views)
export const useAllProducts = (options?: {
  enabled?: boolean;
  businessId?: string;
}) => {
  const { enabled = true, businessId } = options || {};
  
  return useQuery({
    queryKey: ['all-products', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/products?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch all products');
      }
      const data = await response.json();
      return data.products || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching a single product
export const useProduct = (productId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data: ApiResponse<Product> = await response.json();
      return data.data;
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating a product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
      
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
};

// Hook for updating a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...productData }: ProductFormData & { id: string }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
};

// Hook for deleting a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
      queryClient.removeQueries({ queryKey: ['product', variables] });
      
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
};

// Hook for bulk updating products
export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: Partial<ProductFormData> }>) => {
      const response = await fetch('/api/products/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk update products');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
      
      toast.success('Products updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to bulk update products');
    },
  });
};
