// ============================================================================
// SUBSCRIPTION RELATED STORES (REACT QUERY HOOKS)
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  SubscriptionPlan,
  SubscriptionPlanFormData,
  SubscriptionPlanStats,
  SubscriptionPlanPerformance,
  SubscriptionPlanAuditLog
} from '@/types';
// API endpoints
const API_ENDPOINTS = {
  SUBSCRIPTION_PLANS: '/api/subscription-plans',
};

// ============================================================================
// API CALLS
// ============================================================================

interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

interface SubscriptionPlanResponse {
  plan: SubscriptionPlan;
}

interface SubscriptionPlanStatsResponse {
  stats: SubscriptionPlanStats;
}

interface SubscriptionPlanPerformanceResponse {
  performance: SubscriptionPlanPerformance;
}

interface SubscriptionPlanAuditLogsResponse {
  auditLogs: SubscriptionPlanAuditLog[];
}

const fetchSubscriptionPlans = async (): Promise<SubscriptionPlansResponse> => {
  const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLANS);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription plans');
  }
  return response.json();
};

const fetchSubscriptionPlan = async (planId: string): Promise<SubscriptionPlanResponse> => {
  const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/${planId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription plan');
  }
  return response.json();
};

const createSubscriptionPlan = async (planData: SubscriptionPlanFormData): Promise<SubscriptionPlanResponse> => {
  const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLANS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData),
  });
  if (!response.ok) {
    throw new Error('Failed to create subscription plan');
  }
  return response.json();
};

const updateSubscriptionPlan = async (planId: string, planData: Partial<SubscriptionPlanFormData>): Promise<SubscriptionPlanResponse> => {
  const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData),
  });
  if (!response.ok) {
    throw new Error('Failed to update subscription plan');
  }
  return response.json();
};

const deleteSubscriptionPlan = async (planId: string): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/${planId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete subscription plan');
  }
};

const fetchSubscriptionPlanStats = async (): Promise<SubscriptionPlanStatsResponse> => {
  const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription plan statistics');
  }
  return response.json();
};

const fetchSubscriptionPlanPerformance = async (planId: string): Promise<SubscriptionPlanPerformanceResponse> => {
  const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/${planId}/performance`);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription plan performance');
  }
  return response.json();
};

const fetchSubscriptionPlanAuditLogs = async (planId: string): Promise<SubscriptionPlanAuditLogsResponse> => {
  const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/${planId}/audit-logs`);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription plan audit logs');
  }
  return response.json();
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export const useSubscriptionPlans = (options?: { enabled?: boolean }) => {
  return useQuery<SubscriptionPlansResponse, Error>({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchSubscriptionPlans,
    enabled: options?.enabled,
  });
};

export const useSubscriptionPlan = (planId: string, options?: { enabled?: boolean }) => {
  return useQuery<SubscriptionPlanResponse, Error>({
    queryKey: ['subscriptionPlan', planId],
    queryFn: () => fetchSubscriptionPlan(planId),
    enabled: options?.enabled,
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionPlanResponse, Error, SubscriptionPlanFormData>({
    mutationFn: (newPlan: SubscriptionPlanFormData) => createSubscriptionPlan(newPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success('Subscription plan created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create subscription plan: ${error.message}`);
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionPlanResponse, Error, { planId: string; planData: Partial<SubscriptionPlanFormData> }>({
    mutationFn: ({ planId, planData }) => updateSubscriptionPlan(planId, planData),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlan', planId] });
      toast.success('Subscription plan updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update subscription plan: ${error.message}`);
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (planId: string) => deleteSubscriptionPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success('Subscription plan deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete subscription plan: ${error.message}`);
    },
  });
};

export const useSubscriptionPlanStats = (options?: { enabled?: boolean }) => {
  return useQuery<SubscriptionPlanStatsResponse, Error>({
    queryKey: ['subscriptionPlanStats'],
    queryFn: fetchSubscriptionPlanStats,
    enabled: options?.enabled,
  });
};

export const useSubscriptionPlanPerformance = (planId: string, options?: { enabled?: boolean }) => {
  return useQuery<SubscriptionPlanPerformanceResponse, Error>({
    queryKey: ['subscriptionPlanPerformance', planId],
    queryFn: () => fetchSubscriptionPlanPerformance(planId),
    enabled: options?.enabled,
  });
};

export const useSubscriptionPlanAuditLogs = (planId: string, options?: { enabled?: boolean }) => {
  return useQuery<SubscriptionPlanAuditLogsResponse, Error>({
    queryKey: ['subscriptionPlanAuditLogs', planId],
    queryFn: () => fetchSubscriptionPlanAuditLogs(planId),
    enabled: options?.enabled,
  });
};
