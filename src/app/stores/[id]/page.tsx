"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StoreDetails } from '@/components/StoreDetails';
import { supabase } from '@/lib/supabase/config';
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
        const { data, error } = await supabase
          .from('store')
          .select(`
            *,
            business:business_id(id, name),
            language:language_id(id, name, code),
            currency:currency_id(id, name, symbol)
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setStore(data);
      } catch (error) {
        console.error('Error fetching store:', error);
        toast.error('Failed to fetch store details');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-4">The store you&apos;re looking for doesn&apos;t exist.</p>
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
      <StoreDetails onBack={handleBack} store={store} />
    </div>
  );
}
