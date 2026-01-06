import { NextRequest } from 'next/server';
import { proxyGet, proxyPatch, proxyDelete } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/sales/${id}`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          sale: data.data,
        };
      }
      return data;
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPatch(request, `/sales/${id}`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          sale: data.data,
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
  return proxyDelete(request, `/sales/${id}`);
}
