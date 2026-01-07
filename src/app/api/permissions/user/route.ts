import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const businessId = searchParams.get('business_id');

  if (!userId || !businessId) {
    return proxyGet(request, '/roles/user-permissions', {
      transformResponse: () => ({
        success: false,
        error: 'user_id and business_id are required',
        permissions: [],
      }),
    });
  }

  return proxyGet(request, '/roles/user-permissions', {
    params: { user_id: userId, business_id: businessId },
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          permissions: Array.isArray(data.data) ? data.data : [],
        };
      }
      return {
        success: false,
        permissions: [],
      };
    },
  });
}
