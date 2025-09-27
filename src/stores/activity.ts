// ============================================================================
// ACTIVITY LOG STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ActivityLogDisplay, ApiResponse } from '@/types';

// Hook for fetching activity logs
export const useActivityLogs = (
  businessId: string,
  options?: {
    storeId?: string;
    module?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    enabled?: boolean;
    userRole?: string;
  }
) => {
  const { 
    storeId, 
    module, 
    action, 
    startDate, 
    endDate, 
    enabled = true, 
    userRole 
  } = options || {};
  
  return useQuery({
    queryKey: ['activity-logs', businessId, storeId, module, action, startDate, endDate, userRole],
    queryFn: async () => {
      const params = new URLSearchParams({
        business_id: businessId,
        ...(storeId && { store_id: storeId }),
        ...(module && { module }),
        ...(action && { action }),
        ...(startDate && { start_date: startDate.toISOString() }),
        ...(endDate && { end_date: endDate.toISOString() }),
        ...(userRole && { user_role: userRole }),
      });

      const response = await fetch(`/api/activity-logs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }
      const data: ApiResponse<ActivityLogDisplay[]> = await response.json();
      return data.data || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes - activity logs change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

// Hook for fetching activity log statistics
export const useActivityLogStats = (
  businessId: string,
  options?: {
    storeId?: string;
    startDate?: Date;
    endDate?: Date;
    enabled?: boolean;
  }
) => {
  const { 
    storeId, 
    startDate, 
    endDate, 
    enabled = true 
  } = options || {};
  
  return useQuery({
    queryKey: ['activity-log-stats', businessId, storeId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        business_id: businessId,
        ...(storeId && { store_id: storeId }),
        ...(startDate && { start_date: startDate.toISOString() }),
        ...(endDate && { end_date: endDate.toISOString() }),
      });

      const response = await fetch(`/api/activity-logs/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity log statistics');
      }
      const data: ApiResponse<{
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        byModule: Record<string, number>;
        byAction: Record<string, number>;
      }> = await response.json();
      return data.data;
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for clearing activity logs (super admin only)
export const useClearActivityLogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      businessId, 
      storeId, 
      userRole 
    }: { 
      businessId?: string; 
      storeId?: string; 
      userRole?: string; 
    }) => {
      if (userRole !== 'superadmin') {
        throw new Error('Only super admins can clear activity logs');
      }

      const params = new URLSearchParams();
      if (businessId) params.append('business_id', businessId);
      if (storeId) params.append('store_id', storeId);

      const response = await fetch(`/api/activity-logs/clear?${params}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear activity logs');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all activity log queries
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity-log-stats'] });
      
      toast.success('Activity logs cleared successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear activity logs');
    },
  });
};

// Hook for exporting activity logs
export const useExportActivityLogs = () => {
  return useMutation({
    mutationFn: async ({
      businessId,
      storeId,
      module,
      action,
      startDate,
      endDate,
      format = 'csv'
    }: {
      businessId: string;
      storeId?: string;
      module?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
      format?: 'csv' | 'json' | 'xlsx';
    }) => {
      const params = new URLSearchParams({
        business_id: businessId,
        format,
        ...(storeId && { store_id: storeId }),
        ...(module && { module }),
        ...(action && { action }),
        ...(startDate && { start_date: startDate.toISOString() }),
        ...(endDate && { end_date: endDate.toISOString() }),
      });

      const response = await fetch(`/api/activity-logs/export?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export activity logs');
      }
      
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.${variables.format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Activity logs exported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export activity logs');
    },
  });
};
