'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductManagement } from '@/components/ProductManagement';

export default function ProductsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <ProductManagement 
      onBack={handleBack}
    />
  );
}
