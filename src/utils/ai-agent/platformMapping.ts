import { supabase } from '@/lib/supabase/config';

export interface PlatformMapping {
  id: string;
  business_id: string;
  platform: 'whatsapp' | 'instagram' | 'tiktok' | 'facebook';
  platform_account_id: string;
  platform_phone_number?: string;
  platform_username?: string;
  platform_app_id?: string;
  platform_secret?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Get business ID from platform-specific account ID
 * This is crucial for SaaS multi-tenant architecture
 */
export async function getBusinessIdFromPlatform(
  platform: string,
  platformAccountId: string,
  platformPhoneNumber?: string
): Promise<string | null> {
  try {
    let result;

    // For WhatsApp, also check phone number
    if (platform === 'whatsapp' && platformPhoneNumber) {
      const { data, error } = await supabase
        .from('ai_agent_platform_mapping')
        .select('business_id')
        .eq('platform', platform)
        .or(`platform_account_id.eq.${platformAccountId},platform_phone_number.eq.${platformPhoneNumber}`)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        console.error('Error finding business from platform mapping:', error);
        return null;
      }

      result = data;
    } else {
      const { data, error } = await supabase
        .from('ai_agent_platform_mapping')
        .select('business_id')
        .eq('platform', platform)
        .eq('platform_account_id', platformAccountId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Error finding business from platform mapping:', error);
        return null;
      }

      result = data;
    }

    return result?.business_id || null;
  } catch (error) {
    console.error('Error in getBusinessIdFromPlatform:', error);
    return null;
  }
}

/**
 * Create or update platform mapping for a business
 */
export async function upsertPlatformMapping(
  businessId: string,
  platform: 'whatsapp' | 'instagram' | 'tiktok' | 'facebook',
  platformAccountId: string,
  options: {
    platform_phone_number?: string;
    platform_username?: string;
    platform_app_id?: string;
    platform_secret?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<PlatformMapping | null> {
  try {
    // Check if mapping already exists
    const { data: existing } = await supabase
      .from('ai_agent_platform_mapping')
      .select('*')
      .eq('business_id', businessId)
      .eq('platform', platform)
      .single();

    const mappingData = {
      business_id: businessId,
      platform,
      platform_account_id: platformAccountId,
      platform_phone_number: options.platform_phone_number || null,
      platform_username: options.platform_username || null,
      platform_app_id: options.platform_app_id || null,
      platform_secret: options.platform_secret || null,
      metadata: options.metadata || {},
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      // Update existing mapping
      const { data, error } = await supabase
        .from('ai_agent_platform_mapping')
        .update(mappingData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new mapping
      const { data, error } = await supabase
        .from('ai_agent_platform_mapping')
        .insert(mappingData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result as PlatformMapping;
  } catch (error) {
    console.error('Error in upsertPlatformMapping:', error);
    return null;
  }
}

/**
 * Get all platform mappings for a business
 */
export async function getBusinessPlatformMappings(
  businessId: string
): Promise<PlatformMapping[]> {
  try {
    const { data, error } = await supabase
      .from('ai_agent_platform_mapping')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('platform', { ascending: true });

    if (error) {
      console.error('Error fetching platform mappings:', error);
      return [];
    }

    return (data || []) as PlatformMapping[];
  } catch (error) {
    console.error('Error in getBusinessPlatformMappings:', error);
    return [];
  }
}

/**
 * Delete platform mapping
 */
export async function deletePlatformMapping(mappingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_agent_platform_mapping')
      .delete()
      .eq('id', mappingId);

    if (error) {
      console.error('Error deleting platform mapping:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePlatformMapping:', error);
    return false;
  }
}

