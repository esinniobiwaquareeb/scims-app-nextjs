"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessDetail } from '@/components/BusinessDetail';
import { supabase } from '@/lib/supabase/config';
import { toast } from 'sonner';

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  business_type?: string;
  country_id?: string;
  currency_id?: string;
  language_id?: string;
  timezone: string;
  subscription_plan_id?: string;
  subscription_status: string;
  is_active: boolean;
  country?: {
    id: string;
    name: string;
    code: string;
  };
  currency?: {
    id: string;
    name: string;
    symbol: string;
  };
  language?: {
    id: string;
    name: string;
    code: string;
  };
  subscription_plans?: {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    max_stores: number;
    max_products: number;
    max_users: number;
  };
  stores: Array<{
    id: string;
    name: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    manager_name?: string;
    is_active: boolean;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!params.id) return;

      try {
        const { data, error } = await supabase
          .from('business')
          .select(`
            *,
            country:country_id(id, name, code),
            currency:currency_id(id, name, symbol),
            language:language_id(id, name, code),
            subscription_plans:subscription_plan_id(id, name, description, price_monthly, price_yearly, max_stores, max_products, max_users),
            stores(id, name, address, city, state, postal_code, phone, email, manager_name, is_active, created_at)
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setBusiness(data);
      } catch (error) {
        console.error('Error fetching business:', error);
        toast.error('Failed to fetch business details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [params.id]);

  const handleBack = () => {
    router.push('/business');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600 mb-4">The business you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessDetail onBack={handleBack} business={business} />
    </div>
  );
}
