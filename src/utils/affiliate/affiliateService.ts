/* eslint-disable @typescript-eslint/no-explicit-any */

const getBackendUrl = (): string => {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

export interface AffiliateCommissionData {
  businessId: string;
  subscriptionPlanId?: string;
  amount: number; // Subscription payment amount or signup value
  commissionType: 'signup' | 'subscription';
  referralId: string;
  currencyId?: string; // Currency ID for the commission (Issue #8)
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
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/affiliates/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        affiliate_code: affiliateCode.toUpperCase(),
        user_email: userEmail,
        user_phone: userPhone,
        referral_source: referralSource,
      }),
    });

    if (!response.ok) {
      console.log('Invalid or inactive affiliate code');
      return null;
    }

    const data = await response.json();
    return data.data?.referral_id || data.referral_id || null;
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
    const backendUrl = getBackendUrl();
    await fetch(`${backendUrl}/api/affiliates/referrals/${referralId}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_id: businessId,
      }),
    });
  } catch (error) {
    console.error('Error in markReferralAsConverted:', error);
  }
}

/**
 * Calculate and create affiliate commission (for signup or subscription)
 */
export async function createAffiliateCommission(data: AffiliateCommissionData): Promise<void> {
  try {
    const backendUrl = getBackendUrl();
    await fetch(`${backendUrl}/api/affiliates/commissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_id: data.businessId,
        subscription_plan_id: data.subscriptionPlanId,
        amount: data.amount,
        commission_type: data.commissionType,
        referral_id: data.referralId,
        currency_id: data.currencyId,
      }),
    });
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
