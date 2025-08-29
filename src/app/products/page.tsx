'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductManagement } from '@/components/ProductManagement';

export default function ProductsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleNavigate = (view: string) => {
    router.push(`/${view}`);
  };

  return (
    <ProductManagement 
      onBack={handleBack}
      onNavigate={handleNavigate}
    />
  );
}
