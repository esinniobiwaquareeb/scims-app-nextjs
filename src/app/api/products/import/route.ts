import { NextRequest, NextResponse } from 'next/server';

const getBackendUrl = (): string => {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const token = request.cookies.get('scims_auth_token')?.value;
  if (token) {
    return token;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const storeId = formData.get('store_id') as string;
    const businessId = formData.get('business_id') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!storeId || !businessId) {
      return NextResponse.json(
        { success: false, error: 'store_id and business_id are required' },
        { status: 400 }
      );
    }

    // Create new FormData for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('store_id', storeId);
    backendFormData.append('business_id', businessId);

    const backendUrl = getBackendUrl();
    const authToken = getAuthToken(request);

    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${backendUrl}/api/products/import`, {
      method: 'POST',
      headers,
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || 'Import failed',
        },
        { status: response.status }
      );
    }

    if (data.success && data.data) {
      return NextResponse.json({
        success: data.data.success,
        result: data.data,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in product import:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
