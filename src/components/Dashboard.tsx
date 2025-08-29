'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CashierDashboard } from '@/components/dashboard/CashierDashboard';
import { BusinessAdminDashboard } from '@/components/dashboard/BusinessAdminDashboard';
import { StoreAdminDashboard } from '@/components/dashboard/StoreAdminDashboard';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';

export const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render different dashboard based on user role
  switch (user.role) {
    case 'cashier':
      return <CashierDashboard />;
    
    case 'business_admin':
      return <BusinessAdminDashboard />;
    
    case 'store_admin':
      return <StoreAdminDashboard />;
    
    case 'superadmin':
      return <SuperAdminDashboard />;
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">Unknown user role: {user.role}</p>
            <p className="text-sm text-gray-500">Please contact administrator</p>
          </div>
        </div>
      );
  }
};
