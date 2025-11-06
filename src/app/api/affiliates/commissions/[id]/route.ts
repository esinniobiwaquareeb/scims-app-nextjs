import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// PUT - Update commission currency (Issue #8)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currency_id } = body;

    if (currency_id === undefined) {
      return NextResponse.json(
        { success: false, error: 'Currency ID is required' },
        { status: 400 }
      );
    }

    // Verify commission exists
    const { data: commission, error: fetchError } = await supabase
      .from('affiliate_commission')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !commission) {
      return NextResponse.json(
        { success: false, error: 'Commission not found' },
        { status: 404 }
      );
    }

    // Only allow updating currency for pending or approved commissions
    if (commission.status !== 'pending' && commission.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Cannot update currency for paid or cancelled commissions' },
        { status: 400 }
      );
    }

    // Verify currency exists if provided
    if (currency_id) {
      const { data: currency, error: currencyError } = await supabase
        .from('currency')
        .select('id')
        .eq('id', currency_id)
        .single();

      if (currencyError || !currency) {
        return NextResponse.json(
          { success: false, error: 'Invalid currency' },
          { status: 400 }
        );
      }
    }

    // Update commission currency
    const { data: updatedCommission, error: updateError } = await supabase
      .from('affiliate_commission')
      .update({
        currency_id: currency_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        currency:currency_id(
          id,
          code,
          name,
          symbol
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating commission currency:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update commission currency' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commission: updatedCommission,
      message: 'Commission currency updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/affiliates/commissions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

