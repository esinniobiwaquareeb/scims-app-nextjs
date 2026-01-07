import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/ai-agent/conversations', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { conversations?: unknown[] } | unknown[];
        return {
          success: true,
          conversations: Array.isArray(dataObj) ? dataObj : (dataObj.conversations || []),
        };
      }
      return data;
    },
  });
}
