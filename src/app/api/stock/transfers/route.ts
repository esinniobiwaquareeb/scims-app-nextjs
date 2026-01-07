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
        return {
          success: true,
          transfers: Array.isArray(data.data) ? data.data : [],
          pagination: (data as { pagination?: unknown }).pagination,
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/stock-transfers', body, {
    transformResponse: (data: BackendResponse) => {
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

