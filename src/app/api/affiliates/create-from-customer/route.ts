import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/create-from-customer', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
          message: data.message || 'Customer converted to affiliate successfully',
        };
      }
      return data;
    },
  });
}
