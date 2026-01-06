import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/activity-logs', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          activity_log: data.data,
        };
      }
      return data;
    },
  });
}
