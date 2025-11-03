'use client';

import React from 'react';
import { BusinessSettings } from '@/components/BusinessSettings';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function BusinessSettingsPage() {
  return (
    <ProtectedRoute requiredRole="business_admin">
      <BusinessSettings />
    </ProtectedRoute>
  );
}
