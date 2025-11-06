import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get affiliate profile (for logged-in affiliate)
export async function GET(request: NextRequest) {
  try {
    // Get affiliate ID from query params
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliate_id');

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    const { data: affiliate, error } = await supabase
      .from('affiliate')
      .select('id, name, email, phone, payment_method, payment_details, affiliate_code, created_at')
      .eq('id', affiliateId)
      .single();

    if (error || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate
    });
  } catch (error) {
    console.error('Error in GET /api/affiliates/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update affiliate profile (Issue #6 - allow affiliates to edit their profile)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      affiliate_id,
      name,
      phone,
      payment_method,
      payment_details
    } = body;

    if (!affiliate_id) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // Build update object - only allow updating profile fields, not commission settings
    const updateData: {
      name?: string;
      phone?: string | null;
      payment_method?: string | null;
      payment_details?: Record<string, unknown> | null;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (payment_method !== undefined) updateData.payment_method = payment_method || null;
    if (payment_details !== undefined) updateData.payment_details = payment_details || null;

    const { data: affiliate, error } = await supabase
      .from('affiliate')
      .update(updateData)
      .eq('id', affiliate_id)
      .select('id, name, email, phone, payment_method, payment_details, affiliate_code')
      .single();

    if (error) {
      console.error('Error updating affiliate profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/affiliates/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

