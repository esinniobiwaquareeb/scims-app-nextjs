import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with the verification token
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, username, email, name, email_verification_expires_at')
      .eq('email_verification_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(user.email_verification_expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    const { error: updateError } = await supabase
      .from('user')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Email verification update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email. Please try again.' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'email_verified',
        category: 'Authentication',
        description: `Email verified for user: ${user.username}`,
        metadata: {
          username: user.username,
          email: user.email
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in to your account.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Email verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET method to handle email verification via link
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with the verification token
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, username, email, name, email_verification_expires_at')
      .eq('email_verification_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(user.email_verification_expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    const { error: updateError } = await supabase
      .from('user')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Email verification update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email. Please try again.' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'email_verified',
        category: 'Authentication',
        description: `Email verified for user: ${user.username}`,
        metadata: {
          username: user.username,
          email: user.email
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in to your account.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Email verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
