import { NextResponse } from 'next/server';

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
