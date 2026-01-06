import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/platform/revenue', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          revenueData: Array.isArray(data.data) ? data.data : [],
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
  return proxyPost(request, '/platform/revenue', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          revenue: data.data,
          message: data.message || 'Platform revenue entry created successfully',
        };
      }
      return data;
    },
  });
}
