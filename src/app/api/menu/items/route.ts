import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/menu/items', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          items: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/menu/items', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          item: data.data,
        };
      }
      return data;
    },
  });
}
