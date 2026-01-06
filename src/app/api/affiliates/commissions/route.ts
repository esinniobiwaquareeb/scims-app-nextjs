import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/affiliates/commissions', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          commissions: Array.isArray(data.data) ? data.data : (data.data.commissions || []),
        };
      }
      return data;
    },
  });
}
