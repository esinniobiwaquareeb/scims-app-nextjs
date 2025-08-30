'use client';

import React from 'react';
import { PlatformSettings } from '@/components/PlatformSettings';
import { useRouter } from 'next/navigation';

export default function PlatformSettingsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return <PlatformSettings onBack={handleBack} />;
}
