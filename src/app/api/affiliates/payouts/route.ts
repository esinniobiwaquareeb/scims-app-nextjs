import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/affiliates/payouts', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { payouts?: unknown[] } | unknown[];
        return {
          success: true,
          payouts: Array.isArray(dataObj) ? dataObj : (dataObj.payouts || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/payouts', body, {
    transformResponse: (data: BackendResponse) => {
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
