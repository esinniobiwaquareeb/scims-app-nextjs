import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/roles/assign', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          userRole: data.data,
          message: data.message || 'Role assigned successfully',
        };
      }
      return data;
    },
  });
}
