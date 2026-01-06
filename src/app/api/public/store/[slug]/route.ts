import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyGet(request, `/public/store/${slug}`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          business: data.data.business,
          stores: data.data.stores || [],
          products: data.data.products || [],
          categories: data.data.categories || [],
        };
      }
      return data;
    },
  });
}
