'use client';

import React from 'react';
import { ProductSync } from '@/components/ProductSync';
import { useRouter } from 'next/navigation';

export default function ProductSyncPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return <ProductSync onBack={handleBack} />;
}
