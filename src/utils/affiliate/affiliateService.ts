/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase/config';

export interface AffiliateCommissionData {
  businessId: string;
  subscriptionPlanId?: string;
  amount: number; // Subscription payment amount or signup value
  commissionType: 'signup' | 'subscription';
  referralId: string;
}

/**
 * Track business referral when affiliate code is used during signup
 */
export async function trackBusinessReferral(
  affiliateCode: string,
  userEmail: string,
  userPhone?: string,
  referralSource: string = 'link'
): Promise<string | null> {
  try {
    // Find active affiliate by code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate')
      .select('id, status')
      .eq('affiliate_code', affiliateCode.toUpperCase())
      .eq('status', 'active')
      .single();

    if (affiliateError || !affiliate) {
      console.log('Invalid or inactive affiliate code');
      return null;
    }

    // Check if referral already exists for this email (if email provided and not placeholder)
    if (userEmail && userEmail !== 'pending@example.com') {
      const { data: existingReferral } = await supabase
        .from('affiliate_referral')
        .select('id, status')
        .eq('affiliate_id', affiliate.id)
        .eq('user_email', userEmail.toLowerCase())
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingReferral && existingReferral.status === 'pending') {
        return existingReferral.id;
      }
    }

    // Create new referral with 90-day expiration
    const referralExpiresAt = new Date();
    referralExpiresAt.setDate(referralExpiresAt.getDate() + 90);

    const { data: referral, error: referralError } = await supabase
      .from('affiliate_referral')
      .insert({
        affiliate_id: affiliate.id,
        user_email: userEmail && userEmail !== 'pending@example.com' ? userEmail.toLowerCase() : null,
        user_phone: userPhone || null,
        referral_code: affiliateCode.toUpperCase(),
        referral_source: referralSource,
        status: 'pending',
        expires_at: referralExpiresAt.toISOString()
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating referral:', referralError);
      return null;
    }

    // Update affiliate referral count
    const { data: currentAffiliate } = await supabase
      .from('affiliate')
      .select('total_referrals')
      .eq('id', affiliate.id)
      .single();

    if (currentAffiliate) {
      await supabase
        .from('affiliate')
        .update({
          total_referrals: (currentAffiliate.total_referrals || 0) + 1
        })
        .eq('id', affiliate.id);
    }

    return referral.id;
  } catch (error) {
    console.error('Error in trackBusinessReferral:', error);
    return null;
  }
}

/**
 * Mark referral as converted when business completes signup
 */
export async function markReferralAsConverted(
  referralId: string,
  businessId: string
): Promise<void> {
  try {
    await supabase
      .from('affiliate_referral')
      .update({
        status: 'converted',
        business_id: businessId,
        converted_at: new Date().toISOString()
      })
      .eq('id', referralId);

    // Update affiliate business count
    const { data: referral } = await supabase
      .from('affiliate_referral')
      .select('affiliate_id')
      .eq('id', referralId)
      .single();

    if (referral) {
      const { data: currentAffiliate } = await supabase
        .from('affiliate')
        .select('total_businesses')
        .eq('id', referral.affiliate_id)
        .single();

      if (currentAffiliate) {
        await supabase
          .from('affiliate')
          .update({
            total_businesses: (currentAffiliate.total_businesses || 0) + 1
          })
          .eq('id', referral.affiliate_id);
      }
    }
  } catch (error) {
    console.error('Error in markReferralAsConverted:', error);
  }
}

/**
 * Calculate and create affiliate commission (for signup or subscription)
 */
