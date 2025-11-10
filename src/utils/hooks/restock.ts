import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useRestockOrders = (storeId: string, options?: { enabled?: boolean; forceRefresh?: boolean }) => {
  const { enabled = true, forceRefresh = false } = options || {};
  return useQuery({
    queryKey: ['restock-orders', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/restock-orders?store_id=${storeId}`);
      if (!response.ok) throw new Error('Failed to fetch restock orders');
      const data = await response.json();
      return data.orders || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh ? true : false, // Only refetch if explicitly requested
  });
};

export const useCreateRestockOrder = (storeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: { supplier_id: string; status: string; total_amount: number; notes?: string; expected_delivery?: string; items: Array<{ product_id: string; quantity: number; unit_cost: number; }>; }) => {
      const response = await fetch(`/api/restock-orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...orderData, store_id: storeId }),
      });
      if (!response.ok) throw new Error('Failed to create restock order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-orders', storeId] });
      toast.success('Restock order created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create restock order: ${error.message}`);
    },
  });
};

export const useUpdateRestockOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status, quantityReceived }: { orderId: string; status: string; quantityReceived?: number }) => {
      const response = await fetch(`/api/restock-orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, quantityReceived }) });
      if (!response.ok) throw new Error('Failed to update restock order status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-orders'] });
      toast.success('Restock order status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update restock order status: ${error.message}`);
    },
  });
};

export const useReceiveRestockItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, receivedItems }: { orderId: string; receivedItems: Array<{ product_id: string; received_quantity: number; }>; }) => {
      const response = await fetch(`/api/restock-orders/${orderId}/receive`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receivedItems }) });
      if (!response.ok) throw new Error('Failed to receive restock items');
      return response.json();
    },
    onSuccess: (_data, variables: { orderId: string; receivedItems: Array<{ product_id: string; received_quantity: number; }> }) => {
      queryClient.invalidateQueries({ queryKey: ['restock-orders'] });
      // Invalidate all product-related queries since stock quantities changed
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      queryClient.invalidateQueries({ queryKey: ['business-products-low-stock'] });
      toast.success('Restock items received successfully');
    },
    onError: (error) => {
      toast.error(`Failed to receive restock items: ${error.message}`);
    },
  });
};


