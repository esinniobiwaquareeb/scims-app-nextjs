import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/supply-returns', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          supply_returns: Array.isArray(data.data) ? data.data : (data.data.supply_returns || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/supply-returns', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          supply_return: data.data,
          message: data.message || 'Supply return created successfully',
        };
      }
      return data;
    },
  });
}
