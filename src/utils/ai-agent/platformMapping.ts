const getBackendUrl = (): string => {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

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
    const backendUrl = getBackendUrl();
    const params = new URLSearchParams({
      platform,
      platform_account_id: platformAccountId,
    });
    if (platformPhoneNumber) {
      params.append('platform_phone_number', platformPhoneNumber);
    }

    const response = await fetch(`${backendUrl}/api/ai-agent/platform-mapping?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error finding business from platform mapping');
      return null;
    }

    const data = await response.json();
    return data.data?.business_id || data.business_id || null;
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
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/ai-agent/platform-mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_id: businessId,
        platform,
        platform_account_id: platformAccountId,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upsert platform mapping');
    }

    const data = await response.json();
    return data.data || data;
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
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/ai-agent/platform-mapping?business_id=${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error fetching platform mappings');
      return [];
    }

    const data = await response.json();
    return (data.data || data.mappings || []) as PlatformMapping[];
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
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/ai-agent/platform-mapping/${mappingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error in deletePlatformMapping:', error);
    return false;
  }
}
