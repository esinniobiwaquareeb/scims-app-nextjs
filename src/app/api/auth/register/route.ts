import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EmailService } from '@/lib/email/emailService';
import { createAffiliateCommission } from '@/utils/affiliate/affiliateService';

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

    // Validate affiliate code if provided (only validate, don't create referral yet)
    // If invalid, allow registration to proceed but don't create referral
    let affiliateId: string | null = null;
    if (affiliate_code) {
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliate')
        .select('id, status')
        .eq('affiliate_code', affiliate_code.toUpperCase())
        .eq('status', 'active')
        .single();

      if (affiliateError || !affiliate) {
        // Log warning but don't block registration
        console.warn(`Invalid or inactive affiliate code provided during registration: ${affiliate_code}`, affiliateError);
        // Continue with registration - affiliate code will be ignored
      } else {
        affiliateId = affiliate.id;
      }
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

        // Handle affiliate referral tracking and commission creation
        // Only create referral record when business successfully signs up
        let finalReferralId: string | null = null;
        if (affiliateId && affiliate_code) {
          // Create referral record and mark as converted immediately (since signup succeeded)
          const referralExpiresAt = new Date();
          referralExpiresAt.setDate(referralExpiresAt.getDate() + 90);

          const { data: referral, error: referralError } = await supabase
            .from('affiliate_referral')
            .insert({
              affiliate_id: affiliateId,
              business_id: business.id,
              user_email: email.toLowerCase(),
              user_phone: phone || null,
              referral_code: affiliate_code.toUpperCase(),
              referral_source: 'registration',
              status: 'converted', // Mark as converted immediately since signup succeeded
              converted_at: new Date().toISOString(),
              expires_at: referralExpiresAt.toISOString()
            })
            .select()
            .single();

          if (!referralError && referral) {
            finalReferralId = referral.id;

            // Update affiliate business count
            const { data: currentAffiliate } = await supabase
              .from('affiliate')
              .select('total_businesses, total_referrals')
              .eq('id', affiliateId)
              .single();

            if (currentAffiliate) {
              await supabase
                .from('affiliate')
                .update({
                  total_businesses: (currentAffiliate.total_businesses || 0) + 1,
                  total_referrals: (currentAffiliate.total_referrals || 0) + 1
                })
                .eq('id', affiliateId);
            }
          } else {
            console.error('Error creating affiliate referral:', referralError);
            // Don't fail registration if referral creation fails
          }
        }

        // Create signup commission if referral exists
        if (finalReferralId && business) {
          // Get affiliate to determine commission type
          const { data: referralData } = await supabase
            .from('affiliate_referral')
            .select('affiliate_id, affiliate:affiliate_id(signup_commission_type, signup_commission_rate)')
            .eq('id', finalReferralId)
            .single();

          if (referralData) {
            const affiliate = referralData.affiliate as { signup_commission_type?: string; signup_commission_rate?: number } | null;
            // For percentage-based signup commissions, use a default signup value
            // For fixed commissions, the amount doesn't matter (will use fixed amount)
            const signupValue = affiliate?.signup_commission_type === 'percentage' 
              ? 100 // Default signup value for percentage calculations (can be made configurable)
              : 0; // Amount doesn't matter for fixed commissions

            try {
              await createAffiliateCommission({
                businessId: business.id,
                amount: signupValue,
                commissionType: 'signup',
                referralId: finalReferralId,
                currencyId: business.currency_id || undefined // Pass currency from business (Issue #8)
              });
            } catch (commissionError) {
              console.error('Error creating signup commission:', commissionError);
              // Don't fail registration if commission creation fails
            }
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
