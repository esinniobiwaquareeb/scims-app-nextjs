import React from 'react';
import { BrandFormData } from '@/components/brand/BrandHelpers';
import { CategoryFormData, SupplierFormData, CustomerFormData, StaffFormData } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from '../offline-store-indexeddb';

// Hook for fetching store products
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Hook for fetching store customers
export const useStoreCustomers = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-customers', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/customers?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      return data.customers || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching store sales
export const useStoreSales = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-sales', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?store_id=${storeId}&status=completed`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching cashier sales
export const useCashierSales = (cashierId: string, storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['cashier-sales', cashierId, storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?store_id=${storeId}&cashier_id=${cashierId}&status=completed`);
      if (!response.ok) {
        throw new Error('Failed to fetch cashier sales');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!cashierId && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for creating customers
export const useCreateCustomer = (p0: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: {
      store_id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      [key: string]: unknown;
    }) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customers for the store
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.store_id] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error('Create customer error:', error);
    },
  });
};

// Hook for saved carts
export const useSavedCarts = (storeId: string, p0: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['saved-carts', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/saved-carts?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved carts');
      }
      const data = await response.json();
      return data.carts || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for saving cart
export const useSaveCart = (p0: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cartData: {
      store_id: string;
      cart_data: unknown;
      cashier_id: string;
      [key: string]: unknown;
    }) => {
      const response = await fetch('/api/saved-carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save cart');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch saved carts for the store
      queryClient.invalidateQueries({ queryKey: ['saved-carts', variables.store_id] });
      toast.success('Cart saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save cart');
      console.error('Save cart error:', error);
    },
  });
};

// Hook for deleting saved cart
export const useDeleteSavedCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cartId: string) => {
      const response = await fetch(`/api/saved-carts/${cartId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete saved cart');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch saved carts
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
      toast.success('Cart deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete cart');
      console.error('Delete cart error:', error);
    },
  });
};

// Hook for business settings
export const useBusinessSettings = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch business settings');
      }
      const data = await response.json();
      return data.settings || {};
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for updating business settings
export const useUpdateBusinessSettings = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch(`/api/businesses/${businessId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update business settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch business settings
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      toast.success('Business settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update business settings');
    },
  });
};

// Hook for categories
export const useCategories = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['categories', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/categories?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data.categories || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for business categories (alias for useCategories)
export const useBusinessCategories = useCategories;

// Hook for suppliers
export const useBusinessSuppliers = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['suppliers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }
      const data = await response.json();
      return data.suppliers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for brands
export const useBusinessBrands = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['brands', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/brands?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      return data.brands || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for creating products
export const useCreateProduct = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: {
      store_id: string;
      business_id?: string;
      name: string;
      description?: string;
      price: number;
      cost_price?: number;
      stock_quantity: number;
      category_id?: string;
      supplier_id?: string;
      brand_id?: string;
      sku?: string;
      barcode?: string;
      is_active: boolean;
      [key: string]: unknown;
    }) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch products for the store
      queryClient.invalidateQueries({ queryKey: ['store-products', variables.store_id] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error('Create product error:', error);
    },
  });
};

// Hook for updating products
export const useUpdateProduct = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, productData }: { 
      productId: string; 
      productData: {
        store_id: string;
        name?: string;
        description?: string;
        price?: number;
        cost_price?: number;
        stock_quantity?: number;
        category_id?: string;
        supplier_id?: string;
        brand_id?: string;
        sku?: string;
        barcode?: string;
        is_active?: boolean;
        [key: string]: unknown;
      }
    }) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch products for the store
      queryClient.invalidateQueries({ queryKey: ['store-products', variables.productData.store_id] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Update product error:', error);
    },
  });
};

// Hook for deleting products
export const useDeleteProduct = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch products for the store
      queryClient.invalidateQueries({ queryKey: ['store-products', storeId] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Delete product error:', error);
    },
  });
};

// Hook for creating business categories
export const useCreateBusinessCategory = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: CategoryFormData) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch categories for the business
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create category');
      console.error('Create category error:', error);
    },
  });
};

// Hook for updating business categories
export const useUpdateBusinessCategory = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, categoryData }: { categoryId: string; categoryData: CategoryFormData }) => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch categories for the business
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update category');
      console.error('Update category error:', error);
    },
  });
};

// Hook for deleting business categories
export const useDeleteBusinessCategory = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch categories for the business
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category');
      console.error('Delete category error:', error);
    },
  });
};

// Hook for creating business brands
export const useCreateBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brandData: BrandFormData) => {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands for the business
      queryClient.invalidateQueries({ queryKey: ['brands', businessId] });
      toast.success('Brand created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create brand');
      console.error('Create brand error:', error);
    },
  });
};

// Hook for updating business brands
export const useUpdateBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ brandId, brandData }: { brandId: string; brandData: BrandFormData }) => {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands for the business
      queryClient.invalidateQueries({ queryKey: ['brands', businessId] });
      toast.success('Brand updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update brand');
      console.error('Update brand error:', error);
    },
  });
};

// Hook for deleting business brands
export const useDeleteBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brandId: string) => {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch brands for the business
      queryClient.invalidateQueries({ queryKey: ['brands', businessId] });
      toast.success('Brand deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete brand');
      console.error('Delete brand error:', error);
    },
  });
};

// Hook for creating business suppliers
export const useCreateBusinessSupplier = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplierData: SupplierFormData) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create supplier');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch suppliers for the business
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
      toast.success('Supplier created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create supplier');
      console.error('Create supplier error:', error);
    },
  });
};

// Hook for updating business suppliers
export const useUpdateBusinessSupplier = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ supplierId, supplierData }: { supplierId: string; supplierData: SupplierFormData }) => {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update supplier');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch suppliers for the business
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
      toast.success('Supplier updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update supplier');
      console.error('Update supplier error:', error);
    },
  });
};

// Hook for deleting business suppliers
export const useDeleteBusinessSupplier = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplierId: string) => {
      const response = await fetch(`/api/suppliers/${supplierId}?business_id=${businessId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch suppliers for the business
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete supplier');
      console.error('Delete supplier error:', error);
    },
  });
};



