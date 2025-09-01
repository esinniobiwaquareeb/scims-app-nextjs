'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SystemProvider } from '@/contexts/SystemContext';
import { ActivityLoggerProvider } from '@/contexts/ActivityLogger';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        refetchOnWindowFocus: true,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeProvider>
          <AuthProvider>
            <SystemProvider>
              <ActivityLoggerProvider>
                <PermissionsProvider>
                  {children}
                  <Toaster />
                </PermissionsProvider>
              </ActivityLoggerProvider>
            </SystemProvider>
          </AuthProvider>
        </ThemeProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  );
}
