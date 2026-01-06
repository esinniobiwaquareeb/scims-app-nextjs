import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyPost(request, `/quotations/${id}/send`, {}, {
    transformResponse: (data) => {
      return data;
    },
  });
}