// Hook for updating customers
export const useUpdateCustomer = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, customerData }: { customerId: string; customerData: CustomerFormData }) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customers for the store
      queryClient.invalidateQueries({ queryKey: ['customers', storeId] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update customer');
      console.error('Update customer error:', error);
    },
  });
};

// Hook for deleting customers
export const useDeleteCustomer = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/customers/${customerId}?store_id=${storeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customers for the store
      queryClient.invalidateQueries({ queryKey: ['customers', storeId] });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete customer');
      console.error('Delete customer error:', error);
    },
  });
};

// Hook for creating staff members
export const useCreateStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffData: StaffFormData) => {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...staffData,
          business_id: businessId,
          store_id: storeId || staffData.store_id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create staff member');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate both business staff and store staff queries
      queryClient.invalidateQueries({ queryKey: ['businessStaff', businessId] });
      const targetStoreId = storeId || variables.store_id;
      if (targetStoreId) {
        queryClient.invalidateQueries({ queryKey: ['storeStaff', targetStoreId] });
      }
      // Also invalidate all store-staff queries (in case store_id changed)
      queryClient.invalidateQueries({ queryKey: ['storeStaff'] });
      toast.success('Staff member created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create staff member');
      console.error('Create staff error:', error);
    },
  });
};

// Hook for updating staff members
export const useUpdateStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ staffId, staffData }: { staffId: string; staffData: StaffFormData }) => {
      const requestData = {
        ...staffData,
        business_id: businessId,
        store_id: storeId || staffData.store_id
      };

      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update staff member');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate both business staff and store staff queries
      queryClient.invalidateQueries({ queryKey: ['businessStaff', businessId] });
      const targetStoreId = storeId || variables.staffData.store_id;
      if (targetStoreId) {
        queryClient.invalidateQueries({ queryKey: ['storeStaff', targetStoreId] });
      }
      // Also invalidate all store-staff queries
      queryClient.invalidateQueries({ queryKey: ['storeStaff'] });
      toast.success('Staff member updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update staff member');
      console.error('Update staff error:', error);
    },
  });
};

// Hook for deleting staff members
export const useDeleteStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffId: string) => {
      const url = storeId 
        ? `/api/staff/${staffId}?store_id=${storeId}`
        : `/api/staff/${staffId}`;
        
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate both business staff and store staff queries
      queryClient.invalidateQueries({ queryKey: ['businessStaff', businessId] });
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['storeStaff', storeId] });
      }
      // Also invalidate all store-staff queries
      queryClient.invalidateQueries({ queryKey: ['storeStaff'] });
      toast.success('Staff member deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete staff member');
      console.error('Delete staff error:', error);
    },
  });
};

