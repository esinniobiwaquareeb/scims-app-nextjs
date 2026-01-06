import { NextRequest } from 'next/server';
import { proxyPatch } from '@/utils/backend-proxy';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  // Use the profile update endpoint
  return proxyPatch(request, '/auth/profile', body, {
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
