import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/suppliers', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          suppliers: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/suppliers', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          supplier: data.data,
        };
      }
      return data;
    },
  });
}
