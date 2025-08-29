'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryManagement } from '@/components/CategoryManagement';

export default function CategoriesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <CategoryManagement onBack={handleBack} />
  );
}
