// ============================================================================
// BUSINESS STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BusinessDetail } from '@/types';

// Hook for fetching business details
export const useBusiness = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business details');
      }
      const data = await response.json();
      return data.business;
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching business statistics
export const useBusinessStats = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['business-stats', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch business statistics');
      }
      const data = await response.json();
      return data.stats || data.data || {};
    },
    enabled: enabled && !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching business data for detail view
export const useBusinessDetailData = (businessId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['business-detail-data', businessId],
    queryFn: async () => {
      const [productsResponse, usersResponse, activityResponse, salesResponse] = await Promise.all([
        fetch(`/api/products?business_id=${businessId}`),
        fetch(`/api/staff?business_id=${businessId}`),
        fetch(`/api/activity-logs?business_id=${businessId}`),
        fetch(`/api/sales?business_id=${businessId}`)
      ]);

      const productsData = productsResponse.ok ? (await productsResponse.json()).products || [] : [];
      const usersData = usersResponse.ok ? (await usersResponse.json()).staff || [] : [];
      const activityLogs = activityResponse.ok ? (await activityResponse.json()).logs || [] : [];
      const salesData = salesResponse.ok ? (await salesResponse.json()).sales || [] : [];

      return {
        products: productsData,
        users: usersData,
        activity: activityLogs,
        sales: salesData
      };
    },
    enabled: enabled && !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for updating business
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ businessId, businessData }: { businessId: string; businessData: Partial<BusinessDetail> }) => {
      const response = await fetch(`/api/business/${businessId}`, {
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
      // Invalidate and refetch business data
      queryClient.invalidateQueries({ queryKey: ['business', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-stats', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-detail-data', variables.businessId] });
      
      toast.success('Business updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update business');
    },
  });
};

// Hook for exporting business data
export const useExportBusinessData = () => {
  return useMutation({
    mutationFn: async ({
      businessId,
      includeProducts = true,
      includeUsers = true,
      includeActivity = true,
      includeSales = true,
      format = 'csv'
    }: {
      businessId: string;
      includeProducts?: boolean;
      includeUsers?: boolean;
      includeActivity?: boolean;
      includeSales?: boolean;
      format?: 'csv' | 'json' | 'xlsx';
    }) => {
      const params = new URLSearchParams({
        business_id: businessId,
        format,
        ...(includeProducts && { include_products: 'true' }),
        ...(includeUsers && { include_users: 'true' }),
        ...(includeActivity && { include_activity: 'true' }),
        ...(includeSales && { include_sales: 'true' }),
      });

      const response = await fetch(`/api/business/${businessId}/export?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export business data');
      }
      
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-data-${variables.businessId}-${new Date().toISOString().split('T')[0]}.${variables.format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Business data exported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export business data');
    },
  });
};
