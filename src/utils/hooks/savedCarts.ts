/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineStoreIndexedDB } from "../offline-store-indexeddb";

export const useSavedCarts = (storeId: string, _cashierId?: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['saved-carts', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/saved-carts?store_id=${storeId}`);
      if (!response.ok) throw new Error('Failed to fetch saved carts');
      const data = await response.json();
      return data.carts || [];
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });
};

export const useSaveCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cartData: { store_id: string; cart_data: unknown; cashier_id: string; [key: string]: unknown; }) => {
      const response = await fetch('/api/saved-carts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cartData),
      });
      if (!response.ok) throw new Error('Failed to save cart');
      return response.json();
    },
    onSuccess: (_data, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts', variables.store_id] });
      toast.success('Cart saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save cart');
      console.error('Save cart error:', error);
    },
  });
};

export const useDeleteSavedCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cartId: string) => {
      const response = await fetch(`/api/saved-carts/${cartId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete saved cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
      toast.success('Cart deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete cart');
      console.error('Delete cart error:', error);
    },
  });
};


// Enhanced delete saved cart hook with offline support
export const useOfflineDeleteSavedCart = (_storeId: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (cartId: string) => {
        try {
          const response = await fetch(`/api/saved-carts/${cartId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete saved cart');
          }
          
          const result = await response.json();
          
          // Remove from cache
          await offlineStoreIndexedDB.init();
          await offlineStoreIndexedDB.delete('saved_carts', cartId);
          
          return result;
        } catch (error) {
          // If offline, add to sync queue
          if (!navigator.onLine) {
            await offlineStoreIndexedDB.init();
            await offlineStoreIndexedDB.addToSyncQueue({
              operation: 'delete',
              table: 'saved_carts',
              data: { id: cartId }
            });
            
            // Remove from local cache immediately
            await offlineStoreIndexedDB.delete('saved_carts', cartId);
            
            return { offline: true };
          }
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
        if (data.offline) {
          toast.success('Cart deleted offline (will sync when online)');
        } else {
          toast.success('Cart deleted successfully');
        }
      },
      onError: (error) => {
        toast.error('Failed to delete cart');
        console.error('Delete cart error:', error);
      },
    });
  };
  
// Enhanced saved carts hook with offline support
export const useOfflineSavedCarts = (storeId: string, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: ['saved-carts', storeId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/saved-carts?store_id=${storeId}`);
        if (!response.ok) throw new Error('Failed to fetch saved carts');
        const data = await response.json();
        const carts = data.carts || [];
        await offlineStoreIndexedDB.init();
        for (const cart of carts) await offlineStoreIndexedDB.put('saved_carts', cart);
        return carts;
      } catch {
        await offlineStoreIndexedDB.init();
        return await offlineStoreIndexedDB.getSavedCartsByStore(storeId);
      }
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });
};

// Enhanced save cart hook with offline support
export const useOfflineSaveCart = (_storeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cartData: { store_id: string; cart_data: unknown; cashier_id: string; [key: string]: unknown; }) => {
      try {
        const response = await fetch('/api/saved-carts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cartData) });
        if (!response.ok) throw new Error('Failed to save cart');
        const result = await response.json();
        await offlineStoreIndexedDB.init();
        await offlineStoreIndexedDB.put('saved_carts', result.cart);
        return result;
      } catch (error) {
        if (!navigator.onLine) {
          await offlineStoreIndexedDB.init();
          const tempCart = { ...cartData, id: `temp-${Date.now()}`, created_at: new Date().toISOString(), is_temp: true };
          await offlineStoreIndexedDB.put('saved_carts', tempCart);
          await offlineStoreIndexedDB.addToSyncQueue({ operation: 'create', table: 'saved_carts', data: tempCart });
          return { cart: tempCart, offline: true };
        }
        throw error;
      }
    },
    onSuccess: (data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts', variables.store_id] });
      toast.success(data?.offline ? 'Cart saved offline (will sync when online)' : 'Cart saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save cart');
      console.error('Save cart error:', error);
    },
  });
};