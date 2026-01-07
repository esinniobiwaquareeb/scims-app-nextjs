import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/supply-payments', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { supply_payments?: unknown[] } | unknown[];
        return {
          success: true,
          supply_payments: Array.isArray(dataObj) ? dataObj : (dataObj.supply_payments || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/supply-payments', body, {
    transformResponse: (data: BackendResponse) => {
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
