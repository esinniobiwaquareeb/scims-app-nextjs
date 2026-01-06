import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/restock-orders', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          orders: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/restock-orders', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          order: data.data,
        };
      }
      return data;
    },
  });
}
