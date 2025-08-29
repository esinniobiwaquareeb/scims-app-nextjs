'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StaffManagement } from '@/components/StaffManagement';

export default function StaffPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <StaffManagement onBack={handleBack} />
  );
}
