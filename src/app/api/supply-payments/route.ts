import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/supply-payments', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          supply_payments: Array.isArray(data.data) ? data.data : (data.data.supply_payments || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/supply-payments', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          supply_payment: data.data,
          message: data.message || 'Supply payment created successfully',
        };
      }
      return data;
    },
  });
}
