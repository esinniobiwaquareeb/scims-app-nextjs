import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/auth/register', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          message: data.message || 'Registration successful. Please check your email to verify your account.',
          user: data.data.user || data.data,
          business: data.data.business || null,
        };
      }
      return data;
    },
  });
}
