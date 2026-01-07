import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const businessId = searchParams.get('business_id');
  const type = searchParams.get('type') || 'store';

  // Build query parameters
  const params: Record<string, string> = {};
  if (storeId) params.store_id = storeId;
  if (businessId) params.business_id = businessId;
  if (type) params.type = type;

  return proxyGet(request, '/dashboard/stats', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { type?: string };
        return {
          success: true,
          stats: data.data,
          type: dataObj.type || type,
        };
      }
      return data;
    },
  });
}
