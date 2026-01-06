import { NextRequest } from 'next/server';
import { proxyPut } from '@/utils/backend-proxy';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPut(request, `/restock-orders/${id}/status`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          order: data.data,
          message: data.message || 'Restock order status updated successfully',
        };
      }
      return data;
    },
  });
}
