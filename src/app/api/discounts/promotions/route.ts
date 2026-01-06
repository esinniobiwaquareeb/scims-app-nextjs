import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/discounts/promotions', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          promotions: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/discounts/promotions', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          promotion: data.data,
        };
      }
      return data;
    },
  });
}
