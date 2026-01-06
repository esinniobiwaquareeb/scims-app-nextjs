import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/subscription-distributions', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          distributions: Array.isArray(data.data) ? data.data : [],
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
  return proxyPost(request, '/subscription-distributions', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          distribution: data.data,
          message: data.message || 'Subscription distribution created successfully',
        };
      }
      return data;
    },
  });
}
