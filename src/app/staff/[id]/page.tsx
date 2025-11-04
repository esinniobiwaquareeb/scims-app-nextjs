"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StaffDetail } from '@/components/StaffDetail';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { toast } from 'sonner';

interface Staff {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: 'business_admin' | 'store_admin' | 'cashier';
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

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!params.id) return;

      try {
        // Get staff data with store information
        const staffResponse = await fetch(`/api/staff/${params.id}`);
        if (!staffResponse.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const staffResult = await staffResponse.json();
        const userData = staffResult.success ? staffResult.staff : null;
        
        if (!userData) {
          throw new Error('Failed to fetch staff data');
        }

        // Get sales data for the staff member
        const salesResponse = await fetch(`/api/sales?cashier_id=${params.id}`);
        let salesData = [];
        if (salesResponse.ok) {
          const salesResult = await salesResponse.json();
          salesData = salesResult.sales || [];
        } else {
          console.error('Error fetching sales:', salesResponse.status);
        }

        const totalSales = salesData.reduce((sum: number, sale: { total_amount: number }) => sum + Number(sale.total_amount || 0), 0);
        const transactionCount = salesData.length;

        setStaff({
          ...userData,
          totalSales,
          transactionCount
        });
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to fetch staff details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [params.id]);

  const handleBack = () => {
    router.push('/staff');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading staff details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!staff) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Staff Not Found</h1>
            <p className="text-muted-foreground mb-4">The staff member you&apos;re looking for doesn&apos;t exist.</p>
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
      <StaffDetail onBack={handleBack} staffMember={staff} />
    </DashboardLayout>
  );
}
