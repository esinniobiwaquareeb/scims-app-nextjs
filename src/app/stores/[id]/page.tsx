"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StoreDetails } from '@/components/StoreDetails';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { toast } from 'sonner';

interface Store {
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
  business_id: string;
  business?: {
    id: string;
    name: string;
  };
  language_id?: string;
  currency_id?: string;
  language?: {
    id: string;
    name: string;
    code: string;
  };
  currency?: {
    id: string;
    name: string;
    symbol: string;
  };
  created_at: string;
  updated_at: string;
}

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/stores/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Store not found');
          }
          throw new Error('Failed to fetch store details');
        }
        
        const data = await response.json();
        if (data.success && data.store) {
          setStore(data.store);
        } else {
          throw new Error('Invalid store data received');
        }
      } catch (error) {
        console.error('Error fetching store:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch store details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [params.id]);

  const handleBack = () => {
    router.push('/stores');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading store details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
            <p className="text-muted-foreground mb-4">The store you&apos;re looking for doesn&apos;t exist.</p>
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
      <StoreDetails onBack={handleBack} store={store} />
    </DashboardLayout>
  );
}
