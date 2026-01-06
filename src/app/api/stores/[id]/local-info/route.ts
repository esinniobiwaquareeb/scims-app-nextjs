import { NextRequest } from 'next/server';
import { proxyGet, proxyPut } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/stores/${id}/local-info`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          localInfo: data.data,
        };
      }
      return data;
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPut(request, `/stores/${id}/local-info`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          localInfo: data.data,
          message: data.message || 'Store local info updated successfully',
        };
      }
      return data;
    },
  });
}
