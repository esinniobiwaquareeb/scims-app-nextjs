"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StaffDetail } from '@/components/StaffDetail';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Staff Not Found</h1>
          <p className="text-gray-600 mb-4">The staff member you&apos;re looking for doesn&apos;t exist.</p>
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
      <StaffDetail onBack={handleBack} staffMember={staff} />
    </div>
  );
}
