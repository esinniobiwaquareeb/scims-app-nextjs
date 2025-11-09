import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Validate affiliate code (does NOT create referral record)
// Referral records are only created when business successfully signs up
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliate_code } = body;

    if (!affiliate_code) {
      return NextResponse.json(
        { success: false, error: 'Affiliate code is required' },
        { status: 400 }
      );
    }

    // Only validate the affiliate code exists and is active
    // Do NOT create a referral record here
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, affiliate_code, status')
      .eq('affiliate_code', affiliate_code.toUpperCase())
      .eq('status', 'active')
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive affiliate code' },
        { status: 404 }
      );
    }

    // Return validation success without creating any records
    return NextResponse.json({
      success: true,
      affiliate_code: affiliate.affiliate_code,
      message: 'Affiliate code is valid'
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/track:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
