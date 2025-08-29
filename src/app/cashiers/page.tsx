'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CashierManagement } from '@/components/CashierManagement';

export default function CashiersPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleNavigate = (view: string, params?: Record<string, unknown>) => {
    // Handle navigation to other views if needed
    console.log('Navigate to:', view, params);
  };

  return (
    <CashierManagement 
      onBack={handleBack}
      onNavigate={handleNavigate}
    />
  );
}
