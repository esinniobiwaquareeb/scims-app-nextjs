import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/auth/change-password', body, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Password has been changed successfully.',
        };
      }
      return data;
    },
  });
}
