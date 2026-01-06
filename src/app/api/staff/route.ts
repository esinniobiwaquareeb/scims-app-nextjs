import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/staff', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          staff: data.data.staff || [],
          pagination: data.data.pagination || { limit: 100, offset: 0, total: 0 },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/staff', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          user: data.data,
          default_password: data.data.default_password,
        };
      }
      return data;
    },
  });
}
