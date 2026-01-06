import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/stock/transfers', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          transfers: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/stock/transfers', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          transfer: data.data,
        };
      }
      return data;
    },
  });
}
