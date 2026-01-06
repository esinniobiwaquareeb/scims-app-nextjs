import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/discounts/types', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          discountTypes: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}
