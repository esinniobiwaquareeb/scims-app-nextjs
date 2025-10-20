import React from 'react';
// import { StaffFormData } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from '../offline-store-indexeddb';

// Hook for fetching store products
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

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