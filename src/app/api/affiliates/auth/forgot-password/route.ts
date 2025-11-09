import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import crypto from 'crypto';
import { EmailService } from '@/lib/email/emailService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Request password reset for affiliate
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find affiliate by email
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, name, email, status, application_status')
      .eq('email', email.toLowerCase())
      .single();

    if (affiliateError || !affiliate) {
      // Don't reveal if affiliate exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, you will receive a password reset link.'
      });
    }

    // Check if affiliate is approved and active
    if (affiliate.application_status !== 'approved' || affiliate.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Your affiliate account is not active. Please contact support.'
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update affiliate with reset token
    const { error: updateError } = await supabase
      .from('affiliate')
      .update({
        password_reset_token: resetToken,
        password_reset_expires_at: resetExpires.toISOString()
      })
      .eq('id', affiliate.id);

    if (updateError) {
      console.error('Error updating affiliate with reset token:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to process password reset request' },
        { status: 500 }
      );
    }

    // Send password reset email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scims.app';
      const resetUrl = `${baseUrl}/affiliate/reset-password?token=${resetToken}`;

      await EmailService.sendPasswordResetEmail({
        to: affiliate.email,
        name: affiliate.name,
        resetUrl: resetUrl
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('Error in POST /api/affiliates/auth/forgot-password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

