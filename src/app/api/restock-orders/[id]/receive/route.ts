import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPost(request, `/restock-orders/${id}/receive`, body, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Restock items received successfully',
        };
      }
      return data;
    },
  });
}
