import { NextRequest } from 'next/server';
import { proxyDelete } from '@/utils/backend-proxy';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyDelete(request, `/saved-carts/${id}`);
}