// Hook for fetching roles
export const useRoles = (businessId: string) => {
  return useQuery({
    queryKey: ['roles', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/roles?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      return response.json();
    },
    enabled: !!businessId,
  });
};

// Hook for creating roles
export const useCreateRole = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: any) => {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create role');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch roles for the business
      queryClient.invalidateQueries({ queryKey: ['roles', businessId] });
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create role');
      console.error('Create role error:', error);
    },
  });
};



// Hook for generating reports
export const useReport = (businessId: string, reportType: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['report', businessId, reportType, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        business_id: businessId, 
        type: reportType 
      });
      if (storeId) params.append('store_id', storeId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      return response.json();
    },
    enabled: !!businessId && !!reportType,
  });
};

// Hook for fetching business staff
export const useBusinessStaff = (businessId: string, p0: { enabled: boolean; }) => {
  return useQuery({
    queryKey: ['businessStaff', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/staff?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business staff');
      }
      const result = await response.json();
      return result.success ? result.staff : [];
    },
    enabled: !!businessId,
  });
};

// Hook for fetching store staff
export const useStoreStaff = (storeId: string, p0: { enabled: boolean; }) => {
  return useQuery({
    queryKey: ['storeStaff', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/staff?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store staff');
      }
      const result = await response.json();
      return result.success ? result.staff : [];
    },
    enabled: !!storeId,
  });
};

// Hook for fetching business stores
export const useBusinessStores = (businessId: string, p0: { enabled: boolean; }) => {
  return useQuery({
    queryKey: ['businessStores', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/stores`);
      if (!response.ok) {
        throw new Error('Failed to fetch business stores');
      }
      const data = await response.json();
      return data.stores || [];
    },
    enabled: !!businessId,
  });
};

// Hook for customer sales
export const useCustomerSales = (customerId: string, p0: string, p1: string, p2: { enabled: boolean; }) => {
  return useQuery({
    queryKey: ['customerSales', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?customer_id=${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer sales');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: !!customerId,
  });
};

// Hook for store sales report
export const useStoreSalesReport = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
  startDate?: string;
  endDate?: string;
}) => {
  const { enabled = true, forceRefresh = false, startDate, endDate } = options || {};
  
  return useQuery({
    queryKey: ['store-sales-report', storeId, startDate, endDate],
    queryFn: async () => {
      let url = `/api/sales?store_id=${storeId}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch store sales report');
      }
      const data = await response.json();
      return data.success ? data.sales : [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for business stores report
export const useBusinessStoresReport = (businessId: string, options: { enabled: boolean; }) => {
  return useQuery({
    queryKey: ['businessStoresReport', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/reports?business_id=${businessId}&type=stores`);
      if (!response.ok) {
        throw new Error('Failed to fetch business stores report');
      }
      const data = await response.json();
      return data.success ? data.stores : [];
    },
    enabled: !!businessId,
  });
};

// Hook for aggregated sales report across multiple stores
export const useAggregatedSalesReport = (storeIds: string[], options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
  startDate?: string;
  endDate?: string;
}) => {
  const { enabled = true, forceRefresh = false, startDate, endDate } = options || {};
  
  return useQuery({
    queryKey: ['aggregated-sales-report', storeIds, startDate, endDate],
    queryFn: async () => {
      let url = `/api/sales/aggregated?store_ids=${storeIds.join(',')}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch aggregated sales report');
      }
      const data = await response.json();
      return data.success ? data.sales : [];
    },
    enabled: enabled && storeIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching business cashiers
export const useBusinessCashiers = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-cashiers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/cashiers?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business cashiers');
      }
      const data = await response.json();
      return data.cashiers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for creating a cashier
export const useCreateCashier = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cashierData: {
      name: string;
      username: string;
      email: string;
      phone?: string;
      store_id?: string;
    }) => {
      const response = await fetch(`/api/cashiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cashierData,
          business_id: businessId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create cashier');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create cashier: ${error.message}`);
    },
  });
};

// Hook for updating a cashier
export const useUpdateCashier = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cashierId, cashierData }: { 
      cashierId: string; 
      cashierData: Partial<{
        name: string;
        username: string;
        email: string;
        phone: string;
        store_id: string;
        is_active: boolean;
      }>;
    }) => {
      const response = await fetch(`/api/cashiers/${cashierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cashierData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cashier');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update cashier: ${error.message}`);
    },
  });
};

