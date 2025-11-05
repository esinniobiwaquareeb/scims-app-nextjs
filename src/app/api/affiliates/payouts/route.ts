/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch payouts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliate_id');
    const status = searchParams.get('status');

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('affiliate_payout')
      .select(`
        *,
        affiliate:affiliate_id(
          id,
          name,
          affiliate_code
        ),
        processed_by_user:processed_by(
          id,
          name,
          username
        )
      `)
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: payouts, error } = await query;

    if (error) {
      console.error('Error fetching payouts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payouts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payouts: payouts || []
    });
  } catch (error) {
    console.error('Error in GET /api/affiliates/payouts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create payout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      affiliate_id,
      commission_ids, // Array of commission IDs to include in payout
      payment_method,
      payment_details,
      notes,
      processed_by
    } = body;

    if (!affiliate_id || !commission_ids || !Array.isArray(commission_ids) || commission_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID and commission IDs are required' },
        { status: 400 }
      );
    }

    // Get commissions to be paid
    const { data: commissions, error: commissionsError } = await supabase
      .from('affiliate_commission')
      .select('*')
      .eq('affiliate_id', affiliate_id)
      .eq('status', 'approved')
      .in('id', commission_ids);

    if (commissionsError || !commissions || commissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid approved commissions found for payout' },
        { status: 400 }
      );
    }

    // Calculate total payout amount
    const totalAmount = commissions.reduce((sum: number, c: any) => 
      sum + parseFloat(c.commission_amount || 0), 0
    );

    // Generate payout number
    const currentYear = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const payoutNumber = `PAY-${timestamp}-${currentYear}`;

    // Create payout
    const { data: payout, error: payoutError } = await supabase
      .from('affiliate_payout')
      .insert({
        affiliate_id,
        payout_number: payoutNumber,
        total_amount: totalAmount,
        commission_count: commissions.length,
        payment_method: payment_method || 'bank_transfer',
        payment_details: payment_details || {},
        status: 'pending',
        processed_by: processed_by || null,
        notes: notes || null
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Error creating payout:', payoutError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payout' },
        { status: 500 }
      );
    }

    // Update commissions to link them to this payout
    const { error: updateError } = await supabase
      .from('affiliate_commission')
      .update({ payout_id: payout.id, status: 'paid', paid_at: new Date().toISOString() })
      .in('id', commission_ids);

    if (updateError) {
      console.error('Error updating commissions:', updateError);
      // Rollback payout creation
      await supabase.from('affiliate_payout').delete().eq('id', payout.id);
      return NextResponse.json(
        { success: false, error: 'Failed to update commissions' },
        { status: 500 }
      );
    }

    // Update affiliate totals (using increment approach)
    const { data: currentAffiliate } = await supabase
      .from('affiliate')
      .select('total_commission_paid, total_commission_pending')
      .eq('id', affiliate_id)
      .single();

    if (currentAffiliate) {
      await supabase
        .from('affiliate')
        .update({
          total_commission_paid: parseFloat(currentAffiliate.total_commission_paid || '0') + totalAmount,
          total_commission_pending: parseFloat(currentAffiliate.total_commission_pending || '0') - totalAmount
        })
        .eq('id', affiliate_id);
    }

    return NextResponse.json({
      success: true,
      payout
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/payouts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

