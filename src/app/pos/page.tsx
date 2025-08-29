'use client';

import React from 'react';
import { PointOfSale as PointOfSaleComponent } from '@/components/pos';
import { useRouter } from 'next/navigation';

export default function POSPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleSaleCompleted = () => {
    // Optionally redirect or show success message
    console.log('Sale completed');
  };

  return (
    <PointOfSaleComponent 
      onBack={handleBack}
      onSaleCompleted={handleSaleCompleted}
    />
  );
}