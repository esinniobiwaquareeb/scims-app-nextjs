import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/apply', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success) {
        const dataObj = data.data as { id?: string } | undefined;
        return {
          success: true,
          message: data.message || 'Application submitted successfully! We will review your application and get back to you soon.',
          affiliate_id: dataObj?.id || (data.affiliate_id as string | undefined),
        };
      }
      return data;
    },
  });
}
