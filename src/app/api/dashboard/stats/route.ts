import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/dashboard/stats', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          stats: data.data,
          type: data.data.type || 'store',
        };
      }
      return data;
    },
  });
}
