import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Generate unique affiliate code
function generateAffiliateCode(name: string): string {
  // Take first 3 letters of name, uppercase, add random 4-digit number
  const namePart = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'A');
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `${namePart}${randomPart}`;
}

// GET - Fetch all affiliates (for SaaS platform admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('affiliate')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const applicationStatus = searchParams.get('application_status');
    if (applicationStatus && applicationStatus !== 'all') {
      query = query.eq('application_status', applicationStatus);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,affiliate_code.ilike.%${search}%`);
    }

    const { data: affiliates, error } = await query;

    if (error) {
      console.error('Error fetching affiliates:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch affiliates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliates: affiliates || []
    });
  } catch (error) {
    console.error('Error in GET /api/affiliates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new affiliate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      commission_rate,
      commission_type,
      fixed_commission_amount,
      payment_method,
      payment_details,
      notes
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate unique affiliate code
    let affiliateCode = generateAffiliateCode(name);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('affiliate')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .single();

      if (!existing) {
        break; // Code is unique
      }

      affiliateCode = generateAffiliateCode(name + Math.random().toString(36).substring(7));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate unique affiliate code. Please try again.' },
        { status: 500 }
      );
    }

    // Create affiliate
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .insert({
        affiliate_code: affiliateCode,
        name,
        email: email || null,
        phone: phone || null,
        commission_rate: commission_rate || 10.00,
        commission_type: commission_type || 'percentage',
        fixed_commission_amount: fixed_commission_amount || null,
        payment_method: payment_method || null,
        payment_details: payment_details || null,
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single();

    if (affiliateError) {
      console.error('Error creating affiliate:', affiliateError);
      return NextResponse.json(
        { success: false, error: 'Failed to create affiliate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

