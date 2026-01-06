import { NextRequest } from 'next/server';
import { proxyGet, proxyPut } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/affiliates/profile', {
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

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return proxyPut(request, '/affiliates/profile', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
          message: data.message || 'Profile updated successfully',
        };
      }
      return data;
    },
  });
}
