/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useRoles = (businessId: string) => {
  return useQuery({
    queryKey: ['roles', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/roles?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
    enabled: !!businessId,
  });
};

export const useCreateRole = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleData: any) => {
      const response = await fetch('/api/roles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', businessId] });
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create role');
      console.error('Create role error:', error);
    },
  });
};

export const useUpdateRole = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, roleData }: { roleId: string; roleData: any }) => {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', businessId] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
      console.error('Update role error:', error);
    },
  });
};

export const useDeleteRole = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, businessId: bid }: { roleId: string; businessId: string }) => {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_id: bid }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', businessId] });
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete role');
      console.error('Delete role error:', error);
    },
  });
};


