import { NextRequest } from 'next/server';
import { proxyPut } from '@/utils/backend-proxy';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPut(request, `/staff/${id}/assign-store`, body, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          previousStoreId: data.data?.previousStoreId,
          newStoreId: data.data?.newStoreId || body.store_id,
          message: data.message || 'Cashier store assignment updated successfully',
        };
      }
      return data;
    },
  });
}
