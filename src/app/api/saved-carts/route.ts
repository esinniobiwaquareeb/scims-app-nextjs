import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/saved-carts', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          carts: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/saved-carts', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          cart: data.data,
        };
      }
      return data;
    },
  });
}