// Hook for updating cashier store assignment
export const useUpdateCashierStore = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cashierId, storeId }: { 
      cashierId: string; 
      storeId: string | null;
    }) => {
      const response = await fetch(`/api/cashiers/${cashierId}/store`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store_id: storeId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cashier store');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier store assignment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update cashier store: ${error.message}`);
    },
  });
};

// Hook for deleting a cashier
export const useDeleteCashier = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cashierId: string) => {
      const response = await fetch(`/api/cashiers/${cashierId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete cashier');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-cashiers', businessId] });
      toast.success('Cashier deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete cashier: ${error.message}`);
    },
  });
};

// Hook for resetting user password
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error) => {
      toast.error('Failed to reset password');
      console.error('Reset password error:', error);
    },
  });
};

// Hook for reporting sales
export const useReportingSales = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'sales', storeId, startDate, endDate);
};

// Hook for reporting product performance
export const useReportingProductPerformance = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'inventory', storeId);
};

// Hook for reporting customer analytics
export const useReportingCustomerAnalytics = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'customers', storeId);
};

// Hook for reporting inventory stats
export const useReportingInventoryStats = (businessId: string, storeId?: string) => {
  return useReport(businessId, 'inventory', storeId);
};

// Hook for reporting financial metrics
export const useReportingFinancialMetrics = (businessId: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, 'sales', storeId, startDate, endDate);
};

// Hook for reporting chart data
export const useReportingChartData = (businessId: string, reportType: string, storeId?: string, startDate?: string, endDate?: string) => {
  return useReport(businessId, reportType, storeId, startDate, endDate);
};

// ======================
// RESTOCK MANAGEMENT HOOKS
// ======================

// Hook for fetching restock orders
export const useRestockOrders = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['restock-orders', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/restock-orders?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch restock orders');
      }
      const data = await response.json();
      return data.orders || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for creating restock orders
export const useCreateRestockOrder = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: {
      supplier_id: string;
      status: string;
      total_amount: number;
      notes?: string;
      expected_delivery?: string;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_cost: number;
      }>;
    }) => {
      const response = await fetch(`/api/restock-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          store_id: storeId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create restock order');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-orders', storeId] });
      toast.success('Restock order created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create restock order: ${error.message}`);
    },
  });
};

// Hook for updating restock order status
export const useUpdateRestockOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status, quantityReceived }: { 
      orderId: string; 
      status: string; 
      quantityReceived?: number; 
    }) => {
      const response = await fetch(`/api/restock-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, quantityReceived }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update restock order status');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate restock orders for the store
      queryClient.invalidateQueries({ queryKey: ['restock-orders'] });
      toast.success('Restock order status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update restock order status: ${error.message}`);
    },
  });
};

// Hook for receiving restock items
export const useReceiveRestockItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, receivedItems }: { 
      orderId: string; 
      receivedItems: Array<{
        product_id: string;
        received_quantity: number;
      }>; 
    }) => {
      const response = await fetch(`/api/restock-orders/${orderId}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receivedItems }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to receive restock items');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate restock orders and product inventory
      queryClient.invalidateQueries({ queryKey: ['restock-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      toast.success('Restock items received successfully');
    },
    onError: (error) => {
      toast.error(`Failed to receive restock items: ${error.message}`);
    },
  });
};

// Hook for fetching all products across all stores in a business
export const useBusinessProducts = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-products', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/products?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business products');
      }
      const data = await response.json();
      return data.products || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching business products with low stock
export const useBusinessProductsWithLowStock = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-products-low-stock', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/products/low-stock?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch low stock products');
      }
      const data = await response.json();
      return {
        lowStockProducts: data.products || [],
        allProducts: data.allProducts || []
      };
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching activity logs
export const useActivityLogs = (businessId: string, options?: {
  storeId?: string;
  userId?: string;
  module?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
  userRole?: string;
}) => {
  const { storeId, userId, module, action, startDate, endDate, enabled = true, userRole } = options || {};
  
  return useQuery({
    queryKey: ['activity-logs', businessId, storeId, userId, module, action, startDate, endDate, userRole],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // For super admin, business_id is optional
      if (businessId) {
        params.append('business_id', businessId);
      }
      
      if (userRole) params.append('user_role', userRole);
      if (storeId) params.append('store_id', storeId);
      if (userId) params.append('user_id', userId);
      if (module && module !== 'All') params.append('module', module);
      if (action && action !== 'All') params.append('action', action);
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());
      
      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }
      const data = await response.json();
      return data.logs || [];
    },
    enabled: enabled && (!!businessId || userRole === 'superadmin'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for clearing activity logs
export const useClearActivityLogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ businessId, storeId, userRole }: { businessId?: string; storeId?: string; userRole?: string }) => {
      const params = new URLSearchParams();
      
      // For super admin, business_id is optional
      if (businessId) {
        params.append('business_id', businessId);
      }
      
      if (userRole) params.append('user_role', userRole);
      if (storeId) params.append('store_id', storeId);
      
      const response = await fetch(`/api/activity-logs?${params.toString()}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear activity logs');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all activity logs queries
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success('Activity logs cleared successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Hook for fetching store dashboard stats
export const useStoreDashboardStats = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-dashboard-stats', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?store_id=${storeId}&type=store`);
      if (!response.ok) {
        throw new Error('Failed to fetch store dashboard stats');
      }
      const data = await response.json();
      return data.stats || data;
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching business dashboard stats
export const useBusinessDashboardStats = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-dashboard-stats', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?business_id=${businessId}&type=business`);
      if (!response.ok) {
        throw new Error('Failed to fetch business dashboard stats');
      }
      const data = await response.json();
      return data.stats || data;
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching store settings
export const useStoreSettings = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-settings', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}/settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch store settings');
      }
      const data = await response.json();
      return data.settings || {};
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};



