import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/platform/analytics', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          analytics: Array.isArray(data.data) ? data.data : [],
          pagination: {
            limit: 100,
            offset: 0,
            total: Array.isArray(data.data) ? data.data.length : 0,
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/platform/analytics', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          analytics: data.data,
          message: data.message || 'Platform analytics entry created successfully',
        };
      }
      return data;
    },
  });
}
