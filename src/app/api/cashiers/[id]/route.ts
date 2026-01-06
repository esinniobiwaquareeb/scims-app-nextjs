import { NextRequest } from 'next/server';
import { proxyGet, proxyPatch, proxyDelete } from '@/utils/backend-proxy';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/users/cashiers/${id}`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          cashier: data.data,
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
  return proxyPatch(request, `/users/cashiers/${id}`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          user: data.data,
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
  return proxyDelete(request, `/users/cashiers/${id}`);
}
