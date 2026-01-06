import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return Response.json(
      { success: false, error: 'Reset token is required' },
      { status: 400 }
    );
  }

  return proxyGet(request, `/affiliates/auth/reset-password?token=${token}`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/auth/reset-password', body, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Password has been reset successfully. You can now log in with your new password.',
        };
      }
      return data;
    },
  });
}
