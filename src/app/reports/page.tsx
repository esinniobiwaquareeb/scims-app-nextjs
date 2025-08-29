'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Reporting } from '@/components/Reporting';

export default function ReportsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <Reporting onBack={handleBack} />
  );
}
