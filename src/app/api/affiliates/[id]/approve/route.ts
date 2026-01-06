import { NextRequest } from 'next/server';
import { proxyPost, proxyPut } from '@/utils/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyPost(request, `/affiliates/${id}/approve`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
          message: data.message || 'Affiliate approved successfully',
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
  return proxyPut(request, `/affiliates/${id}/reject`, body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
          message: data.message || 'Affiliate application rejected',
        };
      }
      return data;
    },
  });
}
