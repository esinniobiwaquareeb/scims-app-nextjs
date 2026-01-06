import { NextRequest } from 'next/server';
import { proxyGet, proxyPut, proxyDelete } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/affiliates/${id}`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
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
  return proxyPut(request, `/affiliates/${id}`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
          message: data.message || 'Affiliate updated successfully',
        };
      }
      return data;
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyDelete(request, `/affiliates/${id}`, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Affiliate deleted successfully',
        };
      }
      return data;
    },
  });
}