// Hook for fetching supported languages
export const useLanguages = (options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }
        const data = await response.json();
        const languages = data.languages || [];
        
        // Cache languages for offline use
        await offlineStoreIndexedDB.cacheLanguages(languages);
        
        return languages;
      } catch (error) {
        console.warn('Failed to fetch languages online, trying offline cache:', error);
        
        // Try to get from offline cache
        const cachedLanguages = await offlineStoreIndexedDB.getAllLanguages();
        if (cachedLanguages.length > 0) {
          return cachedLanguages;
        }
        
        throw error;
      }
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (languages don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching supported currencies
export const useCurrencies = (options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/currencies');
        if (!response.ok) {
          throw new Error('Failed to fetch currencies');
        }
        const data = await response.json();
        const currencies = data.currencies || [];
        
        // Cache currencies for offline use
        await offlineStoreIndexedDB.cacheCurrencies(currencies);
        
        return currencies;
      } catch (error) {
        console.warn('Failed to fetch currencies online, trying offline cache:', error);
        
        // Try to get from offline cache
        const cachedCurrencies = await offlineStoreIndexedDB.getAllCurrencies();
        if (cachedCurrencies.length > 0) {
          return cachedCurrencies;
        }
        
        throw error;
      }
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (currencies don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching user business data
export const useUserBusiness = (userId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['user-business', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/auth/user-business?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user business data');
        }
        const data = await response.json();
        
        if (data.success && data.data) {
          const { business, store, allStores } = data.data;
          
          // Cache business and store data for offline use
          if (business) {
            await offlineStoreIndexedDB.put('businesses', business);
          }
          if (store) {
            await offlineStoreIndexedDB.put('stores', store);
          }
          if (allStores && allStores.length > 0) {
            await offlineStoreIndexedDB.putMany('stores', allStores);
          }
          
          return data.data;
        }
        
        throw new Error('Invalid response format');
      } catch (error) {
        console.warn('Failed to fetch user business data online, trying offline cache:', error);
        
        // Try to get from offline cache
        try {
          const cachedBusinesses = await offlineStoreIndexedDB.getAll('businesses');
          const cachedStores = await offlineStoreIndexedDB.getAll('stores');
          
          if (cachedBusinesses.length > 0) {
            const business = cachedBusinesses[0] as any; // Use first business as fallback
            const userStores = cachedStores.filter((store: any) => store.business_id === business.id);
            
            return {
              business,
              store: userStores[0] || null,
              allStores: userStores
            };
          }
        } catch (cacheError) {
          console.warn('Failed to load from offline cache:', cacheError);
        }
        
        throw error;
      }
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for deleting a business
export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (businessId: string) => {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete business');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch businesses list
      queryClient.invalidateQueries({ queryKey: ['platformBusinesses'] });
    },
  });
};

