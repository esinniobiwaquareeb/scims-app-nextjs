import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/discounts/coupons', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          coupons: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/discounts/coupons', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          coupon: data.data,
        };
      }
      return data;
    },
  });
}
