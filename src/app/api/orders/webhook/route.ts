import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

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
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          orderId: data.data?.orderId || data.orderId,
          originalOrderId: body.orderId,
          message: data.message || 'Order created and notification sent successfully',
        };
      }
      return data;
    },
  });
}
