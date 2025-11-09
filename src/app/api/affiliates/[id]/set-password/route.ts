/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Set or reset affiliate password (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get current affiliate
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, name, email')
      .eq('id', id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update affiliate password
    const { data: updatedAffiliate, error: updateError } = await supabase
      .from('affiliate')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update affiliate password:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to set password. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been set successfully.',
      affiliate: updatedAffiliate
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/[id]/set-password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

