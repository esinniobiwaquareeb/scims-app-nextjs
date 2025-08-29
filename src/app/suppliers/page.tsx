'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SupplierManagement } from '@/components/SupplierManagement';

export default function SuppliersPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <SupplierManagement onBack={handleBack} />
  );
}
