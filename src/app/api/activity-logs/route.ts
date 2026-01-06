import { NextRequest } from 'next/server';
import { proxyGet, proxyDelete, BackendResponse } from '@/utils/backend-proxy';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/activity-logs', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          logs: Array.isArray(data.data) ? data.data : [],
          total: data.total || 0,
          pagination: data.pagination || {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
          },
        };
      }
      return data;
    },
  });
}

export async function DELETE(request: NextRequest) {
  return proxyDelete(request, '/activity-logs');
}
