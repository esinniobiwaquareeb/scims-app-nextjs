import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { BrandFormData } from '@/components/brand/BrandHelpers';

export const useBusinessBrands = (businessId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['brands', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/brands?business_id=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      return data.brands || [];
    },
    enabled: enabled && !!businessId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useCreateBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (brandData: BrandFormData) => {
      const response = await fetch('/api/brands', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brandData),
      });
      if (!response.ok) throw new Error('Failed to create brand');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', businessId] });
      toast.success('Brand created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create brand');
      console.error('Create brand error:', error);
    },
  });
};

export const useUpdateBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ brandId, brandData }: { brandId: string; brandData: BrandFormData }) => {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brandData),
      });
      if (!response.ok) throw new Error('Failed to update brand');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', businessId] });
      toast.success('Brand updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update brand');
      console.error('Update brand error:', error);
    },
  });
};

export const useDeleteBusinessBrand = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (brandId: string) => {
      const response = await fetch(`/api/brands/${brandId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete brand');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', businessId] });
      toast.success('Brand deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete brand');
      console.error('Delete brand error:', error);
    },
  });
};


