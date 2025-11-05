'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AffiliateManagement } from '@/components/AffiliateManagement';

export default function AffiliatesPage() {
  return (
    <ProtectedRoute requiredRole="superadmin">
      <AffiliateManagement />
    </ProtectedRoute>
  );
}
