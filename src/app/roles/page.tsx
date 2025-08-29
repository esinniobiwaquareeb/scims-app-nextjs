'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RolesPermissions } from '@/components/RolesPermissions';

export default function RolesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <RolesPermissions onBack={handleBack} />
  );
}
