import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/public/order/${id}`, {
    transformResponse: (data) => {
      if (data.success && data.order) {
        return {
          success: true,
          order: data.order,
        };
      }
      return data;
    },
  });
}
