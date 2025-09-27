// ============================================================================
// STORE STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StoreFormData, StoreSettingsFormData } from '@/types';

// Hook for fetching business stores
export const useBusinessStores = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-stores', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/stores?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business stores');
      }
      const data = await response.json();
      return { stores: data.stores || [] };
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching a single store
export const useStore = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store');
      }
      const data = await response.json();
      return data.store;
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating a store
export const useCreateStore = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storeData: StoreFormData) => {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storeData,
          business_id: businessId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create store');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['business-stores', businessId] });
      
      toast.success('Store created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create store');
    },
  });
};

// Hook for updating a store
export const useUpdateStore = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ storeId, storeData }: { storeId: string; storeData: Partial<StoreFormData> }) => {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update store');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['business-stores', businessId] });
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
      
      toast.success('Store updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update store');
    },
  });
};

// Hook for deleting a store
export const useDeleteStore = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storeId: string) => {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete store');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['business-stores', businessId] });
      queryClient.removeQueries({ queryKey: ['store', variables] });
      
      toast.success('Store deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete store');
    },
  });
};

// Hook for fetching store settings
export const useStoreSettings = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store-settings', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}/settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch store settings');
      }
      const data = await response.json();
      return data.settings;
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for updating store settings
export const useUpdateStoreSettings = (storeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settingsData: StoreSettingsFormData) => {
      const response = await fetch(`/api/stores/${storeId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update store settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch store settings
      queryClient.invalidateQueries({ queryKey: ['store-settings', storeId] });
      queryClient.invalidateQueries({ queryKey: ['store', storeId] });
      
      toast.success('Store settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update store settings');
    },
  });
};

// Hook for fetching store statistics
// Note: This endpoint is not implemented yet
export const useStoreStats = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store-stats', storeId],
    queryFn: async () => {
      // TODO: Implement /api/stores/{storeId}/stats endpoint
      return {};
    },
    enabled: false, // Disabled until endpoint is implemented
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching store performance
export const useStorePerformance = (storeId: string, period: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store-performance', storeId, period],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}/performance?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store performance');
      }
      const data = await response.json();
      return data.data || {};
    },
    enabled: enabled && !!storeId && !!period,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching store activity
export const useStoreActivity = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store-activity', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}/activity`);
      if (!response.ok) {
        throw new Error('Failed to fetch store activity');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching store staff
export const useStoreStaff = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store-staff', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}/staff`);
      if (!response.ok) {
        throw new Error('Failed to fetch store staff');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};


// Hook for fetching store sales
export const useStoreSales = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store-sales', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store sales');
      }
      const data = await response.json();
      return data.sales || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching store customers
export const useStoreCustomers = (storeId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['store-customers', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/customers?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store customers');
      }
      const data = await response.json();
      return data.customers || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
