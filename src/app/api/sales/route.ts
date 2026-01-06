import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/sales', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          sales: Array.isArray(data.data) ? data.data : [],
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
  return proxyPost(request, '/sales', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          sale: data.data,
        };
      }
      return data;
    },
  });
}
