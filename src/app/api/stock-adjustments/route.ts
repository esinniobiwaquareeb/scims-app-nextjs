import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/stock/adjustments', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          adjustments: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/stock/adjustments', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          adjustment: data.data,
        };
      }
      return data;
    },
  });
}
