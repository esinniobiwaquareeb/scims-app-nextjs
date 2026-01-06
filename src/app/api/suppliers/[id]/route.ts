import { NextRequest } from 'next/server';
import { proxyPatch, proxyDelete } from '@/utils/backend-proxy';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPatch(request, `/suppliers/${id}`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          supplier: data.data,
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
  return proxyDelete(request, `/suppliers/${id}`);
}
