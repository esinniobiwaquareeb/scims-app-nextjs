// ============================================================================
// STAFF STORE HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StaffFormData } from '@/types';

// Hook for fetching business staff
export const useBusinessStaff = (businessId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['business-staff', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/staff?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business staff');
      }
      const data = await response.json();
      return data.staff || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching store staff
export const useStoreStaff = (storeId: string, options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) => {
  const { enabled = true, forceRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['store-staff', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/staff?store_id=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store staff');
      }
      const data = await response.json();
      return data.staff || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};

// Hook for fetching a single staff member
export const useStaff = (staffId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['staff', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch staff member');
      }
      const data = await response.json();
      return data.staff;
    },
    enabled: enabled && !!staffId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for creating staff
export const useCreateStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffData: StaffFormData) => {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...staffData,
          business_id: businessId,
          store_id: storeId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create staff member');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Invalidate and refetch staff
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['store-staff', storeId] });
      }
      
      toast.success('Staff member created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create staff member');
    },
  });
};

// Hook for updating staff
export const useUpdateStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ staffId, staffData }: { staffId: string; staffData: Partial<StaffFormData> }) => {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update staff member');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {       // Invalidate and refetch staff
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['store-staff', storeId] });
      }
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
      
      toast.success('Staff member updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update staff member');
    },
  });
};

// Hook for deleting staff
export const useDeleteStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete staff member');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {       // Invalidate and refetch staff
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] });
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ['store-staff', storeId] });
      }
      queryClient.removeQueries({ queryKey: ['staff', variables] });
      
      toast.success('Staff member deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete staff member');
    },
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
};
