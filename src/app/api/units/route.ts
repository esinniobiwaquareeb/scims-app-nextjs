import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/units', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          units: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/units', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          unit: {
            ...data.data,
            product_count: 0,
          },
        };
      }
      return data;
    },
  });
}
