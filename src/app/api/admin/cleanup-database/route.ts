import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  // Note: This endpoint may not exist in the backend yet
  // If it doesn't exist, the backend will return 404 and we'll handle it
  return proxyPost(request, '/admin/cleanup-database', {}, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: data.success,
          message: data.message || 'Database cleanup completed',
          results: data.data?.results || data.results || {},
          summary: data.data?.summary || data.summary,
        };
      }
      return data;
    },
  });
}
