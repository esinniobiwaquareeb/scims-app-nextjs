import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EmailService } from '@/lib/email/emailService';
import { trackBusinessReferral, markReferralAsConverted } from '@/utils/affiliate/affiliateService';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { 
      username, 
      email, 
      password, 
      confirmPassword, 
      name, 
      phone,
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      businessEmail,
      countryId,
      currencyId,
      languageId,
      affiliate_code,
      referral_id
    } = await request.json();

    // Validation
    if (!username || !email || !password || !confirmPassword || !name) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('user')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('user')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Start transaction by creating the user
    const { data: user, error: userError } = await supabase
      .from('user')
      .insert({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
        phone: phone || null,
        role: 'business_admin',
        is_active: true,
        is_demo: false,
        email_verified: false,
        email_verification_token: emailVerificationToken,
        email_verification_expires_at: emailVerificationExpires.toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create business if business information is provided
    let business = null;
    if (businessName && businessType) {
      const { data: businessData, error: businessError } = await supabase
        .from('business')
        .insert({
          name: businessName,
          business_type: businessType,
          address: businessAddress || null,
          email: businessEmail || email,
          phone: businessPhone || phone,
          country_id: countryId || null,
          currency_id: currencyId || null,
          language_id: languageId || null,
          subscription_status: 'active',
          is_active: true
        })
        .select()
        .single();

      if (businessError) {
        console.error('Business creation error:', businessError);
        // Don't fail the entire operation if business creation fails
      } else {
        business = businessData;

        // Handle affiliate referral tracking
        if (referral_id) {
          // Mark referral as converted
          await markReferralAsConverted(referral_id, business.id);
        } else if (affiliate_code) {
          // Track new referral and mark as converted
          const newReferralId = await trackBusinessReferral(affiliate_code, email, phone, 'registration');
          if (newReferralId) {
            await markReferralAsConverted(newReferralId, business.id);
          }
        }

        // Create default store for the business
        const { data: store, error: storeError } = await supabase
          .from('store')
          .insert({
            name: `${businessName} Main Store`,
            address: businessAddress || 'Address to be updated',
            business_id: business.id,
            currency_id: currencyId || null,
            language_id: languageId || null,
            country_id: countryId || null,
            is_active: true
          })
          .select()
          .single();

        if (!storeError && store) {
          // Create user-business role relationship
          await supabase
            .from('user_business_role')
            .insert({
              user_id: user.id,
              business_id: business.id,
              store_id: store.id
            });

          // Create default store settings
          await supabase
            .from('store_setting')
            .insert({
              store_id: store.id
            });

          // Copy platform roles to business and assign business_admin role
          try {
            await supabase.rpc('assign_platform_roles_to_business', { 
              business_uuid: business.id 
            });

            const { data: businessAdminRole } = await supabase
              .from('role')
              .select('id')
              .eq('name', 'business_admin')
              .eq('business_id', business.id)
              .single();

            if (businessAdminRole) {
              await supabase
                .from('user_role')
                .insert({
                  user_id: user.id,
                  role_id: businessAdminRole.id,
                  business_id: business.id,
                  store_id: store.id
                });
            }
          } catch (roleError) {
            console.warn('Role assignment failed:', roleError);
          }

          // Create default business settings
          await supabase
            .from('business_setting')
            .insert({
              business_id: business.id
            });
        }
      }
    }

    // Send email verification email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scims.app';
      const verificationUrl = `${baseUrl}/auth/verify-email?token=${emailVerificationToken}`;
      
      await EmailService.sendVerificationEmail({
        to: email,
        name: name,
        verificationUrl: verificationUrl,
        businessName: businessName || 'Your Business'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail registration if email sending fails
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        business_id: business?.id || null,
        activity_type: 'registration',
        category: 'Authentication',
        description: `User registered: ${username}`,
        metadata: {
          username: username,
          email: email,
          business_name: businessName || null
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified
      },
      business: business ? {
        id: business.id,
        name: business.name,
        business_type: business.business_type
      } : null
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
