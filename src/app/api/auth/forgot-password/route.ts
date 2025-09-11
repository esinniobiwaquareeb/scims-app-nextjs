import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { EmailService } from '@/lib/email/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Email or username is required' },
        { status: 400 }
      );
    }

    // Find user by email or username
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, username, email, name, is_active, is_demo')
      .or(`email.eq.${identifier.toLowerCase()},username.eq.${identifier.toLowerCase()}`)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email or username exists, you will receive a password reset link.'
      });
    }

    // Don't allow password reset for demo users
    if (user.is_demo) {
      return NextResponse.json({
        success: false,
        error: 'Password reset is not available for demo accounts. Please use the demo login feature.'
      }, { status: 400 });
    }

    // Check if user has an email address
    if (!user.email) {
      return NextResponse.json({
        success: false,
        error: 'No email address associated with this account. Please contact support.'
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with reset token
    const { error: updateError } = await supabase
      .from('user')
      .update({
        password_reset_token: resetToken,
        password_reset_expires_at: resetExpires.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user with reset token:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate reset token. Please try again.' },
        { status: 500 }
      );
    }

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    const emailResult = await EmailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: resetUrl,
      businessName: 'SCIMS'
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Don't fail the request if email fails, but log it
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'password_reset_requested',
        category: 'Authentication',
        description: `Password reset requested for user: ${user.username}`,
        metadata: {
          username: user.username,
          email: user.email,
          email_sent: emailResult.success,
          email_error: emailResult.error || null
        }
      });

    return NextResponse.json({
      success: true,
      message: 'If an account with that email or username exists, you will receive a password reset link.',
      // Only include reset URL in development for debugging
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });

  } catch (error: unknown) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
