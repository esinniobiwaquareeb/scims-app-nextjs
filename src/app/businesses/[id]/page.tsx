"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessDetail } from '@/components/BusinessDetail';
import { DashboardLayout } from '@/components/common/DashboardLayout';
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
        const res = await fetch(`/api/businesses/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch business');
        }
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to fetch business');
        }
        setBusiness(json.business);
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading business details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-4">The business you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BusinessDetail onBack={handleBack} business={business} />
    </DashboardLayout>
  );
}
