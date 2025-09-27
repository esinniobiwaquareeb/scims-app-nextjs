// ============================================================================
// PLATFORM STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlatformBusiness, BusinessFormData, PlatformStats, ApiResponse, SubscriptionPlan, Country, Currency, Language } from '@/types';

// Hook for fetching all platform businesses
export const usePlatformBusinesses = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['platform-businesses'],
    queryFn: async () => {
      const response = await fetch('/api/platform/businesses');
      if (!response.ok) {
        throw new Error('Failed to fetch platform businesses');
      }
      const data: ApiResponse<PlatformBusiness[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching subscription plans
export const useSubscriptionPlans = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const data: ApiResponse<SubscriptionPlan[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - plans don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for fetching countries
export const useCountries = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      const data: ApiResponse<Country[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - countries don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for fetching currencies
export const useCurrencies = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await fetch('/api/currencies');
      if (!response.ok) {
        throw new Error('Failed to fetch currencies');
      }
      const data: ApiResponse<Currency[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - currencies don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for fetching languages
export const useLanguages = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await fetch('/api/languages');
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      const data: ApiResponse<Language[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - languages don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for fetching platform statistics
export const usePlatformStats = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const response = await fetch('/api/platform/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch platform statistics');
      }
      const data: ApiResponse<PlatformStats> = await response.json();
      return data.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for creating a business
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (businessData: BusinessFormData) => {
      const response = await fetch('/api/platform/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create business');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch businesses
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      
      toast.success('Business created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create business');
    },
  });
};

// Hook for updating a business
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ businessId, businessData }: { businessId: string; businessData: Partial<BusinessFormData> }) => {
      const response = await fetch(`/api/platform/businesses/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update business');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch businesses
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      queryClient.invalidateQueries({ queryKey: ['business', variables.businessId] });
      
      toast.success('Business updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update business');
    },
  });
};

// Hook for deleting a business
export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (businessId: string) => {
      const response = await fetch(`/api/platform/businesses/${businessId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete business');
      }
      
      return response.json();
    },
    onSuccess: (data, businessId) => {
      // Invalidate and refetch businesses
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      queryClient.removeQueries({ queryKey: ['business', businessId] });
      
      toast.success('Business deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete business');
    },
  });
};

// Hook for exporting businesses
export const useExportBusinesses = () => {
  return useMutation({
    mutationFn: async ({
      includeStores = true,
      includeUsers = true,
      includeStats = true,
      format = 'csv'
    }: {
      includeStores?: boolean;
      includeUsers?: boolean;
      includeStats?: boolean;
      format?: 'csv' | 'json' | 'xlsx';
    }) => {
      const params = new URLSearchParams({
        format,
        ...(includeStores && { include_stores: 'true' }),
        ...(includeUsers && { include_users: 'true' }),
        ...(includeStats && { include_stats: 'true' }),
      });

      const response = await fetch(`/api/platform/businesses/export?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export businesses');
      }
      
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `businesses-export-${new Date().toISOString().split('T')[0]}.${variables.format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Businesses exported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export businesses');
    },
  });
};
