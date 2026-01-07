import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/affiliates/commissions', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { commissions?: unknown[] } | unknown[];
        return {
          success: true,
          commissions: Array.isArray(dataObj) ? dataObj : (dataObj.commissions || []),
        };
      }
      return data;
    },
  });
}
