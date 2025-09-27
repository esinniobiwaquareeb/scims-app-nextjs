'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sale } from '@/types';

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [pendingItems, setPendingItems] = useState(0);

  // Check for pending offline sales
  useEffect(() => {
    const offlineSales = JSON.parse(localStorage.getItem('offline_sales') || '[]');
    setPendingItems(offlineSales.length);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncOfflineSales();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineSales = async () => {
    const offlineSales = JSON.parse(localStorage.getItem('offline_sales') || '[]');
    if (offlineSales.length === 0) return;

    setSyncInProgress(true);
    try {
      for (const sale of offlineSales) {
        try {
          const response = await fetch('/api/sales', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sale),
          });
          
          if (response.ok) {
            // Remove synced sale from localStorage
            const updatedSales = offlineSales.filter((s: Sale & { id: string }) => s.id !== sale.id);
            localStorage.setItem('offline_sales', JSON.stringify(updatedSales));
            setPendingItems(updatedSales.length);
          }
        } catch (error) {
          console.error('Failed to sync offline sale:', error);
        }
      }
    } finally {
      setSyncInProgress(false);
    }
  };

  return {
    isOnline,
    syncInProgress,
    pendingItems,
    lastSync: 0,
    syncOfflineSales
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

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        // Try online first
        if (isOnline) {
          return await mutationFn(variables);
        } else {
          // Offline storage and sync not yet implemented
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
        // Store sale in localStorage for offline mode
        const offlineSales = JSON.parse(localStorage.getItem('offline_sales') || '[]');
        const offlineSale = {
          ...saleData,
          id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isOffline: true,
          created_at: new Date().toISOString(),
          status: 'pending_sync'
        };
        
        offlineSales.push(offlineSale);
        localStorage.setItem('offline_sales', JSON.stringify(offlineSales));
        
        // Return the offline sale data
        return { data: offlineSale, success: true, offline: true };
      }
    },
    onSuccess: (data, variables) => {
      if (data.offline) {
        // For offline sales, just show success message
        console.log('Sale saved offline, will sync when online');
      } else {
        // Invalidate and refetch sales for the store when online
        queryClient.invalidateQueries({ queryKey: ['store-sales', variables.store_id] });
        queryClient.invalidateQueries({ queryKey: ['cashier-sales', variables.cashier_id, variables.store_id] });
      }
    },
    onError: (error) => {
      console.error('Create sale error:', error);
    },
  });
};
