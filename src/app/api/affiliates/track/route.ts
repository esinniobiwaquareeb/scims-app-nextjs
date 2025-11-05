import { NextRequest, NextResponse } from 'next/server';
import { trackBusinessReferral } from '@/utils/affiliate/affiliateService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Track affiliate referral (when user clicks affiliate link during signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      affiliate_code,
      user_email,
      user_phone,
      referral_source
    } = body;

    if (!affiliate_code) {
      return NextResponse.json(
        { success: false, error: 'Affiliate code is required' },
        { status: 400 }
      );
    }

    // Track the referral (email is optional - can be set later during registration)
    const referralId = await trackBusinessReferral(
      affiliate_code,
      user_email || 'pending@example.com', // Placeholder if email not provided yet
      user_phone,
      referral_source || 'link'
    );

    if (!referralId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive affiliate code' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      referral_id: referralId,
      referral_code: affiliate_code.toUpperCase()
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/track:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
