/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get detailed stats for an affiliate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get affiliate
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, affiliate_code, name, commission_rate, commission_type')
      .eq('id', id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Build date filter
    let referralsQuery = supabase
      .from('affiliate_referral')
      .select('*')
      .eq('affiliate_id', id);

    let commissionsQuery = supabase
      .from('affiliate_commission')
      .select('*')
      .eq('affiliate_id', id);

    if (startDate) {
      referralsQuery = referralsQuery.gte('created_at', startDate);
      commissionsQuery = commissionsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      referralsQuery = referralsQuery.lte('created_at', endDate);
      commissionsQuery = commissionsQuery.lte('created_at', endDate);
    }

    const { data: referrals } = await referralsQuery;
    const { data: commissions } = await commissionsQuery;

    // Calculate stats
    const stats = {
      referrals: {
        total: referrals?.length || 0,
        pending: referrals?.filter((r: any) => r.status === 'pending').length || 0,
        converted: referrals?.filter((r: any) => r.status === 'converted').length || 0,
        expired: referrals?.filter((r: any) => r.status === 'expired').length || 0,
        businesses: referrals?.filter((r: any) => r.business_id).length || 0,
        conversion_rate: referrals?.length > 0 
          ? ((referrals.filter((r: any) => r.status === 'converted').length / referrals.length) * 100).toFixed(2)
          : '0.00'
      },
      commissions: {
        total_earned: commissions?.reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
        signup_commissions: commissions?.filter((c: any) => c.commission_type === 'signup').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
        subscription_commissions: commissions?.filter((c: any) => c.commission_type === 'subscription').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
        total_subscriptions: commissions?.filter((c: any) => c.commission_type === 'subscription').reduce((sum: number, c: any) => sum + parseFloat(c.amount || 0), 0) || 0,
        pending: commissions?.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
        approved: commissions?.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
        paid: commissions?.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
        cancelled: commissions?.filter((c: any) => c.status === 'cancelled').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0) || 0
      },
      subscriptions: {
        total_revenue: commissions?.filter((c: any) => c.commission_type === 'subscription').reduce((sum: number, c: any) => sum + parseFloat(c.amount || 0), 0) || 0,
        total_payments: commissions?.filter((c: any) => c.commission_type === 'subscription').length || 0,
        average_subscription_value: commissions?.filter((c: any) => c.commission_type === 'subscription').length > 0
          ? (commissions.filter((c: any) => c.commission_type === 'subscription').reduce((sum: number, c: any) => sum + parseFloat(c.amount || 0), 0) / commissions.filter((c: any) => c.commission_type === 'subscription').length).toFixed(2)
          : '0.00'
      }
    };

    return NextResponse.json({
      success: true,
      stats,
      referrals: referrals || [],
      commissions: commissions || []
    });
  } catch (error) {
    console.error('Error in GET /api/affiliates/[id]/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

