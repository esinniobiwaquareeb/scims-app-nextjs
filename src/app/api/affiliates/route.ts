import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/affiliates', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliates: Array.isArray(data.data) ? data.data : (data.data.affiliates || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
          message: data.message || 'Affiliate created successfully',
        };
      }
      return data;
    },
  });
}
