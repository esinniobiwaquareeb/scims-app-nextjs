import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Reset affiliate password with token
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
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find affiliate with valid reset token
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, name, email, password_reset_token, password_reset_expires_at, status, application_status')
      .eq('password_reset_token', token)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(affiliate.password_reset_expires_at);
    
    if (now > tokenExpiry) {
      // Clear expired token
      await supabase
        .from('affiliate')
        .update({
          password_reset_token: null,
          password_reset_expires_at: null
        })
        .eq('id', affiliate.id);

      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Check if affiliate is approved and active
    if (affiliate.application_status !== 'approved' || affiliate.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Your affiliate account is not active. Please contact support.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update affiliate password and clear reset token
    const { error: updateError } = await supabase
      .from('affiliate')
      .update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', affiliate.id);

    if (updateError) {
      console.error('Failed to update affiliate password:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Error in POST /api/affiliates/auth/reset-password:', error);
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

    // Find affiliate with valid reset token
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, name, email, password_reset_expires_at, status, application_status')
      .eq('password_reset_token', token)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(affiliate.password_reset_expires_at);
    
    if (now > tokenExpiry) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if affiliate is approved and active
    if (affiliate.application_status !== 'approved' || affiliate.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Your affiliate account is not active.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email
      }
    });

  } catch (error) {
    console.error('Error in GET /api/affiliates/auth/reset-password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

