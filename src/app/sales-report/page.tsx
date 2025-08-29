'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SalesReport } from '@/components/SalesReport';

export default function SalesReportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <SalesReport onBack={handleBack} />
  );
}
