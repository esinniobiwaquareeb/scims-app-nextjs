import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/ai-agent/conversations/${id}/messages`, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { messages?: unknown[] } | unknown[];
        return {
          success: true,
          messages: Array.isArray(dataObj) ? dataObj : (dataObj.messages || []),
        };
      }
      return data;
    },
  });
}
