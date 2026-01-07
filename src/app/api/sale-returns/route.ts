import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const saleId = searchParams.get('sale_id');
  const status = searchParams.get('status');

  const params: Record<string, string> = {};
  if (storeId) params.store_id = storeId;
  if (saleId) params.sale_id = saleId;
  if (status) params.status = status;

  return proxyGet(request, '/sale-returns', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const paginationData = (data as { pagination?: { page?: number; limit?: number; total?: number } }).pagination;
        const page = paginationData?.page || 1;
        const limit = paginationData?.limit || 10;
        const total = paginationData?.total || 0;
        return {
          success: true,
          returns: Array.isArray(data.data) ? data.data : [],
          pagination: {
            total: total || 0,
            page: page || 1,
            limit: limit || 10,
            offset: ((page || 1) - 1) * (limit || 10),
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Transform frontend format to backend format
  const backendBody = {
    sale_id: body.sale_id,
    items: body.return_items?.map((item: {
      sale_item_id: string;
      quantity_returned: number;
    }) => ({
      sale_item_id: item.sale_item_id,
      quantity: item.quantity_returned,
    })) || [],
    refund_method: body.refund_method || 'cash',
    reason: body.return_reason || body.reason,
    notes: body.notes,
  };
  return proxyPost(request, '/sale-returns', backendBody, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          return: data.data,
        };
      }
      return data;
    },
  });
}
