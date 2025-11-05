import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch referrals for an affiliate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliate_id');

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    const { data: referrals, error } = await supabase
      .from('affiliate_referral')
      .select(`
        *,
        business:business_id(
          id,
          name,
          email,
          subscription_status,
          subscription_plan_id,
          subscription_plan:subscription_plan_id(
            id,
            name,
            price_monthly
          )
        )
      `)
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch referrals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      referrals: referrals || []
    });
  } catch (error) {
    console.error('Error in GET /api/affiliates/referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

