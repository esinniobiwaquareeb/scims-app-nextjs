import { NextRequest } from 'next/server';
import { proxyGet, proxyPut } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/platform/settings', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          settings: data.data,
        };
      }
      return data;
    },
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return proxyPut(request, '/platform/settings', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          settings: data.data,
        };
      }
      return data;
    },
  });
}
