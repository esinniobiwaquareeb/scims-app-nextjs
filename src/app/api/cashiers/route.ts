import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/users/cashiers', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          cashiers: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/users/cashiers', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          user: data.data,
        };
      }
      return data;
    },
  });
}
