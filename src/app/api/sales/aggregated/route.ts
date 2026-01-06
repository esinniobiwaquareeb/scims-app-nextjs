import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/sales/aggregated', {
    transformResponse: (data) => {
      // Backend should return the same structure
      return data;
    },
  });
}
