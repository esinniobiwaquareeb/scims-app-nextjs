"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CashierDetail } from '@/components/CashierDetail';
import { supabase } from '@/lib/supabase/config';
import { toast } from 'sonner';

interface Cashier {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  store_id?: string;
  store?: {
    id: string;
    name: string;
    address: string;
  };
  created_at: string;
  last_login?: string;
  totalSales?: number;
  transactionCount?: number;
}

export default function CashierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cashier, setCashier] = useState<Cashier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCashier = async () => {
      if (!params.id) return;

      try {
        // Get cashier data with store information
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select(`
            *,
            store:store_id(id, name, address)
          `)
          .eq('id', params.id)
          .single();

        if (userError) throw userError;

        // Get sales data for the cashier
        const { data: salesData, error: salesError } = await supabase
          .from('sale')
          .select('total_amount')
          .eq('cashier_id', params.id);

        if (salesError) {
          console.error('Error fetching sales:', salesError);
        }

        const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0) || 0;
        const transactionCount = salesData?.length || 0;

        setCashier({
          ...userData,
          totalSales,
          transactionCount
        });
      } catch (error) {
        console.error('Error fetching cashier:', error);
        toast.error('Failed to fetch cashier details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashier();
  }, [params.id]);

  const handleBack = () => {
    router.push('/cashiers');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cashier details...</p>
        </div>
      </div>
    );
  }

  if (!cashier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cashier Not Found</h1>
          <p className="text-gray-600 mb-4">The cashier you&apos;re looking for doesn&apos;t exist.</p>
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
      <CashierDetail onBack={handleBack} cashier={cashier} />
    </div>
  );
}
