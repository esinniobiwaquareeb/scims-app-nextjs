'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SupplyManagement } from '@/components/SupplyManagement';

export default function SupplyManagementPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <SupplyManagement 
      onBack={handleBack}
    />
  );
}
