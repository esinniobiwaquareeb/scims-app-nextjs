import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/quotations', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          quotations: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/quotations', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          quotation: data.data,
        };
      }
      return data;
    },
  });
}
