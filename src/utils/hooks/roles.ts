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
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', businessId] });
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create role');
      console.error('Create role error:', error);
    },
  });
};


