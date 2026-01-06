import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/supply-orders/pending-returns', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          pending_returns: Array.isArray(data.data) ? data.data : (data.data.pending_returns || []),
        };
      }
      return data;
    },
  });
}
