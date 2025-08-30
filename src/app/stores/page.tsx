"use client";

import React from 'react';
import { StoreManagement } from '@/components/StoreManagement';
import { useRouter } from 'next/navigation';

export default function StoresPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreManagement onBack={handleBack} />
    </div>
  );
}
