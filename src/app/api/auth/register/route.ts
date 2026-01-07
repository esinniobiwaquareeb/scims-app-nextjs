import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/auth/register', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { user?: unknown; business?: unknown } | undefined;
        return {
          success: true,
          message: data.message || 'Registration successful. Please check your email to verify your account.',
          user: dataObj?.user || data.data,
          business: dataObj?.business || null,
        };
      }
      return data;
    },
  });
}
