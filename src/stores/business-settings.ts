// ============================================================================
// BUSINESS SETTINGS STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BusinessSettings, BusinessSettingsFormData, ApiResponse } from '@/types';

// Hook for fetching business settings
export const useBusinessSettings = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery<BusinessSettings, Error>({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch business settings');
      }
      const data: ApiResponse<BusinessSettings> = await response.json();
      return data.data;
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: forceRefresh,
  });
};

// Hook for updating business settings
export const useUpdateBusinessSettings = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<BusinessSettings>, Error, BusinessSettingsFormData>({
    mutationFn: async (settings: BusinessSettingsFormData) => {
      const response = await fetch(`/api/businesses/${businessId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update business settings');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast.success('Business settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update business settings');
    },
  });
};

// Hook for updating business basic information
export const useUpdateBusinessInfo = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<BusinessSettings>, Error, Partial<BusinessSettingsFormData>>({
    mutationFn: async (businessData: Partial<BusinessSettingsFormData>) => {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update business information');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast.success('Business information updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update business information');
    },
  });
};

// Hook for updating business settings only
export const useUpdateBusinessSettingsOnly = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<BusinessSettings>, Error, Partial<BusinessSettingsFormData>>({
    mutationFn: async (settingsData: Partial<BusinessSettingsFormData>) => {
      const response = await fetch(`/api/businesses/${businessId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update business settings');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
};

// Hook for uploading business logo
export const useUploadBusinessLogo = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<{ logo_url: string }>, Error, File>({
    mutationFn: async (logoFile: File) => {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await fetch(`/api/businesses/${businessId}/logo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload logo');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast.success('Logo uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload logo');
    },
  });
};

// Hook for uploading store banner
export const useUploadStoreBanner = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<{ banner_url: string }>, Error, File>({
    mutationFn: async (bannerFile: File) => {
      const formData = new FormData();
      formData.append('banner', bannerFile);
      
      const response = await fetch(`/api/businesses/${businessId}/banner`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload banner');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast.success('Banner uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload banner');
    },
  });
};

// Hook for resetting business settings to defaults
export const useResetBusinessSettings = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<BusinessSettings>, Error, void>({
    mutationFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/settings/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset settings');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast.success('Settings reset to defaults');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset settings');
    },
  });
};
