import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Change affiliate password (when logged in)
export async function POST(request: NextRequest) {
  try {
    const { affiliate_id, current_password, new_password } = await request.json();

    if (!affiliate_id || !current_password || !new_password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get affiliate with password hash
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, password_hash, status, application_status')
      .eq('id', affiliate_id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Check if affiliate is approved and active
    if (affiliate.application_status !== 'approved' || affiliate.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Your affiliate account is not active. Please contact support.' },
        { status: 400 }
      );
    }

    // Check if affiliate has a password set
    if (!affiliate.password_hash) {
      return NextResponse.json(
        { success: false, error: 'No password set for your account. Please contact support.' },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, affiliate.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(new_password, 12);

    // Update affiliate password
    const { error: updateError } = await supabase
      .from('affiliate')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', affiliate.id);

    if (updateError) {
      console.error('Failed to update affiliate password:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to change password. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been changed successfully.'
    });

  } catch (error) {
    console.error('Error in POST /api/affiliates/auth/change-password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

