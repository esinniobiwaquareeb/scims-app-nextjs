import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Filter out empty customer_id (only include if it has a value)
  const transformedBody: {
    business_id: string;
    store_id: string;
    customer_id?: string;
    subtotal: number;
    product_ids?: string[];
  } = {
    business_id: body.business_id,
    store_id: body.store_id,
    subtotal: body.subtotal,
  };
  
  if (body.customer_id && body.customer_id.trim()) {
    transformedBody.customer_id = body.customer_id;
  }
  
  if (body.product_ids && Array.isArray(body.product_ids) && body.product_ids.length > 0) {
    transformedBody.product_ids = body.product_ids;
  }
  
  return proxyPost(request, '/discounts/applicable-promotions', transformedBody, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          promotions: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}
