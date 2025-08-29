'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RestockManagement } from '@/components/RestockManagement';

export default function RestockPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <RestockManagement onBack={handleBack} />
  );
}
