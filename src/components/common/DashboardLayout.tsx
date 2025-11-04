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
    <div className="h-screen bg-background flex overflow-hidden">
      <SidebarNavigation />
      
      {/* Main content area with header and scrollable content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 xl:ml-72">
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
                <button
                  onClick={() => router.push('/pos')}
                  className="rounded-md px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 shrink-0 flex items-center gap-2 sm:gap-3 lg:gap-4 border border-border bg-background hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4 lg:h-4 shrink-0" />
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium text-foreground">Open POS</span>
                </button>
              )}
            </div>
          </Header>
        )}
        
        {/* Scrollable main content */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden ${title ? 'pt-[73px] sm:pt-[81px] lg:pt-[89px]' : ''}`}>
          <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

