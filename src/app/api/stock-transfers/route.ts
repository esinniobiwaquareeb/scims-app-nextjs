import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const businessId = searchParams.get('business_id');
  const status = searchParams.get('status');

  const params: Record<string, string> = {};
  if (storeId) params.store_id = storeId;
  if (businessId) params.business_id = businessId;
  if (status) params.status = status;

  return proxyGet(request, '/stock-transfers', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const paginationData = (data as { pagination?: { page?: number; limit?: number; total?: number } }).pagination;
        const page = paginationData?.page || 1;
        const limit = paginationData?.limit || 10;
        const total = paginationData?.total || 0;
        return {
          success: true,
          transfers: Array.isArray(data.data) ? data.data : [],
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
  return proxyPost(request, '/stock-transfers', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          transfer: data.data,
        };
      }
      return data;
    },
  });
}
