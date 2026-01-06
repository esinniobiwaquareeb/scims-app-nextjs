import { NextRequest } from 'next/server';
import { proxyDelete } from '@/utils/backend-proxy';

export async function DELETE(request: NextRequest) {
  return proxyDelete(request, '/activity-logs', {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'All activity logs cleared successfully',
        };
      }
      return data;
    },
  });
}
