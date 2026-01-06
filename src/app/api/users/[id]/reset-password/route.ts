import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPost(request, `/auth/users/${id}/reset-password`, { newPassword: body.newPassword }, {
    transformResponse: (data) => {
      if (data.success && data.user) {
        return {
          success: true,
          message: data.message || 'Password reset successfully',
          user: data.user,
        };
      }
      return data;
    },
  });
}
