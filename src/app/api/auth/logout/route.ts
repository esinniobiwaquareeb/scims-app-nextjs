import { NextResponse } from 'next/server';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the authentication cookie
  response.cookies.set('scims_auth_token', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: false, // Allow client-side access
    sameSite: 'strict'
  });
  
  return response;
}
