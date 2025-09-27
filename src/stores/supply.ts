// ============================================================================
// SUPPLY MANAGEMENT STORES (REACT QUERY HOOKS)
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  SupplyOrderSummary,
  SupplyOrderDisplay,
  SupplyOrderFormData,
  SupplyPaymentFormData,
  SupplyReturnFormData,
  PendingReturn,
  SupplyStats,
  SupplyPerformance,
  SupplyAuditLog
} from '@/types';

// ============================================================================
// API CALLS
// ============================================================================

interface SupplyOrdersResponse {
  supply_orders: SupplyOrderSummary[];
}

interface SupplyOrderResponse {
  supply_order: SupplyOrderDisplay;
}

interface PendingReturnsResponse {
  pending_returns: PendingReturn[];
}

interface SupplyStatsResponse {
  stats: SupplyStats;
}

interface SupplyPerformanceResponse {
  performance: SupplyPerformance;
}

interface SupplyAuditLogsResponse {
  auditLogs: SupplyAuditLog[];
}

const fetchSupplyOrders = async (storeId: string, filters?: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<SupplyOrdersResponse> => {
  const params = new URLSearchParams({
    store_id: storeId,
    ...(filters?.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.dateFrom && { date_from: filters.dateFrom }),
    ...(filters?.dateTo && { date_to: filters.dateTo }),
  });

  const response = await fetch(`/api/supply-orders?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch supply orders');
  }
  return response.json();
};

const fetchSupplyOrder = async (orderId: string): Promise<SupplyOrderResponse> => {
  const response = await fetch(`/api/supply-orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch supply order');
  }
  return response.json();
};

const createSupplyOrder = async (orderData: SupplyOrderFormData): Promise<SupplyOrderResponse> => {
  const response = await fetch('/api/supply-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) {
    throw new Error('Failed to create supply order');
  }
  return response.json();
};

const updateSupplyOrder = async (orderId: string, orderData: Partial<SupplyOrderFormData>): Promise<SupplyOrderResponse> => {
  const response = await fetch(`/api/supply-orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) {
    throw new Error('Failed to update supply order');
  }
  return response.json();
};

const deleteSupplyOrder = async (orderId: string): Promise<void> => {
  const response = await fetch(`/api/supply-orders/${orderId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete supply order');
  }
};

const fetchPendingReturns = async (storeId: string): Promise<PendingReturnsResponse> => {
  const response = await fetch(`/api/supply-orders/pending-returns?store_id=${storeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pending returns');
  }
  return response.json();
};

const createSupplyPayment = async (paymentData: SupplyPaymentFormData): Promise<{ payment: any }> => {
  const response = await fetch('/api/supply-payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) {
    throw new Error('Failed to create supply payment');
  }
  return response.json();
};

const createSupplyReturn = async (returnData: SupplyReturnFormData): Promise<{ return: any }> => {
  const response = await fetch('/api/supply-returns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(returnData),
  });
  if (!response.ok) {
    throw new Error('Failed to create supply return');
  }
  return response.json();
};

const acceptReturn = async (returnId: string): Promise<void> => {
  const response = await fetch(`/api/supply-orders/${returnId}/accept-return`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to accept return');
  }
};

const fetchSupplyStats = async (storeId: string): Promise<SupplyStatsResponse> => {
  const response = await fetch(`/api/supply-orders/stats?store_id=${storeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch supply statistics');
  }
  return response.json();
};

const fetchSupplyPerformance = async (orderId: string): Promise<SupplyPerformanceResponse> => {
  const response = await fetch(`/api/supply-orders/${orderId}/performance`);
  if (!response.ok) {
    throw new Error('Failed to fetch supply performance');
  }
  return response.json();
};

const fetchSupplyAuditLogs = async (orderId: string): Promise<SupplyAuditLogsResponse> => {
  const response = await fetch(`/api/supply-orders/${orderId}/audit-logs`);
  if (!response.ok) {
    throw new Error('Failed to fetch supply audit logs');
  }
  return response.json();
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export const useSupplyOrders = (storeId: string, filters?: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}, options?: { enabled?: boolean }) => {
  return useQuery<SupplyOrdersResponse, Error>({
    queryKey: ['supplyOrders', storeId, filters],
    queryFn: () => fetchSupplyOrders(storeId, filters),
    enabled: options?.enabled && !!storeId,
  });
};

export const useSupplyOrder = (orderId: string, options?: { enabled?: boolean }) => {
  return useQuery<SupplyOrderResponse, Error>({
    queryKey: ['supplyOrder', orderId],
    queryFn: () => fetchSupplyOrder(orderId),
    enabled: options?.enabled && !!orderId,
  });
};

export const useCreateSupplyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<SupplyOrderResponse, Error, SupplyOrderFormData>({
    mutationFn: (orderData: SupplyOrderFormData) => createSupplyOrder(orderData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders', variables.store_id] });
      toast.success('Supply order created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create supply order: ${error.message}`);
    },
  });
};

export const useUpdateSupplyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<SupplyOrderResponse, Error, { orderId: string; orderData: Partial<SupplyOrderFormData> }>({
    mutationFn: ({ orderId, orderData }) => updateSupplyOrder(orderId, orderData),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] });
      queryClient.invalidateQueries({ queryKey: ['supplyOrder', orderId] });
      toast.success('Supply order updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update supply order: ${error.message}`);
    },
  });
};

