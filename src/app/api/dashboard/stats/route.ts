import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/dashboard/stats', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { type?: string };
        return {
          success: true,
          stats: data.data,
          type: dataObj.type || 'store',
        };
      }
      return data;
    },
  });
}
