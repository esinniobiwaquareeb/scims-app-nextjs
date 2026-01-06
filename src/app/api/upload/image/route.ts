import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  // For file uploads, we need to handle FormData differently
  // The backend proxy will handle this, but we need to pass the FormData directly
  const formData = await request.formData();
  
  // Create a new request with FormData for the backend
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const token = request.headers.get('authorization') || request.cookies.get('scims_auth_token')?.value;
  
  try {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    const response = await fetch(`${backendUrl}/api/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
