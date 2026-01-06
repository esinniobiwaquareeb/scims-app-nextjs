import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/businesses', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          businesses: Array.isArray(data.data) ? data.data : [],
          pagination: {
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 10,
            offset: ((data.page || 1) - 1) * (data.limit || 10),
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/businesses', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          business: data.data,
        };
      }
      return data;
    },
  });
}
