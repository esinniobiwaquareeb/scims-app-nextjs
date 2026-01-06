import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/user-business-roles', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          userBusinessRoles: Array.isArray(data.data) ? data.data : [],
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
  return proxyPost(request, '/user-business-roles', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          userBusinessRole: data.data,
          message: data.message || 'User business role created successfully',
        };
      }
      return data;
    },
  });
}
