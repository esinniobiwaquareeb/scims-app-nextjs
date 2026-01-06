import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  // Note: This endpoint may not exist in the backend yet
  // If it doesn't exist, the backend will return 404 and we'll handle it
  return proxyPost(request, '/admin/cleanup-database', {}, {
    transformResponse: (data: BackendResponse) => {
      if (data.success) {
        const dataObj = data.data as { results?: unknown; summary?: unknown } | undefined;
        return {
          success: data.success,
          message: data.message || 'Database cleanup completed',
          results: dataObj?.results || (data.results as unknown) || {},
          summary: dataObj?.summary || (data.summary as unknown),
        };
      }
      return data;
    },
  });
}
