import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/affiliates/referrals', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { referrals?: unknown[] } | unknown[];
        return {
          success: true,
          referrals: Array.isArray(dataObj) ? dataObj : (dataObj.referrals || []),
        };
      }
      return data;
    },
  });
}
