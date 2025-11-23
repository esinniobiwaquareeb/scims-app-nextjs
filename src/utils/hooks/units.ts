import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Unit {
  id: string;
  business_id: string;
  name: string;
  symbol?: string | null;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface UnitFormData {
  name: string;
  symbol?: string | null;
  description?: string | null;
  business_id: string;
  is_active?: boolean;
  sort_order?: number;
}

export const useUnits = (businessId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['units', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/units?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch units');
      const data = await response.json();
      return data.units || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useBusinessUnits = useUnits;

export const useCreateBusinessUnit = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (unitData: UnitFormData) => {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create unit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', businessId] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      toast.success('Unit created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create unit');
      console.error('Create unit error:', error);
    },
  });
};

export const useUpdateBusinessUnit = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId, unitData }: { unitId: string; unitData: Partial<UnitFormData> }) => {
      const response = await fetch(`/api/units/${unitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update unit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', businessId] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      toast.success('Unit updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update unit');
      console.error('Update unit error:', error);
    },
  });
};

export const useDeleteBusinessUnit = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (unitId: string) => {
      const response = await fetch(`/api/units/${unitId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete unit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', businessId] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      toast.success('Unit deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete unit');
      console.error('Delete unit error:', error);
    },
  });
};

