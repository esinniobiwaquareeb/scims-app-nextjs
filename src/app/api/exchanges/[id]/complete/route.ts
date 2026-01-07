import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPost(request, `/exchanges/${id}/complete`, body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          transaction: data.data,
          message: data.message || 'Exchange transaction completed successfully. Stock has been restored.',
        };
      }
      return data;
    },
  });
}
