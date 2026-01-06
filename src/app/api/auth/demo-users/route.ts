import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/auth/demo-users', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          users: Array.isArray(data.data) ? data.data : (data.data.users || []),
        };
      }
      return data;
    },
  });
}
