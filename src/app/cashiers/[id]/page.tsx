"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CashierDetail } from '@/components/CashierDetail';
import { DashboardLayout } from '@/components/common/DashboardLayout';
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

interface Sale {
  id: string;
  total_amount: number;
  created_at: string;
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
        const userResponse = await fetch(`/api/cashiers/${params.id}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch cashier data');
        }
        const userData = await userResponse.json();

        // Get sales data for the cashier
        const salesResponse = await fetch(`/api/sales?cashier_id=${params.id}`);
        let salesData = [];
        if (salesResponse.ok) {
          const salesResult = await salesResponse.json();
          salesData = salesResult.sales || [];
        }

        const totalSales = salesData.reduce((sum: number, sale: Sale) => sum + Number(sale.total_amount || 0), 0);
        const transactionCount = salesData.length;

        setCashier({
          ...userData.cashier,
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading cashier details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!cashier) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Cashier Not Found</h1>
            <p className="text-muted-foreground mb-4">The cashier you&apos;re looking for doesn&apos;t exist.</p>
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
      <CashierDetail onBack={handleBack} cashier={cashier} />
    </DashboardLayout>
  );
}
