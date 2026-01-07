import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/restock-items', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { restockItems?: unknown[]; pagination?: unknown } | unknown[];
        return {
          success: true,
          restockItems: Array.isArray(dataObj) ? dataObj : (dataObj.restockItems || []),
          pagination:
            !Array.isArray(dataObj) && dataObj.pagination
              ? dataObj.pagination
              : {
                  limit: 100,
                  offset: 0,
                  total: Array.isArray(dataObj) ? dataObj.length : 0,
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
    transformResponse: (data: BackendResponse) => {
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
