import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/auth/reset-password', body);
}

export async function GET(request: NextRequest) {
  return proxyGet(request, '/auth/reset-password', {
    transformResponse: (data) => {
      if (data.success && data.user) {
        return {
          success: true,
          user: data.user,
        };
      }
      return data;
    },
  });
}
