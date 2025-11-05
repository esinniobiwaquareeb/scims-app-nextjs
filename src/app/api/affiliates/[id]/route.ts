/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch single affiliate with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: affiliate, error } = await supabase
      .from('affiliate')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Get referral stats (business signups)
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referral')
      .select('id, status, converted_at, business_id')
      .eq('affiliate_id', id);

    if (!referralsError) {
      affiliate.referral_stats = {
        total: referrals?.length || 0,
        pending: referrals?.filter((r: any) => r.status === 'pending').length || 0,
        converted: referrals?.filter((r: any) => r.status === 'converted').length || 0,
        expired: referrals?.filter((r: any) => r.status === 'expired').length || 0,
        businesses: referrals?.filter((r: any) => r.business_id).length || 0
      };
    }

        // Get commission stats (subscription payments)
        const { data: commissions, error: commissionsError } = await supabase
          .from('affiliate_commission')
          .select('id, commission_amount, amount, commission_type, status')
          .eq('affiliate_id', id);

        if (!commissionsError && commissions) {
          affiliate.commission_stats = {
            total_earned: commissions.reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0),
            signup_commissions: commissions.filter((c: any) => c.commission_type === 'signup').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0),
            subscription_commissions: commissions.filter((c: any) => c.commission_type === 'subscription').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0),
            total_subscriptions: commissions.filter((c: any) => c.commission_type === 'subscription').reduce((sum: number, c: any) => sum + parseFloat(c.amount || 0), 0),
            pending: commissions.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0),
            paid: commissions.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + parseFloat(c.commission_amount || 0), 0)
          };
        }

    return NextResponse.json({
      success: true,
      affiliate
    });
  } catch (error) {
    console.error('Error in GET /api/affiliates/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update affiliate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      email,
      phone,
      commission_rate,
      commission_type,
      fixed_commission_amount,
      status,
      payment_method,
      payment_details,
      notes
    } = body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (commission_rate !== undefined) updateData.commission_rate = commission_rate;
    if (commission_type !== undefined) updateData.commission_type = commission_type;
    if (fixed_commission_amount !== undefined) updateData.fixed_commission_amount = fixed_commission_amount || null;
    if (status !== undefined) updateData.status = status;
    if (payment_method !== undefined) updateData.payment_method = payment_method || null;
    if (payment_details !== undefined) updateData.payment_details = payment_details || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const { data: affiliate, error } = await supabase
      .from('affiliate')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating affiliate:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update affiliate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate
    });
  } catch (error) {
    console.error('Error in PUT /api/affiliates/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete affiliate and all associated data (hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, verify the affiliate exists
    const { data: affiliate, error: fetchError } = await supabase
      .from('affiliate')
      .select('id, name, email')
      .eq('id', id)
      .single();

    if (fetchError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Delete affiliate (cascade will handle related records)
    // The database schema has ON DELETE CASCADE for:
    // - affiliate_referral (affiliate_id)
    // - affiliate_commission (affiliate_id)
    // - affiliate_payout (affiliate_id)
    const { error: deleteError } = await supabase
      .from('affiliate')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting affiliate:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete affiliate and associated data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Affiliate "${affiliate.name}" and all associated data have been permanently deleted`
    });
  } catch (error) {
    console.error('Error in DELETE /api/affiliates/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

