import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/roles/user-roles', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          userRoles: Array.isArray(data.data) ? data.data : [],
          pagination: {
            limit: 100,
            offset: 0,
            total: Array.isArray(data.data) ? data.data.length : 0,
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Use the assign endpoint
  return proxyPost(request, '/roles/assign', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          userRole: data.data,
          message: data.message || 'User role created successfully',
        };
      }
      return data;
    },
  });
}
