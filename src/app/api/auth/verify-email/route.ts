import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/auth/verify-email', body);
}

export async function GET(request: NextRequest) {
  return proxyGet(request, '/auth/verify-email', {
    transformResponse: (data) => {
      if (data.success && data.user) {
        return {
          success: true,
          message: data.message,
          user: data.user,
        };
      }
      return data;
    },
  });
}
