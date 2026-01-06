import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');

  if (!storeId) {
    return Response.json(
      { success: false, error: 'store_id is required' },
      { status: 400 }
    );
  }

  return proxyGet(request, '/dashboard/store-admin', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          data: data.data,
        };
      }
      return data;
    },
  });
}
