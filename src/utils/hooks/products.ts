import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from '../offline-store-indexeddb';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const useStoreProducts = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
  businessId?: string;
}) => {
  const { enabled = true, forceRefresh = false, businessId } = options || {};
  return useQuery({
    queryKey: ['store-products', storeId, businessId],
    queryFn: async () => {
      if (storeId === 'All') {
        if (!businessId) throw new Error('business_id is required when store_id is "All"');
        const response = await fetch(`/api/products?store_id=All&business_id=${businessId}`);
        if (!response.ok) throw new Error('Failed to fetch business products');
        const data = await response.json();
        return data.products || [];
      }
      const response = await fetch(`/api/products?store_id=${storeId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.products || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useOfflineStoreProducts = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
  businessId?: string;
}) => {
  const { enabled = true, forceRefresh = false, businessId } = options || {};
  return useQuery({
    queryKey: ['store-products', storeId, businessId],
    queryFn: async () => {
      try {
        if (storeId === 'All') {
          if (!businessId) throw new Error('business_id is required when store_id is "All"');
          const response = await fetch(`/api/products?store_id=All&business_id=${businessId}`);
          if (!response.ok) throw new Error('Failed to fetch business products');
          const data = await response.json();
          const products = data.products || [];
          await offlineStoreIndexedDB.init();
          for (const product of products) await offlineStoreIndexedDB.put('products', product);
          return products;
        }
        const response = await fetch(`/api/products?store_id=${storeId}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const products = data.products || [];
        await offlineStoreIndexedDB.init();
        for (const product of products) await offlineStoreIndexedDB.put('products', product);
        return products;
      } catch {
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getProductsByStore(storeId);
      }
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useBusinessProducts = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['business-products', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/products?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch business products');
      const data = await response.json();
      return data.products || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useBusinessProductsWithLowStock = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['business-products-low-stock', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/products/low-stock?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch low stock products');
      const data = await response.json();
      return { lowStockProducts: data.products || [], allProducts: data.allProducts || [] };
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: (data, variables: any) => {
      const storeId = variables.store_id;
      const businessId = variables.business_id;
      
      // Invalidate store-specific products
      queryClient.invalidateQueries({ queryKey: ['store-products', storeId] });
      
      // Invalidate "All stores" view if businessId is available
      if (businessId) {
        queryClient.invalidateQueries({ queryKey: ['store-products', 'All', businessId] });
        queryClient.invalidateQueries({ queryKey: ['business-products', businessId] });
        queryClient.invalidateQueries({ queryKey: ['business-products-low-stock', businessId] });
      }
      
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error('Create product error:', error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, productData }: { productId: string; productData: any }) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: (data, variables: any) => {
      const storeId = variables.productData.store_id;
      const businessId = variables.productData.business_id;
      
      // Invalidate store-specific products
      queryClient.invalidateQueries({ queryKey: ['store-products', storeId] });
      
      // Invalidate "All stores" view if businessId is available
      if (businessId) {
        queryClient.invalidateQueries({ queryKey: ['store-products', 'All', businessId] });
        queryClient.invalidateQueries({ queryKey: ['business-products', businessId] });
        queryClient.invalidateQueries({ queryKey: ['business-products-low-stock', businessId] });
      }
      
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Update product error:', error);
    },
  });
};

export const useDeleteProduct = (storeId: string, businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate store-specific products
      queryClient.invalidateQueries({ queryKey: ['store-products', storeId] });
      
      // Invalidate "All stores" view if businessId is available
      if (businessId) {
        queryClient.invalidateQueries({ queryKey: ['store-products', 'All', businessId] });
        queryClient.invalidateQueries({ queryKey: ['business-products', businessId] });
        queryClient.invalidateQueries({ queryKey: ['business-products-low-stock', businessId] });
      }
      
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Delete product error:', error);
    },
  });
};


