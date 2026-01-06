import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/restock-items', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          restockItems: Array.isArray(data.data) ? data.data : (data.data.restockItems || []),
          pagination: data.data.pagination || {
            limit: 100,
            offset: 0,
            total: Array.isArray(data.data) ? data.data.length : 0,
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/restock-items', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          restockItem: data.data,
          message: data.message || 'Restock item created successfully',
        };
      }
      return data;
    },
  });
}
