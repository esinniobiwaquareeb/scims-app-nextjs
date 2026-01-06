import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/public/order', body, {
    transformResponse: (data) => {
      if (data.success && data.order) {
        return {
          success: true,
          order: data.order,
          whatsappUrl: data.whatsappUrl || '',
          message: data.message || 'Order placed successfully! You will receive a confirmation via WhatsApp.',
        };
      }
      return data;
    },
  });
}
