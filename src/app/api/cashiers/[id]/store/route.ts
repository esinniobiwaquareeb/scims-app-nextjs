import { NextRequest } from 'next/server';
import { proxyPut, BackendResponse } from '@/utils/backend-proxy';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPut(request, `/staff/${id}/assign-store`, body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success) {
        const dataObj = data.data as { previousStoreId?: string; newStoreId?: string } | undefined;
        return {
          success: true,
          previousStoreId: dataObj?.previousStoreId,
          newStoreId: dataObj?.newStoreId || body.store_id,
          message: data.message || 'Cashier store assignment updated successfully',
        };
      }
      return data;
    },
  });
}
