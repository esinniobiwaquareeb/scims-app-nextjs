import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/reference-data/languages', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          languages: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}
