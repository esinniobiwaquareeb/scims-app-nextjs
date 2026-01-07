import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  const params: Record<string, string> = {};
  if (businessId) params.business_id = businessId;

  return proxyGet(request, '/roles/permissions', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          permissions: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}
