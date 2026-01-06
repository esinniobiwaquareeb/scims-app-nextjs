import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPost(request, `/supply-orders/${id}/accept-return`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          supply_order: data.data,
          message: data.message || 'Returned items accepted successfully',
        };
      }
      return data;
    },
  });
}
