import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, proxyPatch, proxyDelete } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/notifications', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          notifications: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/notifications', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          notification: data.data,
        };
      }
      return data;
    },
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  return proxyPatch(request, '/notifications', body, {
    transformResponse: (data) => {
      return data;
    },
  });
}

export async function DELETE(request: NextRequest) {
  return proxyDelete(request, '/notifications');
}
