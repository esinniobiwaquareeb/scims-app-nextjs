import { NextRequest } from 'next/server';
import { proxyGet, proxyPut } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/businesses/${id}/settings`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          settings: data.data,
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
  return proxyPut(request, `/businesses/${id}/settings`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          settings: data.data,
          message: data.message || 'Business settings updated successfully',
        };
      }
      return data;
    },
  });
}
