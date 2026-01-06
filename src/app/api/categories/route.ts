import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/categories', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          categories: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/categories', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          category: {
            ...data.data,
            product_count: 0,
          },
        };
      }
      return data;
    },
  });
}
