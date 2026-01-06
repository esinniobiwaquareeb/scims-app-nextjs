import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/products', {
    transformResponse: (data) => {
      // Transform backend response to match frontend expectations
      if (data.success && data.data) {
        // Backend returns { success: true, data: [...], total, page, limit }
        // Frontend expects { success: true, products: [...] }
        return {
          success: true,
          products: Array.isArray(data.data) ? data.data : [],
          total: data.total,
          page: data.page,
          limit: data.limit,
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/products', body, {
    transformResponse: (data) => {
      // Transform backend response to match frontend expectations
      if (data.success && data.data) {
        return {
          success: true,
          product: data.data,
          message: data.message || 'Product created successfully',
        };
      }
      return data;
    },
  });
}
