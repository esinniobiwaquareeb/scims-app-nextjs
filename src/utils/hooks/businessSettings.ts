/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from '../offline-store-indexeddb';

export const useBusinessSettings = (businessId: string, options?: { enabled?: boolean; forceRefresh?: boolean }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/settings`);
      if (!response.ok) throw new Error('Failed to fetch business settings');
      const data = await response.json();
      return data.settings || {};
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

export const useUpdateBusinessSettings = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch(`/api/businesses/${businessId}/settings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update business settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      toast.success('Business settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update business settings');
    },
  });
};

export const useOfflineBusinessSettings = (businessId: string, options?: { enabled?: boolean; forceRefresh?: boolean }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/businesses/${businessId}/settings`);
        if (!response.ok) throw new Error('Failed to fetch business settings');
        const data = await response.json();
        const settings = data.settings || {};
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('business_settings', settings);
        return settings;
      } catch {
        await offlineStoreIndexedDB.init();
        return (await offlineStoreIndexedDB.getBusinessSettings(businessId)) || {};
      }
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};


