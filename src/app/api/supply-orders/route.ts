import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const customerId = searchParams.get('customer_id');
  const status = searchParams.get('status');

  const params: Record<string, string> = {};
  if (storeId) params.store_id = storeId;
  if (customerId) params.customer_id = customerId;
  if (status) params.status = status;

  return proxyGet(request, '/supply-orders', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const paginationData = (data as { pagination?: { page?: number; limit?: number; total?: number } }).pagination;
        const page = paginationData?.page || 1;
        const limit = paginationData?.limit || 10;
        const total = paginationData?.total || 0;
        return {
          success: true,
          orders: Array.isArray(data.data) ? data.data : [],
          pagination: {
            total: total || 0,
            page: page || 1,
            limit: limit || 10,
            offset: ((page || 1) - 1) * (limit || 10),
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/supply-orders', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          order: data.data,
        };
      }
      return data;
    },
  });
}
