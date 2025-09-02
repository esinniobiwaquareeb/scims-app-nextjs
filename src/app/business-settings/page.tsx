'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BusinessSettings } from '@/components/BusinessSettings';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function BusinessSettingsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute requiredRole="business_admin">
      <BusinessSettings onBack={handleBack} />
    </ProtectedRoute>
  );
}
