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

// POST - Submit affiliate application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      preferred_code,
      application_data, // Why they want to be affiliate, social media handles, etc.
      payment_method,
      payment_details
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingAffiliate } = await supabase
      .from('affiliate')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingAffiliate) {
      return NextResponse.json(
        { success: false, error: 'An affiliate application with this email already exists' },
        { status: 400 }
      );
    }

    // Handle preferred code or generate one
    let affiliateCode: string;
    
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
        const generatedCode = generateAffiliateCode(name);
        const isUnique = await isAffiliateCodeUnique(generatedCode);
        
        if (isUnique) {
          affiliateCode = generatedCode;
          break;
        }
        
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { success: false, error: 'Failed to generate unique affiliate code. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Create affiliate application
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .insert({
        affiliate_code: affiliateCode!,
        name,
        email: email.toLowerCase(),
        phone: phone ?? null,
        status: 'pending',
        application_status: 'pending',
        application_data: application_data || {},
        payment_method: payment_method || null,
        payment_details: payment_details || null,
        commission_rate: 10.00, // Default commission rate
        commission_type: 'percentage'
      })
      .select()
      .single();

    if (affiliateError) {
      console.error('Error creating affiliate application:', affiliateError);
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Send confirmation email to affiliate
    const platformUrl = env.NEXT_PUBLIC_BASE_URL;
    const emailResult = await EmailService.sendAffiliateApplicationEmail({
      to: affiliate.email,
      name: affiliate.name,
      affiliateCode: affiliate.affiliate_code,
      platformUrl: platformUrl
    });

    if (!emailResult.success) {
      console.error('Failed to send application confirmation email:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review your application and get back to you soon.',
      affiliate_id: affiliate.id
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/apply:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

