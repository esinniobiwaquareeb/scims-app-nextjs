import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const getBackendUrl = (): string => {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/Email and password are required' },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Login failed' },
        { status: response.status }
      );
    }

    // Backend returns: { success: true, access_token, user }
    // Transform to match frontend expectations
    if (data.success && data.access_token && data.user) {
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          isActive: data.user.is_active,
          isDemo: data.user.is_demo,
          createdAt: data.user.created_at || data.user.last_login,
        },
        access_token: data.access_token,
      });
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error: unknown) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
