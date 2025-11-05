import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, username, email, name, password_reset_token, password_reset_expires_at, is_active, is_demo')
      .eq('password_reset_token', token)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(user.password_reset_expires_at);
    
    if (now > tokenExpiry) {
      // Clear expired token
      await supabase
        .from('user')
        .update({
          password_reset_token: null,
          password_reset_expires_at: null
        })
        .eq('id', user.id);

      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Don't allow password reset for demo users
    if (user.is_demo) {
      return NextResponse.json(
        { success: false, error: 'Password reset is not available for demo accounts.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    const { error: updateError } = await supabase
      .from('user')
      .update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user password:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'password_reset_completed',
        category: 'Authentication',
        description: `Password reset completed for user: ${user.username}`,
        metadata: {
          username: user.username,
          email: user.email
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error: unknown) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to validate reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Reset token is required' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, username, email, name, password_reset_expires_at, is_active, is_demo')
      .eq('password_reset_token', token)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(user.password_reset_expires_at);
    
    if (now > tokenExpiry) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Don't allow password reset for demo users
    if (user.is_demo) {
      return NextResponse.json(
        { success: false, error: 'Password reset is not available for demo accounts.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error: unknown) {
    console.error('Validate reset token API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