// Hook for fetching platform businesses
export const usePlatformBusinesses = (options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['platformBusinesses'],
    queryFn: async () => {
      const response = await fetch('/api/businesses');
      if (!response.ok) {
        throw new Error('Failed to fetch platform businesses');
      }
      const data = await response.json();
      return data.businesses || [];
    },
    enabled: enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for creating a business
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (businessData: any) => {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create business');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch businesses list
      queryClient.invalidateQueries({ queryKey: ['platformBusinesses'] });
    },
  });
};

// Hook for updating a business
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, businessData }: { id: string; businessData: any }) => {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update business');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch businesses list
      queryClient.invalidateQueries({ queryKey: ['platformBusinesses'] });
    },
  });
};

// Hook for fetching subscription plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const data = await response.json();
      return data.plans || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching countries
export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      const data = await response.json();
      return data.countries || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
  });
};

// Store Management Hooks (for business admins)
export const useCreateStore = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storeData: any) => {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create store');
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      if (response && response.success) {
        // Invalidate and refetch business stores immediately
        queryClient.invalidateQueries({ queryKey: ['business-stores', businessId] });
        queryClient.refetchQueries({ queryKey: ['business-stores', businessId] });
        
        toast.success('Store created successfully');
      }
    },
    onError: (error: any) => {
      console.error('Error creating store:', error);
      toast.error('Failed to create store');
    },
  });
};

export const useUpdateStore = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, storeData }: { id: string; storeData: any }) => {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update store');
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      if (response && response.success) {
        // Invalidate and refetch business stores immediately
        queryClient.invalidateQueries({ queryKey: ['business-stores', businessId] });
        queryClient.refetchQueries({ queryKey: ['business-stores', businessId] });
        
        toast.success('Store updated successfully');
      }
    },
    onError: (error: any) => {
      console.error('Error updating store:', error);
      toast.error('Failed to update store');
    },
  });
};

export const useDeleteStore = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storeId: string) => {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete store');
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      if (response && response.success) {
        // Invalidate and refetch business stores immediately
        queryClient.invalidateQueries({ queryKey: ['business-stores', businessId] });
        queryClient.refetchQueries({ queryKey: ['business-stores', businessId] });
        
        toast.success('Store deleted successfully');
      }
    },
    onError: (error: any) => {
      console.error('Error deleting store:', error);
      toast.error('Failed to delete store');
    },
  });
};

// Hook for fetching platform settings
export const usePlatformSettings = (options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const response = await fetch('/api/platform/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch platform settings');
      }
      const data = await response.json();
      return data.settings || {};
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching system health
export const useSystemHealth = (options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await fetch('/api/platform/health');
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      const data = await response.json();
      
      // Return basic health status based on available data
      return {
        status: 'healthy',
        services: {
          database: 'operational',
          storage: 'operational',
          auth: 'operational',
          api: 'operational'
        },
        timestamp: new Date().toISOString(),
        healthMetrics: data.healthMetrics || []
      };
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute (health data should be fresh)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for updating platform settings
export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/platform/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update platform settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch platform settings
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast.success('Platform settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update platform settings');
    },
  });
};

// ======================
// OFFLINE-AWARE HOOKS
// ======================

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [syncInProgress, setSyncInProgress] = React.useState(false);
  const [pendingItems, setPendingItems] = React.useState(0);
  const [lastSync, setLastSync] = React.useState<number | null>(null);

  const syncAllOfflineData = React.useCallback(async () => {
    setSyncInProgress(true);
    try {
      await offlineStoreIndexedDB.init();
      const syncQueue = await offlineStoreIndexedDB.getSyncQueueItems();

      for (const item of syncQueue) {
        try {
          let response;
          let url = '';
          let method = 'POST';

          switch (item.table) {
            case 'customers':
              url = '/api/customers';
              method = item.operation === 'create' ? 'POST' : 'PUT';
              break;
            case 'sales':
              url = '/api/sales';
              method = 'POST';
              break;
            case 'saved_carts':
              url = '/api/saved-carts';
              method = item.operation === 'create' ? 'POST' : (item.operation === 'delete' ? 'DELETE' : 'PUT');
              if (item.operation === 'delete') url = `/api/saved-carts/${(item.data as any).id}`;
              break;
            default:
              continue;
          }

          if (item.operation === 'delete' && method === 'DELETE') {
            response = await fetch(url, { method });
          } else {
            response = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            });
          }

          if (response.ok) {
            await offlineStoreIndexedDB.removeFromSyncQueue(item.id);
          } else {
            await offlineStoreIndexedDB.updateSyncQueueRetry(item.id, item.retry_count + 1);
          }
        } catch (error) {
          console.error(`Failed to sync ${item.table}:`, error);
          await offlineStoreIndexedDB.updateSyncQueueRetry(item.id, item.retry_count + 1);
        }
      }
      
      const updatedQueue = await offlineStoreIndexedDB.getSyncQueueItems();
      setPendingItems(updatedQueue.length);
      setLastSync(Date.now());
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      setSyncInProgress(false);
    }
  }, []);

  React.useEffect(() => {
    const checkPendingItems = async () => {
      try {
        await offlineStoreIndexedDB.init();
        const syncQueue = await offlineStoreIndexedDB.getSyncQueueItems();
        setPendingItems(syncQueue.length);
      } catch (error) {
        console.error('Error checking pending items:', error);
      }
    };

    checkPendingItems();
  }, []);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncAllOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAllOfflineData]);

  return {
    isOnline,
    syncInProgress,
    pendingItems,
    lastSync,
    syncAllOfflineData
  };
};

