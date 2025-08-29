'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sale } from '@/types';

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    syncInProgress: false, // TODO: Implement sync status
    pendingItems: 0, // TODO: Implement pending items count
    lastSync: 0 // TODO: Implement last sync timestamp
  };
};

// Generic offline-aware query hook
export const useOfflineQuery = <T>(
  queryKey: string[],
  onlineQueryFn: () => Promise<T>,
  offlineQueryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  } = {}
) => {
  const { isOnline } = useNetworkStatus();
  
  return useQuery({
    queryKey: queryKey,
    queryFn: isOnline ? onlineQueryFn : offlineQueryFn,
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options.gcTime || 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options.refetchOnWindowFocus !== false,
    retry: isOnline ? 3 : 0, // Don't retry when offline
    retryDelay: 1000,
  });
};

// Generic offline-aware mutation hook
export const useOfflineMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  } = {}
) => {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        // Try online first
        if (isOnline) {
          return await mutationFn(variables);
        } else {
          // TODO: Implement offline storage and sync
          throw new Error('Offline mode not yet implemented');
        }
      } catch (error) {
        console.error('Mutation failed:', error);
        throw error;
      }
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
  });
};

// Hook for creating sales offline
export const useOfflineCreateSale = () => {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleData: Sale) => {
      if (isOnline) {
        // TODO: Replace with actual API endpoint when available
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
        
        return response.json();
      } else {
        // TODO: Implement offline sale storage
        throw new Error('Offline mode not yet implemented');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch sales for the store
      queryClient.invalidateQueries({ queryKey: ['store-sales', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['cashier-sales', variables.cashier_id, variables.store_id] });
    },
    onError: (error) => {
      console.error('Create sale error:', error);
    },
  });
};
