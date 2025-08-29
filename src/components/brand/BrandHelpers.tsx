// TODO: Replace with API calls when endpoints are implemented
// import { directDB } from '../../utils/supabase/direct-client';

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandFormData {
  name: string;
  description: string;
  logo_url: string;
  website: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
}

export const brandApi = {
  async fetchBrands(businessId: string): Promise<Brand[]> {
    try {
      const response = await fetch(`/api/brands?business_id=${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      return data.brands || [];
    } catch (error) {
      throw new Error('Failed to fetch brands');
    }
  },

  async createBrand(businessId: string, formData: BrandFormData): Promise<Brand> {
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          ...formData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create brand');
      }
      
      const data = await response.json();
      return data.brand || data;
    } catch (error) {
      throw new Error('Failed to create brand');
    }
  },

  async updateBrand(businessId: string, brandId: string, formData: BrandFormData): Promise<Brand> {
    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          ...formData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update brand');
      }
      
      const data = await response.json();
      return data.brand || data;
    } catch (error) {
      throw new Error('Failed to update brand');
    }
  },

  async deleteBrand(businessId: string, brandId: string): Promise<void> {
    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_id: businessId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete brand');
      }
    } catch (error) {
      throw new Error('Failed to delete brand');
    }
  }
};

export const validateBrandForm = (formData: BrandFormData): string | null => {
  if (!formData.name.trim()) {
    return 'Brand name is required';
  }
  
  if (formData.website && !isValidUrl(formData.website)) {
    return 'Please enter a valid website URL';
  }
  
  if (formData.contact_email && !isValidEmail(formData.contact_email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};