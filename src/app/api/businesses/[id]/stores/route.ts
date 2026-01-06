import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/businesses/${id}/stores`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          stores: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}
