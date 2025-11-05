/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { StaffFormData } from '@/types';

export const useBusinessStaff = (businessId: string, p0: { enabled: boolean; }) => {
  return useQuery({
    queryKey: ['businessStaff', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/staff?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch business staff');
      const result = await response.json();
      return result.success ? result.staff : [];
    },
    enabled: !!businessId,
  });
};

export const useStoreStaff = (storeId: string, p0: { enabled: boolean; }) => {
  return useQuery({
    queryKey: ['storeStaff', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/staff?store_id=${storeId}`);
      if (!response.ok) throw new Error('Failed to fetch store staff');
      const result = await response.json();
      return result.success ? result.staff : [];
    },
    enabled: !!storeId,
  });
};

export const useCreateStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffData: StaffFormData) => {
      const response = await fetch('/api/staff', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...staffData, business_id: businessId, store_id: storeId || staffData.store_id }),
      });
      if (!response.ok) throw new Error('Failed to create staff member');
      return response.json();
    },
    onSuccess: (_data, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['businessStaff', businessId] });
      const targetStoreId = storeId || variables.store_id;
      if (targetStoreId) queryClient.invalidateQueries({ queryKey: ['storeStaff', targetStoreId] });
      queryClient.invalidateQueries({ queryKey: ['storeStaff'] });
      toast.success('Staff member created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create staff member');
      console.error('Create staff error:', error);
    },
  });
};

export const useUpdateStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ staffId, staffData }: { staffId: string; staffData: StaffFormData }) => {
      // Always use staffData.store_id (user's selection from the form)
      // The storeId parameter is only for context (currentStore), not for overriding user selection
      const requestData = { 
        ...staffData, 
        business_id: businessId, 
        store_id: staffData.store_id || null // Use the store_id from the form, or null if empty
      };
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestData),
      });
      if (!response.ok) throw new Error('Failed to update staff member');
      return response.json();
    },
    onSuccess: (_data, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['businessStaff', businessId] });
      // Invalidate both old and new store staff queries
      const newStoreId = variables.staffData.store_id;
      const oldStoreId = storeId;
      if (newStoreId) queryClient.invalidateQueries({ queryKey: ['storeStaff', newStoreId] });
      if (oldStoreId && oldStoreId !== newStoreId) queryClient.invalidateQueries({ queryKey: ['storeStaff', oldStoreId] });
      queryClient.invalidateQueries({ queryKey: ['storeStaff'] });
      toast.success('Staff member updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update staff member');
      console.error('Update staff error:', error);
    },
  });
};

export const useDeleteStaff = (businessId: string, storeId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      const url = storeId ? `/api/staff/${staffId}?store_id=${storeId}` : `/api/staff/${staffId}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete staff member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessStaff', businessId] });
      if (storeId) queryClient.invalidateQueries({ queryKey: ['storeStaff', storeId] });
      queryClient.invalidateQueries({ queryKey: ['storeStaff'] });
      toast.success('Staff member deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete staff member');
      console.error('Delete staff error:', error);
    },
  });
};


