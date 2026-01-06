import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/apply', body, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Application submitted successfully! We will review your application and get back to you soon.',
          affiliate_id: data.data?.id || data.affiliate_id,
        };
      }
      return data;
    },
  });
}