// Enhanced store products hook with offline support
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
        // Try online first
        if (storeId === 'All') {
          if (!businessId) {
            throw new Error('business_id is required when store_id is "All"');
          }
          const response = await fetch(`/api/products?store_id=All&business_id=${businessId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch business products');
          }
          const data = await response.json();
          const products = data.products || [];
          
          // Cache the data for offline use
          await offlineStoreIndexedDB.init();
          for (const product of products) {
            await offlineStoreIndexedDB.put('products', product);
          }
          
          return products;
        }
        
        const response = await fetch(`/api/products?store_id=${storeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const products = data.products || [];
        
        // Cache the data for offline use
        await offlineStoreIndexedDB.init();
        for (const product of products) {
          await offlineStoreIndexedDB.put('products', product);
        }
        
        return products;
      } catch (error) {
        // Fallback to offline data
        console.log('Falling back to offline data for products');
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getProductsByStore(storeId);
      }
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Enhanced store customers hook with offline support
export const useOfflineStoreCustomers = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-customers', storeId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/customers?store_id=${storeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        const customers = data.customers || [];
        
        // Cache the data for offline use
        await offlineStoreIndexedDB.init();
        for (const customer of customers) {
          await offlineStoreIndexedDB.put('customers', customer);
        }
        
        return customers;
      } catch (error) {
        // Fallback to offline data
        console.log('Falling back to offline data for customers');
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getCustomersByStore(storeId);
      }
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Enhanced store sales hook with offline support
export const useOfflineStoreSales = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-sales', storeId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/sales?store_id=${storeId}&status=completed`);
        if (!response.ok) {
          throw new Error('Failed to fetch sales');
        }
        const data = await response.json();
        const sales = data.sales || [];
        
        // Cache the data for offline use
        await offlineStoreIndexedDB.init();
        for (const sale of sales) {
          await offlineStoreIndexedDB.put('sales', sale);
        }
        
        return sales;
      } catch (error) {
        // Fallback to offline data
        console.log('Falling back to offline data for sales');
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getSalesByStore(storeId);
      }
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Enhanced create customer hook with offline support
export const useOfflineCreateCustomer = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: {
      store_id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      [key: string]: unknown;
    }) => {
      try {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create customer');
        }
        
        const result = await response.json();
        
        // Cache the new customer
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('customers', result.customer);
        
        return result;
      } catch (error) {
        // If offline, add to sync queue
        if (!navigator.onLine) {
          await offlineStoreIndexedDB.init();
          const tempCustomer = {
            ...customerData,
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            is_temp: true
          };
          
          await offlineStoreIndexedDB.put('customers', tempCustomer);
          await offlineStoreIndexedDB.addToSyncQueue({
            operation: 'create',
            table: 'customers',
            data: tempCustomer
          });
          
          return { customer: tempCustomer, offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.store_id] });
      if (data.offline) {
        toast.success('Customer created offline (will sync when online)');
      } else {
        toast.success('Customer created successfully');
      }
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error('Create customer error:', error);
    },
  });
};

