import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/supply-orders', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          orders: Array.isArray(data.data) ? data.data : [],
          total: data.total,
          page: data.page,
          limit: data.limit,
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/supply-orders', body, {
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
