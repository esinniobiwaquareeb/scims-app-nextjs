import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/ai-agent/conversations', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          conversations: Array.isArray(data.data) ? data.data : (data.data.conversations || []),
        };
      }
      return data;
    },
  });
}
