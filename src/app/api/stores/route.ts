import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/stores', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          stores: Array.isArray(data.data) ? data.data : [],
          total: data.total,
          page: data.page,
          limit: data.limit,
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/stores', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          store: data.data,
          store_settings: data.data.settings || null,
        };
      }
      return data;
    },
  });
}
