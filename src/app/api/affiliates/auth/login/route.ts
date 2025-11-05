import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Affiliate login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find affiliate by email
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if affiliate has password set
    if (!affiliate.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Account not activated. Please wait for approval.' },
        { status: 401 }
      );
    }

    // Check if affiliate is approved and active
    if (affiliate.application_status !== 'approved' || affiliate.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Your affiliate account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, affiliate.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from('affiliate')
      .update({ last_login: new Date().toISOString() })
      .eq('id', affiliate.id);

    // Return affiliate data (without password hash)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...affiliateData } = affiliate;

    return NextResponse.json({
      success: true,
      affiliate: affiliateData
    });
  } catch (error) {
    console.error('Error in affiliate login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

