import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/staff', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { staff?: unknown[]; pagination?: unknown };
        return {
          success: true,
          staff: dataObj.staff || [],
          pagination: dataObj.pagination || { limit: 100, offset: 0, total: 0 },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/staff', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { default_password?: string };
        return {
          success: true,
          user: data.data,
          default_password: dataObj.default_password,
        };
      }
      return data;
    },
  });
}
