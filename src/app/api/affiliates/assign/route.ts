import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { markReferralAsConverted, createAffiliateCommission } from '@/utils/affiliate/affiliateService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Assign affiliate to existing business (Issue #2)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      affiliate_id,
      business_id,
      create_commission = true
    } = body;

    if (!affiliate_id || !business_id) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID and Business ID are required' },
        { status: 400 }
      );
    }

    // Verify affiliate exists and is active
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, status, application_status, affiliate_code')
      .eq('id', affiliate_id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    if (affiliate.status !== 'active' || affiliate.application_status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Affiliate is not active' },
        { status: 400 }
      );
    }

    // Verify business exists
    const { data: business, error: businessError } = await supabase
      .from('business')
      .select('id, name, email')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Check if referral already exists for this business and affiliate
    const { data: existingReferral } = await supabase
      .from('affiliate_referral')
      .select('id, status')
      .eq('affiliate_id', affiliate_id)
      .eq('business_id', business_id)
      .single();

    let referralId: string;

    if (existingReferral) {
      // Update existing referral if it's pending
      if (existingReferral.status === 'pending') {
        await markReferralAsConverted(existingReferral.id, business_id);
        referralId = existingReferral.id;
      } else {
        return NextResponse.json(
          { success: false, error: 'Affiliate is already assigned to this business' },
          { status: 400 }
        );
      }
    } else {
      // Create new referral and mark as converted
      const { data: newReferral, error: referralError } = await supabase
        .from('affiliate_referral')
        .insert({
          affiliate_id,
          business_id,
          user_email: business.email,
          referral_code: affiliate.affiliate_code,
          referral_source: 'manual',
          status: 'converted',
          converted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (referralError) {
        console.error('Error creating referral:', referralError);
        return NextResponse.json(
          { success: false, error: 'Failed to create referral' },
          { status: 500 }
        );
      }

      referralId = newReferral.id;

      // Update affiliate counts
      const { data: currentAffiliate } = await supabase
        .from('affiliate')
        .select('total_referrals, total_businesses')
        .eq('id', affiliate_id)
        .single();

      if (currentAffiliate) {
        await supabase
          .from('affiliate')
          .update({
            total_referrals: (currentAffiliate.total_referrals || 0) + 1,
            total_businesses: (currentAffiliate.total_businesses || 0) + 1
          })
          .eq('id', affiliate_id);
      }
    }

    // Create signup commission if requested
    if (create_commission) {
      try {
        // Get affiliate to determine commission type
        const { data: affiliateData } = await supabase
          .from('affiliate')
          .select('signup_commission_type, signup_commission_rate')
          .eq('id', affiliate_id)
          .single();

        if (affiliateData) {
          const signupValue = affiliateData.signup_commission_type === 'percentage' 
            ? 100 // Default signup value for percentage calculations
            : 0; // Amount doesn't matter for fixed commissions

          await createAffiliateCommission({
            businessId: business_id,
            amount: signupValue,
            commissionType: 'signup',
            referralId: referralId
          });
        }
      } catch (commissionError) {
        console.error('Error creating commission:', commissionError);
        // Don't fail the assignment if commission creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate assigned to business successfully',
      referral_id: referralId
    });
  } catch (error) {
    console.error('Error in POST /api/affiliates/assign:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

