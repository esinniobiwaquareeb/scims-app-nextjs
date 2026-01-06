import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/sale-returns', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          returns: Array.isArray(data.data) ? data.data : [],
          total: data.total,
          page: data.page,
          limit: data.limit,
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
    items: body.return_items?.map((item: any) => ({
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
