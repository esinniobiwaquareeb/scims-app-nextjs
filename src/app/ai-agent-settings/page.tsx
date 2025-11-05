'use client';

import React from 'react';
import { AIAgentSettingsPage } from '@/components/settings/AIAgentSettingsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AIAgentSettingsRoute() {
  return (
    <ProtectedRoute requiredRole="business_admin">
      <AIAgentSettingsPage />
    </ProtectedRoute>
  );
}
