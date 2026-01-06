import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/affiliates/payouts', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          payouts: Array.isArray(data.data) ? data.data : (data.data.payouts || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/payouts', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          payout: data.data,
          message: data.message || 'Payout created successfully',
        };
      }
      return data;
    },
  });
}
