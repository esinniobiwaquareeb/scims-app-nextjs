"use client";

import React from 'react';
import { BusinessManagement } from '@/components/BusinessManagement';
import { useRouter } from 'next/navigation';

export default function BusinessPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessManagement onBack={handleBack} />
    </div>
  );
}
