'use client';

import React from 'react';
import { SubscriptionManagement } from '@/components/SubscriptionManagement';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return <SubscriptionManagement onBack={handleBack} />;
}
