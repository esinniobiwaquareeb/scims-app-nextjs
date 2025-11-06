import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import crypto from 'crypto';
import { EmailService } from '@/lib/email/emailService';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, username, email, name, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { 
          success: true, 
          message: 'If an account with this email exists and is not verified, a verification email has been sent.' 
        },
        { status: 200 }
      );
    }

    // Check if email is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { success: false, error: 'Email address is already verified. You can log in to your account.' },
        { status: 400 }
      );
    }

    // Generate new email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours

    // Update user with new verification token
    const { error: updateError } = await supabase
      .from('user')
      .update({
        email_verification_token: emailVerificationToken,
        email_verification_expires_at: emailVerificationExpires.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Token update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate verification token. Please try again.' },
        { status: 500 }
      );
    }

    // Get user's business name if available
    let businessName = 'Your Business';
    const { data: userBusiness } = await supabase
      .from('user_business_role')
      .select('business_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (userBusiness) {
      const { data: business } = await supabase
        .from('business')
        .select('name')
        .eq('id', userBusiness.business_id)
        .single();

      if (business) {
        businessName = business.name;
      }
    }

    // Send verification email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scims.app';
      const verificationUrl = `${baseUrl}/auth/verify-email?token=${emailVerificationToken}`;
      
      await EmailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: verificationUrl,
        businessName: businessName
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'verification_email_resent',
        category: 'Authentication',
        description: `Verification email resent for user: ${user.username}`,
        metadata: {
          username: user.username,
          email: user.email
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox and click the verification link.'
    });

  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend verification email. Please try again.' },
      { status: 500 }
    );
  }
}