export const useDeleteSupplyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (orderId: string) => deleteSupplyOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] });
      toast.success('Supply order deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete supply order: ${error.message}`);
    },
  });
};

export const usePendingReturns = (storeId: string, options?: { enabled?: boolean }) => {
  return useQuery<PendingReturnsResponse, Error>({
    queryKey: ['pendingReturns', storeId],
    queryFn: () => fetchPendingReturns(storeId),
    enabled: options?.enabled && !!storeId,
  });
};

export const useCreateSupplyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<{ payment: any }, Error, SupplyPaymentFormData>({
    mutationFn: (paymentData: SupplyPaymentFormData) => createSupplyPayment(paymentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] });
      queryClient.invalidateQueries({ queryKey: ['supplyOrder', variables.supply_order_id] });
      toast.success('Payment recorded successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });
};

export const useCreateSupplyReturn = () => {
  const queryClient = useQueryClient();
  return useMutation<{ return: any }, Error, SupplyReturnFormData>({
    mutationFn: (returnData: SupplyReturnFormData) => createSupplyReturn(returnData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] });
      queryClient.invalidateQueries({ queryKey: ['supplyOrder', variables.supply_order_id] });
      queryClient.invalidateQueries({ queryKey: ['pendingReturns'] });
      toast.success('Return created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create return: ${error.message}`);
    },
  });
};

export const useAcceptReturn = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (returnId: string) => acceptReturn(returnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] });
      queryClient.invalidateQueries({ queryKey: ['pendingReturns'] });
      toast.success('Return accepted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to accept return: ${error.message}`);
    },
  });
};

export const useSupplyStats = (storeId: string, options?: { enabled?: boolean }) => {
  return useQuery<SupplyStatsResponse, Error>({
    queryKey: ['supplyStats', storeId],
    queryFn: () => fetchSupplyStats(storeId),
    enabled: options?.enabled && !!storeId,
  });
};

export const useSupplyPerformance = (orderId: string, options?: { enabled?: boolean }) => {
  return useQuery<SupplyPerformanceResponse, Error>({
    queryKey: ['supplyPerformance', orderId],
    queryFn: () => fetchSupplyPerformance(orderId),
    enabled: options?.enabled && !!orderId,
  });
};

export const useSupplyAuditLogs = (orderId: string, options?: { enabled?: boolean }) => {
  return useQuery<SupplyAuditLogsResponse, Error>({
    queryKey: ['supplyAuditLogs', orderId],
    queryFn: () => fetchSupplyAuditLogs(orderId),
    enabled: options?.enabled && !!orderId,
  });
};
