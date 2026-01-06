import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/products/low-stock', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          products: Array.isArray(data.data) ? data.data : [],
          allProducts: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}
