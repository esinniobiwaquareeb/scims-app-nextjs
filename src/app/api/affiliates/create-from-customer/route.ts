import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { EmailService } from '@/lib/email/emailService';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Generate unique affiliate code
function generateAffiliateCode(name: string): string {
  const namePart = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'A');
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `${namePart}${randomPart}`;
}

// Check if affiliate code is unique
async function isAffiliateCodeUnique(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('affiliate')
    .select('id')
    .eq('affiliate_code', code.toUpperCase())
    .single();
  
  return !data; // Returns true if code doesn't exist (is unique)
}

// POST - Create affiliate directly from customer (bypass application process)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      user_id,
      name,
      email,
      phone,
      preferred_code,
      signup_commission_type = 'percentage',
      signup_commission_rate = 10,
      signup_commission_fixed = 0,
      subscription_commission_rate = 10,
      payment_method,
      payment_details
    } = body;

    if (!customer_id && !user_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID or User ID is required' },
        { status: 400 }
      );
    }

    // Get customer/user information
    let customerData: { id: string; name: string; email?: string; phone?: string } | null = null;
    let linkedUserId: string | null = null;

    if (customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customer')
        .select('id, name, email, phone')
        .eq('id', customer_id)
        .single();

      if (customerError || !customer) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }

      customerData = customer;

      // Try to find user by email to link affiliate to user account
      if (customer.email) {
        const { data: user } = await supabase
          .from('user')
          .select('id')
          .eq('email', customer.email.toLowerCase())
          .single();
        
        if (user) {
          linkedUserId = user.id;
        }
      }
    } else if (user_id) {
      const { data: user, error: userError } = await supabase
        .from('user')
        .select('id, name, email, phone')
        .eq('id', user_id)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      customerData = {
        id: user.id,
        name: user.name || '',
        email: user.email,
        phone: user.phone || undefined
      };
      linkedUserId = user.id;
    }

    if (!customerData) {
      return NextResponse.json(
        { success: false, error: 'Could not retrieve customer/user data' },
        { status: 500 }
      );
    }

    // Use provided data or fall back to customer data
    const finalName = name || customerData.name;
    const finalEmail = email || customerData.email;
    const finalPhone = phone || customerData.phone;
    const finalUserId = linkedUserId || user_id || null;

    // Check if customer is already an affiliate
    if (finalEmail) {
      const { data: existingAffiliate } = await supabase
        .from('affiliate')
        .select('id, email, application_status')
        .eq('email', finalEmail.toLowerCase())
        .single();

      if (existingAffiliate) {
        if (existingAffiliate.application_status !== 'rejected') {
          return NextResponse.json(
            { success: false, error: 'This customer is already an affiliate' },
            { status: 400 }
          );
        }
        // If rejected, we can update it
      }
    }

    // Handle preferred code or generate one
    let affiliateCode: string | null = null;
    
    if (preferred_code && preferred_code.trim()) {
      // Validate preferred code
      const cleanedCode = preferred_code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanedCode.length < 3 || cleanedCode.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Affiliate code must be 3-20 alphanumeric characters' },
          { status: 400 }
        );
      }

      // Check if preferred code is unique
      const isUnique = await isAffiliateCodeUnique(cleanedCode);
      if (!isUnique) {
        return NextResponse.json(
          { success: false, error: 'This affiliate code is already taken. Please choose a different one.' },
          { status: 400 }
        );
      }
      affiliateCode = cleanedCode;
    } else {
      // Generate unique affiliate code
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const generatedCode = generateAffiliateCode(finalName);
        const isUnique = await isAffiliateCodeUnique(generatedCode);
        
        if (isUnique) {
          affiliateCode = generatedCode;
          break;
        }
        
        attempts++;
      }

      if (!affiliateCode || attempts >= maxAttempts) {
        return NextResponse.json(
          { success: false, error: 'Failed to generate unique affiliate code. Please try again.' },
          { status: 500 }
        );
      }
    }

    if (!affiliateCode) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate affiliate code' },
        { status: 500 }
      );
    }

    // Create affiliate directly (approved and active, bypassing application)
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .insert({
        affiliate_code: affiliateCode,
        name: finalName,
        email: finalEmail?.toLowerCase() || null,
        phone: finalPhone || null,
        user_id: finalUserId || null, // Link to user account
        status: 'active',
        application_status: 'approved',
        commission_rate: subscription_commission_rate,
        commission_type: 'percentage',
        signup_commission_type: signup_commission_type,
        signup_commission_rate: signup_commission_rate,
        signup_commission_fixed: signup_commission_fixed,
        subscription_commission_rate: subscription_commission_rate,
        payment_method: payment_method || null,
        payment_details: payment_details || null,
        reviewed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (affiliateError) {
      console.error('Error creating affiliate:', affiliateError);
      return NextResponse.json(
        { success: false, error: 'Failed to create affiliate' },
        { status: 500 }
      );
    }

    // Send approval email to affiliate
    if (finalEmail) {
      const platformUrl = env.NEXT_PUBLIC_BASE_URL;
      const emailResult = await EmailService.sendAffiliateApprovalEmail({
        to: finalEmail,
        name: finalName,
        affiliateCode: affiliateCode,
        platformUrl: platformUrl,
        loginUrl: `${platformUrl}/affiliate/login`
      });

      if (!emailResult.success) {
        console.error('Failed to send approval email:', emailResult.error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      affiliate,
      message: `Customer ${finalName} has been successfully converted to an affiliate with code ${affiliateCode}`
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/create-from-customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

