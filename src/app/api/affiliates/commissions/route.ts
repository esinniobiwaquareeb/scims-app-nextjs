import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch commissions for an affiliate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliate_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('affiliate_commission')
      .select(`
        *,
        affiliate:affiliate_id(
          id,
          name,
          affiliate_code
        ),
        referral:referral_id(
          id,
          user_email,
          business_id,
          converted_at
        ),
        business:business_id(
          id,
          name,
          email,
          subscription_status,
          subscription_plan_id,
          subscription_plans:subscription_plan_id(
            id,
            name,
            price_monthly,
            price_yearly
          )
        ),
        currency:currency_id(
          id,
          code,
          name,
          symbol
        )
      `)
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: commissions, error } = await query;

    if (error) {
      console.error('Error fetching commissions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch commissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commissions: commissions || []
    });
  } catch (error) {
    console.error('Error in GET /api/affiliates/commissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

