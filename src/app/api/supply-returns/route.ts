import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/supply-returns', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { supply_returns?: unknown[] } | unknown[];
        return {
          success: true,
          supply_returns: Array.isArray(dataObj) ? dataObj : (dataObj.supply_returns || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/supply-returns', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          supply_return: data.data,
          message: data.message || 'Supply return created successfully',
        };
      }
      return data;
    },
  });
}
