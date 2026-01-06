import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/subscription-plans', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        const plans = Array.isArray(data.data) ? data.data : [];
        return {
          success: true,
          plans: plans.map((plan: {
            id: string;
            name: string;
            price?: string;
            price_monthly?: number;
            price_yearly?: number;
            is_active?: boolean;
            description?: string;
            features?: string[];
            max_stores?: number;
            max_products?: number;
            max_users?: number;
            billing_cycle?: string;
            is_popular?: boolean;
            display_order?: number;
            created_at?: string;
            updated_at?: string;
          }) => ({
            id: plan.id,
            name: plan.name,
            price: plan.price || `$${plan.price_monthly}/month`,
            status: plan.is_active ? 'active' : 'inactive',
            description: plan.description,
            features: plan.features || [],
            maxStores: plan.max_stores,
            maxProducts: plan.max_products,
            maxUsers: plan.max_users,
            monthlyPrice: plan.price_monthly,
            yearlyPrice: plan.price_yearly,
            billingCycle: plan.billing_cycle,
            isPopular: plan.is_popular,
            displayOrder: plan.display_order,
            price_monthly: plan.price_monthly,
            price_yearly: plan.price_yearly,
            max_stores: plan.max_stores,
            max_products: plan.max_products,
            max_users: plan.max_users,
            is_active: plan.is_active,
            display_order: plan.display_order,
            created_at: plan.created_at,
            updated_at: plan.updated_at,
          })),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/subscription-plans', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          plan: data.data,
        };
      }
      return data;
    },
  });
}
