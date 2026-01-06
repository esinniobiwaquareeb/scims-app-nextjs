import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/customers', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          customers: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/customers', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          customer: data.data,
        };
      }
      return data;
    },
  });
}
