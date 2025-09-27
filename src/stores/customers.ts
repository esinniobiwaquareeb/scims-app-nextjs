// ============================================================================
// CUSTOMER STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomerFormData } from '@/types';

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

// Hook for fetching all customers (for admin views)
export const useAllCustomers = (options?: {
  enabled?: boolean;
  businessId?: string;
}) => {
  const { enabled = true, businessId } = options || {};
  
  return useQuery({
    queryKey: ['all-customers', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/customers?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch all customers');
      }
      const data = await response.json();
      return data.customers || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching a single customer
export const useCustomer = (customerId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      const data = await response.json();
      return data.customer;
    },
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating a customer
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: CustomerFormData & { store_id: string }) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customers
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['all-customers'] });
      
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
};

// Hook for updating a customer
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...customerData }: CustomerFormData & { id: string; store_id: string }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customers
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['all-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
};

// Hook for deleting a customer
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId }: { customerId: string; storeId: string }) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customers
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['all-customers'] });
      queryClient.removeQueries({ queryKey: ['customer', variables.customerId] });
      
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
};

// Hook for searching customers
export const useSearchCustomers = (storeId: string, searchTerm: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['search-customers', storeId, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/customers/search?store_id=${storeId}&q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search customers');
      }
      const data = await response.json();
      return data.customers || [];
    },
    enabled: enabled && !!storeId && !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
