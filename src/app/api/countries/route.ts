import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/countries', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          countries: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}
