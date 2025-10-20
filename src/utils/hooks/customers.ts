import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from '../offline-store-indexeddb';
import type { CustomerFormData } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const useStoreCustomers = (storeId: string, options?: { enabled?: boolean; forceRefresh?: boolean; }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['store-customers', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/customers?store_id=${storeId}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      return data.customers || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerData: { store_id: string } & Record<string, unknown>) => {
      const response = await fetch('/api/customers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error('Failed to create customer');
      return response.json();
    },
    onSuccess: (_data, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.store_id] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error('Create customer error:', error);
    },
  });
};

export const useUpdateCustomer = (storeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, customerData }: { customerId: string; customerData: CustomerFormData }) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error('Failed to update customer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', storeId] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update customer');
      console.error('Update customer error:', error);
    },
  });
};

export const useDeleteCustomer = (storeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/customers/${customerId}?store_id=${storeId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete customer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', storeId] });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete customer');
      console.error('Delete customer error:', error);
    },
  });
};

export const useCustomerSales = (customerId: string) => {
  return useQuery({
    queryKey: ['customerSales', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?customer_id=${customerId}`);
      if (!response.ok) throw new Error('Failed to fetch customer sales');
      const data = await response.json();
      return data.sales || [];
    },
    enabled: !!customerId,
  });
};

export const useOfflineStoreCustomers = (storeId: string, options?: { enabled?: boolean; forceRefresh?: boolean; }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['store-customers', storeId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/customers?store_id=${storeId}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        const customers = data.customers || [];
        await offlineStoreIndexedDB.init();
        for (const customer of customers) await offlineStoreIndexedDB.put('customers', customer);
        return customers;
      } catch {
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

export const useOfflineCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerData: any) => {
      try {
        const response = await fetch('/api/customers', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customerData),
        });
        if (!response.ok) throw new Error('Failed to create customer');
        const result = await response.json();
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('customers', result.customer);
        return result;
      } catch (error) {
        if (!navigator.onLine) {
          await offlineStoreIndexedDB.init();
          const tempCustomer = { ...customerData, id: `temp-${Date.now()}`, created_at: new Date().toISOString(), is_temp: true };
          await offlineStoreIndexedDB.put('customers', tempCustomer);
          await offlineStoreIndexedDB.addToSyncQueue({ operation: 'create', table: 'customers', data: tempCustomer });
          return { customer: tempCustomer, offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.store_id] });
      toast.success(data?.offline ? 'Customer created offline (will sync when online)' : 'Customer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error('Create customer error:', error);
    },
  });
};


