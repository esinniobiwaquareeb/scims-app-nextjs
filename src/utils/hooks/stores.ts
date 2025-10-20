/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBusinessStores = (
  businessId: string,
  _opts?: { enabled: boolean }
) => {
  return useQuery({
    queryKey: ["businessStores", businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/stores`);
      if (!response.ok) throw new Error("Failed to fetch business stores");
      const data = await response.json();
      return data.stores || [];
    },
    enabled: !!businessId,
  });
};

export const useCreateStore = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storeData: any) => {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeData),
      });
      if (!response.ok) throw new Error("Failed to create store");
      return response.json();
    },
    onSuccess: (response) => {
      if (response && response.success) {
        queryClient.invalidateQueries({
          queryKey: ["business-stores", businessId],
        });
        queryClient.refetchQueries({
          queryKey: ["business-stores", businessId],
        });
        toast.success("Store created successfully");
      }
    },
    onError: (error: any) => {
      console.error("Error creating store:", error);
      toast.error("Failed to create store");
    },
  });
};

export const useUpdateStore = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeData }: { id: string; storeData: any }) => {
      const response = await fetch(`/api/stores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeData),
      });
      if (!response.ok) throw new Error("Failed to update store");
      return response.json();
    },
    onSuccess: (response) => {
      if (response && response.success) {
        queryClient.invalidateQueries({
          queryKey: ["business-stores", businessId],
        });
        queryClient.refetchQueries({
          queryKey: ["business-stores", businessId],
        });
        toast.success("Store updated successfully");
      }
    },
    onError: (error: any) => {
      console.error("Error updating store:", error);
      toast.error("Failed to update store");
    },
  });
};

export const useDeleteStore = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storeId: string) => {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete store");
      return response.json();
    },
    onSuccess: (response) => {
      if (response && response.success) {
        queryClient.invalidateQueries({
          queryKey: ["business-stores", businessId],
        });
        queryClient.refetchQueries({
          queryKey: ["business-stores", businessId],
        });
        toast.success("Store deleted successfully");
      }
    },
    onError: (error: any) => {
      console.error("Error deleting store:", error);
      toast.error("Failed to delete store");
    },
  });
};

// Hook for fetching store settings
export const useStoreSettings = (
  storeId: string,
  options?: {
    enabled?: boolean;
    forceRefresh?: boolean;
  }
) => {
  const { enabled = true, forceRefresh = false } = options || {};

  return useQuery({
    queryKey: ["store-settings", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}/settings`);
      if (!response.ok) {
        throw new Error("Failed to fetch store settings");
      }
      const data = await response.json();
      return data.settings || {};
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: !forceRefresh,
  });
};
