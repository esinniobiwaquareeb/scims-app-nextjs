'use client';

import React from 'react';
import { SidebarNavigation } from './SidebarNavigation';
import { Header } from './Header';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  headerActions
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col min-w-0">
        {title && (
          <Header 
            title={title}
            subtitle={subtitle}
            showBackButton={false}
            showLogout={true}
          >
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <NotificationBell />
              {headerActions ? (
                headerActions
              ) : (
                <Button 
                  onClick={() => router.push('/pos')} 
                  variant="outline"
                  className="h-8 sm:h-9 shrink-0"
                  size="sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Open <br /> POS</span>
                </Button>
              )}
            </div>
          </Header>
        )}
        
        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

