import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const storeId = searchParams.get('store_id');
  const category = searchParams.get('category');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const params: Record<string, string> = {};
  if (businessId) params.business_id = businessId;
  if (storeId) params.store_id = storeId;
  if (category) params.category = category;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  return proxyGet(request, '/expenses', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          expenses: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/expenses', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          expense: data.data,
        };
      }
      return data;
    },
  });
}
