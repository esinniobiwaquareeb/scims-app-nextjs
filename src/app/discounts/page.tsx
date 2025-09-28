'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DiscountManagement } from '@/components/DiscountManagement';

export default function DiscountsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return <DiscountManagement onBack={handleBack} />;
}
