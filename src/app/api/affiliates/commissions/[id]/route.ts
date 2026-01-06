import { NextRequest } from 'next/server';
import { proxyPut } from '@/utils/backend-proxy';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPut(request, `/affiliates/commissions/${id}`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          commission: data.data,
          message: data.message || 'Commission currency updated successfully',
        };
      }
      return data;
    },
  });
}