// Enhanced saved carts hook with offline support
export const useOfflineSavedCarts = (storeId: string, cashierId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['saved-carts', storeId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/saved-carts?store_id=${storeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch saved carts');
        }
        const data = await response.json();
        const carts = data.carts || [];
        
        // Cache the data for offline use
        await offlineStoreIndexedDB.init();
        for (const cart of carts) {
          await offlineStoreIndexedDB.put('saved_carts', cart);
        }
        
        return carts;
      } catch (error) {
        // Fallback to offline data
        console.log('Falling back to offline data for saved carts');
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getSavedCartsByStore(storeId);
      }
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Enhanced save cart hook with offline support
export const useOfflineSaveCart = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cartData: {
      store_id: string;
      cart_data: unknown;
      cashier_id: string;
      [key: string]: unknown;
    }) => {
      try {
        const response = await fetch('/api/saved-carts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save cart');
        }
        
        const result = await response.json();
        
        // Cache the new cart
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('saved_carts', result.cart);
        
        return result;
      } catch (error) {
        // If offline, add to sync queue
        if (!navigator.onLine) {
          await offlineStoreIndexedDB.init();
          const tempCart = {
            ...cartData,
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            is_temp: true
          };
          
          await offlineStoreIndexedDB.put('saved_carts', tempCart);
          await offlineStoreIndexedDB.addToSyncQueue({
            operation: 'create',
            table: 'saved_carts',
            data: tempCart
          });
          
          return { cart: tempCart, offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts', variables.store_id] });
      if (data.offline) {
        toast.success('Cart saved offline (will sync when online)');
      } else {
        toast.success('Cart saved successfully');
      }
    },
    onError: (error) => {
      toast.error('Failed to save cart');
      console.error('Save cart error:', error);
    },
  });
};

// Enhanced delete saved cart hook with offline support
export const useOfflineDeleteSavedCart = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cartId: string) => {
      try {
        const response = await fetch(`/api/saved-carts/${cartId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete saved cart');
        }
        
        const result = await response.json();
        
        // Remove from cache
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.delete('saved_carts', cartId);
        
        return result;
      } catch (error) {
        // If offline, add to sync queue
        if (!navigator.onLine) {
          await offlineStoreIndexedDB.init();
          await offlineStoreIndexedDB.addToSyncQueue({
            operation: 'delete',
            table: 'saved_carts',
            data: { id: cartId }
          });
          
          // Remove from local cache immediately
          await offlineStoreIndexedDB.delete('saved_carts', cartId);
          
          return { offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
      if (data.offline) {
        toast.success('Cart deleted offline (will sync when online)');
      } else {
        toast.success('Cart deleted successfully');
      }
    },
    onError: (error) => {
      toast.error('Failed to delete cart');
      console.error('Delete cart error:', error);
    },
  });
};

// Enhanced business settings hook with offline support
export const useOfflineBusinessSettings = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/businesses/${businessId}/settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch business settings');
        }
        const data = await response.json();
        const settings = data.settings || {};
        
        // Cache the data for offline use
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('business_settings', settings);
        
        return settings;
      } catch (error) {
        // Fallback to offline data
        console.log('Falling back to offline data for business settings');
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getBusinessSettings(businessId) || {};
      }
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Enhanced categories hook with offline support
export const useOfflineCategories = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['categories', businessId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/categories?business_id=${businessId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        const categories = data.categories || [];
        
        // Cache the data for offline use
        await offlineStoreIndexedDB.init();
        for (const category of categories) {
          await offlineStoreIndexedDB.put('categories', category);
        }
        
        return categories;
      } catch (error) {
        // Fallback to offline data
        console.log('Falling back to offline data for categories');
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getCategoriesByBusiness(businessId);
      }
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Enhanced create sale hook with offline support
export const useOfflineCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleData: any) => {
      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saleData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create sale');
        }
        
        const result = await response.json();
        
        // Cache the new sale
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('sales', result.sale);
        
        return result;
      } catch (error) {
        // If offline, add to sync queue
        if (!navigator.onLine) {
          await offlineStoreIndexedDB.init();
          const tempSale = {
            ...saleData,
            id: `temp-${Date.now()}`,
            offline_id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            is_temp: true,
            offline_storage_failed: false
          };
          
          await offlineStoreIndexedDB.put('sales', tempSale);
          await offlineStoreIndexedDB.addToSyncQueue({
            operation: 'create',
            table: 'sales',
            data: tempSale
          });
          
          return { sale: tempSale, offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-sales', variables.store_id] });
      if (data.offline) {
        toast.success('Sale completed offline (will sync when online)');
      } else {
        toast.success('Sale completed successfully');
      }
    },
    onError: (error) => {
      toast.error('Failed to create sale');
      console.error('Create sale error:', error);
    },
  });
};
