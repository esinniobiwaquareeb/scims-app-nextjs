import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPost(request, `/public/order/${id}/process`, body, {
    transformResponse: (data) => {
      if (data.success && data.order) {
        return {
          success: true,
          message: data.message || `Order ${body.status} successfully`,
          order: data.order,
        };
      }
      return data;
    },
  });
}
