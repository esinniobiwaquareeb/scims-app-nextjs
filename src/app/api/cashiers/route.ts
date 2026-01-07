import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const storeId = searchParams.get('store_id');

  const params: Record<string, string> = {};
  params.role = 'cashier';
  if (businessId) params.business_id = businessId;
  if (storeId) params.store_id = storeId;

  return proxyGet(request, '/staff', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const staffData = data.data as { staff?: unknown[] };
        return {
          success: true,
          cashiers: Array.isArray(staffData.staff) ? staffData.staff : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/users/cashiers', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          user: data.data,
        };
      }
      return data;
    },
  });
}
