import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/supply-orders/pending-returns', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { pending_returns?: unknown[] } | unknown[];
        return {
          success: true,
          pending_returns: Array.isArray(dataObj) ? dataObj : (dataObj.pending_returns || []),
        };
      }
      return data;
    },
  });
}
