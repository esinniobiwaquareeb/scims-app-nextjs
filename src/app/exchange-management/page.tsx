'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ExchangeManagement } from '@/components/exchange/ExchangeManagement';

export default function ExchangeManagementPage() {
  return (
    <ProtectedRoute>
      <ExchangeManagement />
    </ProtectedRoute>
  );
}

