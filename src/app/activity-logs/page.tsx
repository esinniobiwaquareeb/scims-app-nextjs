'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ActivityLogs } from '@/components/ActivityLogs';

export default function ActivityLogsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <ActivityLogs onBack={handleBack} />
  );
}
