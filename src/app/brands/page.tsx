'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BrandManagement } from '@/components/BrandManagement';

export default function BrandsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <BrandManagement onBack={handleBack} />
  );
}
