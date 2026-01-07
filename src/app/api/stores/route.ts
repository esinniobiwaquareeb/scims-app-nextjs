import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/stores', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const page = typeof data.page === 'number' ? data.page : (typeof data.page === 'string' ? parseInt(data.page, 10) : 1);
        const limit = typeof data.limit === 'number' ? data.limit : (typeof data.limit === 'string' ? parseInt(data.limit, 10) : 10);
        const total = typeof data.total === 'number' ? data.total : (typeof data.total === 'string' ? parseInt(data.total, 10) : 0);
        return {
          success: true,
          stores: Array.isArray(data.data) ? data.data : [],
          total,
          page,
          limit,
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/stores', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { settings?: unknown } | undefined;
        return {
          success: true,
          store: data.data,
          store_settings: dataObj?.settings || null,
        };
      }
      return data;
    },
  });
}