export async function createAffiliateCommission(data: AffiliateCommissionData): Promise<void> {
  try {
    const { businessId, subscriptionPlanId, amount, commissionType, referralId } = data;

    if (!referralId) {
      console.log('No referral ID provided for commission');
      return;
    }

    // Get referral details
    const { data: referral, error: referralError } = await supabase
      .from('affiliate_referral')
      .select('affiliate_id, status, affiliate:affiliate_id(*)')
      .eq('id', referralId)
      .single();

    if (referralError || !referral) {
      console.log('Referral not found');
      return;
    }

    if (referral.status !== 'converted') {
      console.log('Referral not converted yet');
      return;
    }

    const affiliate = referral.affiliate as any;
    if (affiliate.status !== 'active') {
      console.log('Affiliate is not active');
      return;
    }

    // Calculate commission based on type
    let commissionAmount = 0;
    let commissionRate: number | null = null;
    let commissionSubType = 'percentage';

    if (commissionType === 'signup') {
      // Signup commission
      if (affiliate.signup_commission_type === 'fixed') {
        commissionAmount = parseFloat(affiliate.signup_commission_fixed || '0');
        commissionSubType = 'fixed';
      } else {
        // Percentage commission
        commissionRate = parseFloat(affiliate.signup_commission_rate || '0');
        commissionAmount = amount * (commissionRate / 100);
        commissionSubType = 'percentage';
      }
    } else {
      // Subscription commission (always percentage)
      commissionRate = parseFloat(affiliate.subscription_commission_rate || '0');
      commissionAmount = amount * (commissionRate / 100);
      commissionSubType = 'percentage';
    }

    if (commissionAmount <= 0) {
      console.log('Commission amount is zero or negative');
      return;
    }

    // Check if commission already exists for this business and commission type
    const { data: existingCommission } = await supabase
      .from('affiliate_commission')
      .select('id')
      .eq('affiliate_id', affiliate.id)
      .eq('business_id', businessId)
      .eq('commission_type', commissionType)
      .eq('status', 'pending')
      .single();

    if (existingCommission) {
      console.log('Commission already exists for this business and type');
      return;
    }

    // Create commission
    const { error: commissionError } = await supabase
      .from('affiliate_commission')
      .insert({
        affiliate_id: affiliate.id,
        referral_id: referralId,
        business_id: businessId,
        subscription_plan_id: subscriptionPlanId || null,
        amount: amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        commission_type: commissionType,
        commission_sub_type: commissionSubType,
        status: 'pending'
      });

    if (commissionError) {
      console.error('Error creating affiliate commission:', commissionError);
      return;
    }

    // Update referral subscription started date (first subscription payment)
    if (commissionType === 'subscription') {
      const { data: referralData } = await supabase
        .from('affiliate_referral')
        .select('subscription_started_at')
        .eq('id', referralId)
        .single();

      if (!referralData?.subscription_started_at) {
        await supabase
          .from('affiliate_referral')
          .update({
            subscription_started_at: new Date().toISOString()
          })
          .eq('id', referralId);
      }
    }

    // Update affiliate totals
    const { data: currentAffiliate } = await supabase
      .from('affiliate')
      .select('total_subscriptions, total_commission_earned, total_commission_pending')
      .eq('id', affiliate.id)
      .single();

    if (currentAffiliate) {
      const updates: any = {
        total_commission_earned: parseFloat(currentAffiliate.total_commission_earned || '0') + commissionAmount,
        total_commission_pending: parseFloat(currentAffiliate.total_commission_pending || '0') + commissionAmount
      };

      if (commissionType === 'subscription') {
        updates.total_subscriptions = parseFloat(currentAffiliate.total_subscriptions || '0') + amount;
      }

      await supabase
        .from('affiliate')
        .update(updates)
        .eq('id', affiliate.id);
    }

    console.log(`Affiliate commission created: ${commissionAmount} (${commissionType}) for affiliate ${affiliate.id}`);
  } catch (error) {
    console.error('Error in createAffiliateCommission:', error);
    // Don't throw - we don't want to break business operations if commission fails
  }
}

/**
 * Get affiliate link for business registration
 */
export function getAffiliateLink(baseUrl: string, affiliateCode: string): string {
  return `${baseUrl}/auth/register?ref=${affiliateCode}`;
}
