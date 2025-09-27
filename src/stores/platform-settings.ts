// ============================================================================
// PLATFORM SETTINGS STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlatformSettingsData, SystemHealth, ApiResponse } from '@/types';

// Hook for fetching platform settings
export const usePlatformSettings = (options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery<PlatformSettingsData, Error>({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const response = await fetch('/api/platform/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch platform settings');
      }
      const data: ApiResponse<PlatformSettingsData> = await response.json();
      return data.data || {} as PlatformSettingsData;
    },
    enabled: enabled,
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
  
  return useQuery<SystemHealth, Error>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await fetch('/api/platform/health');
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      const data: ApiResponse<SystemHealth> = await response.json();
      return data.data || {} as SystemHealth;
    },
    enabled: enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for updating platform settings
export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<PlatformSettingsData>, Error, PlatformSettingsData>({
    mutationFn: async (settings: PlatformSettingsData) => {
      const response = await fetch('/api/platform/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update platform settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch platform settings
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      
      toast.success('Platform settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update platform settings');
    },
  });
};

// Hook for resetting platform settings to defaults
export const useResetPlatformSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<PlatformSettingsData>, Error, void>({
    mutationFn: async () => {
      const response = await fetch('/api/platform/settings/reset', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset platform settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch platform settings
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      
      toast.success('Platform settings reset to defaults');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset platform settings');
    },
  });
};

// Hook for toggling maintenance mode
export const useToggleMaintenanceMode = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<PlatformSettingsData>, Error, { enabled: boolean; message?: string }>({
    mutationFn: async ({ enabled, message }) => {
      const response = await fetch('/api/platform/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled, message }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle maintenance mode');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch platform settings
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      
      toast.success(`Maintenance mode ${variables.enabled ? 'enabled' : 'disabled'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle maintenance mode');
    },
  });
};

// Hook for toggling demo mode
export const useToggleDemoMode = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<PlatformSettingsData>, Error, boolean>({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch('/api/platform/demo-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle demo mode');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch platform settings
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      
      toast.success(`Demo mode ${variables ? 'enabled' : 'disabled'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle demo mode');
    },
  });
};

// Hook for exporting platform settings
export const useExportPlatformSettings = () => {
  return useMutation<Blob, Error, { format: 'csv' | 'json' | 'xlsx' }>({
    mutationFn: async ({ format }) => {
      const response = await fetch(`/api/platform/settings/export?format=${format}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export platform settings');
      }

      const blob = await response.blob();
      const filename = `platform-settings-${new Date().toISOString().split('T')[0]}.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Platform settings exported successfully');
      return blob;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export platform settings');
    },
  });
};

// Hook for importing platform settings
export const useImportPlatformSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<PlatformSettingsData>, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/platform/settings/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import platform settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch platform settings
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      
      toast.success('Platform settings imported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import platform settings');
    },
  });
};
