/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from '../offline-store-indexeddb';

export const useUserBusiness = (userId: string, options?: { enabled?: boolean; forceRefresh?: boolean; }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['user-business', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/auth/user-business?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user business data');
        const data = await response.json();
        if (data.success && data.data) {
          const { business, store, allStores } = data.data;
          if (business) await offlineStoreIndexedDB.put('businesses', business);
          if (store) await offlineStoreIndexedDB.put('stores', store);
          if (allStores && allStores.length > 0) await offlineStoreIndexedDB.putMany('stores', allStores);
          return data.data;
        }
        throw new Error('Invalid response format');
      } catch (error) {
        // Fallback to offline cache
        try {
          const cachedBusinesses = await offlineStoreIndexedDB.getAll('businesses');
          const cachedStores = await offlineStoreIndexedDB.getAll('stores');
          if (cachedBusinesses.length > 0) {
            const business = cachedBusinesses[0] as any;
            const userStores = cachedStores.filter((store: any) => store.business_id === business.id);
            return { business, store: userStores[0] || null, allStores: userStores };
          }
        } catch (cacheError) {
          console.warn('Failed to load from offline cache:', cacheError);
        }
        throw error as Error;
      }
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (businessId: string) => {
      const response = await fetch(`/api/businesses/${businessId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete business');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformBusinesses'] });
    },
  });
};

export const useBusinesses = (options?: { enabled?: boolean; forceRefresh?: boolean; }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['platformBusinesses'],
    queryFn: async () => {
      const response = await fetch('/api/businesses');
      if (!response.ok) throw new Error('Failed to fetch platform businesses');
      const data = await response.json();
      return data.businesses || [];
    },
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (businessData: any) => {
      const response = await fetch('/api/businesses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(businessData) });
      if (!response.ok) throw new Error('Failed to create business');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformBusinesses'] });
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, businessData }: { id: string; businessData: any }) => {
      const response = await fetch(`/api/businesses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(businessData) });
      if (!response.ok) throw new Error('Failed to update business');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformBusinesses'] });
    },
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) throw new Error('Failed to fetch subscription plans');
      const data = await response.json();
      return data.plans || [];
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      return data.countries || [];
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};


