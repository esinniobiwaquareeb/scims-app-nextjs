import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Transform the request body to match backend format
  const backendBody = {
    orderId: body.orderId,
    storeId: body.storeId,
    businessId: body.businessId,
    orderData: body.orderData,
  };

  return proxyPost(request, '/public/order/webhook', backendBody, {
    transformResponse: (data: BackendResponse) => {
      if (data.success) {
        const dataObj = data.data as { orderId?: string } | undefined;
        return {
          success: true,
          orderId: dataObj?.orderId || (data.orderId as string | undefined),
          originalOrderId: body.orderId,
          message: data.message || 'Order created and notification sent successfully',
        };
      }
      return data;
    },
  });
}

