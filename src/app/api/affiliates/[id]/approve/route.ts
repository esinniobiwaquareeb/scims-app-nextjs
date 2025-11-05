/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';
import { EmailService } from '@/lib/email/emailService';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Approve affiliate application and optionally set password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      signup_commission_type,
      signup_commission_rate,
      signup_commission_fixed,
      subscription_commission_rate,
      set_password,
      password,
      reviewed_by 
    } = body;

    // Get current affiliate
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('*')
      .eq('id', id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      application_status: 'approved',
      status: 'active',
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (reviewed_by) {
      updateData.reviewed_by = reviewed_by;
    }

    // Set signup commission
    if (signup_commission_type !== undefined) {
      updateData.signup_commission_type = signup_commission_type;
    }
    if (signup_commission_rate !== undefined) {
      updateData.signup_commission_rate = signup_commission_rate;
    }
    if (signup_commission_fixed !== undefined) {
      updateData.signup_commission_fixed = signup_commission_fixed;
    }

    // Set subscription commission
    if (subscription_commission_rate !== undefined) {
      updateData.subscription_commission_rate = subscription_commission_rate;
    }

    // Legacy fields for backward compatibility
    if (subscription_commission_rate !== undefined) {
      updateData.commission_rate = subscription_commission_rate;
      updateData.commission_type = 'percentage';
    }

    // Set password if provided, otherwise generate a random one
    if (set_password && password) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      const passwordHash = await bcrypt.hash(password, 12);
      updateData.password_hash = passwordHash;
    } else {
      // Auto-generate a secure password if not provided
      const crypto = await import('crypto');
      const generatedPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);
      const passwordHash = await bcrypt.hash(generatedPassword, 12);
      updateData.password_hash = passwordHash;
      // Store the plain password temporarily to include in email
      (updateData as any).__generated_password = generatedPassword;
    }

    // Update affiliate
    const { data: updatedAffiliate, error: updateError } = await supabase
      .from('affiliate')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving affiliate:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to approve affiliate' },
        { status: 500 }
      );
    }

    // Send approval email to affiliate
    const platformUrl = env.NEXT_PUBLIC_BASE_URL;
    const loginUrl = `${platformUrl}/affiliate/login`;
    
    // Get the password that was set (either provided or auto-generated)
    const passwordToSend = set_password && password 
      ? password 
      : (updateData as any).__generated_password || undefined;
    
    const emailResult = await EmailService.sendAffiliateApprovalEmail({
      to: updatedAffiliate.email,
      name: updatedAffiliate.name,
      affiliateCode: updatedAffiliate.affiliate_code,
      loginUrl: loginUrl,
      password: passwordToSend,
      signupCommissionType: updatedAffiliate.signup_commission_type || signup_commission_type,
      signupCommissionRate: updatedAffiliate.signup_commission_rate || signup_commission_rate,
      signupCommissionFixed: updatedAffiliate.signup_commission_fixed || signup_commission_fixed,
      subscriptionCommissionRate: updatedAffiliate.subscription_commission_rate || subscription_commission_rate,
      platformUrl: platformUrl
    });

    if (!emailResult.success) {
      console.error('Failed to send approval email:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      affiliate: updatedAffiliate,
      message: 'Affiliate approved successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/[id]/approve:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Reject affiliate application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rejection_reason, reviewed_by } = body;

    const updateData: any = {
      application_status: 'rejected',
      status: 'inactive',
      rejection_reason: rejection_reason || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (reviewed_by) {
      updateData.reviewed_by = reviewed_by;
    }

    const { data: updatedAffiliate, error: updateError } = await supabase
      .from('affiliate')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting affiliate:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to reject affiliate' },
        { status: 500 }
      );
    }

    // Send rejection email to affiliate
    const platformUrl = env.NEXT_PUBLIC_BASE_URL;
    
    const emailResult = await EmailService.sendAffiliateRejectionEmail({
      to: updatedAffiliate.email,
      name: updatedAffiliate.name,
      rejectionReason: updatedAffiliate.rejection_reason || rejection_reason,
      platformUrl: platformUrl
    });

    if (!emailResult.success) {
      console.error('Failed to send rejection email:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      affiliate: updatedAffiliate,
      message: 'Affiliate application rejected'
    });
  } catch (error) {
    console.error('Error in PUT /api/affiliates/[id]/approve:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

