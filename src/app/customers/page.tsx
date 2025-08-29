'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CustomerManagement } from '@/components/CustomerManagement';

export default function CustomersPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <CustomerManagement onBack={handleBack} />
  );
}
