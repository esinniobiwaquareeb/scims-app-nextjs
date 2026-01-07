import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return proxyGet(request, `/public/store/${slug}`, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { business?: unknown; stores?: unknown[]; products?: unknown[]; categories?: unknown[] };
        return {
          success: true,
          business: dataObj.business,
          stores: dataObj.stores || [],
          products: dataObj.products || [],
          categories: dataObj.categories || [],
        };
      }
      return data;
    },
  });
}
