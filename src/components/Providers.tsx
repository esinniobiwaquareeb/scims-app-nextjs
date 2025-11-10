'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SystemProvider } from '@/contexts/SystemContext';
import { ActivityLoggerProvider } from '@/contexts/ActivityLogger';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next"

// Create QueryClient outside component to ensure it's only created once
// Using a function to create it ensures a fresh instance per app instance
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes - cache is kept for 10 minutes after last use
        retry: 3,
        refetchOnWindowFocus: false, // Don't refetch on window focus to reduce unnecessary calls
        refetchOnMount: false, // Don't refetch on mount if data is fresh (respects staleTime)
        refetchOnReconnect: true, // Only refetch on reconnect
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient is only created once per component instance
  const [queryClient] = useState(() => getQueryClient());

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
                  <NotificationProvider>
                    {children}
                    <Toaster />
                    <Analytics />
                  </NotificationProvider>
                </PermissionsProvider>
              </ActivityLoggerProvider>
            </SystemProvider>
          </AuthProvider>
        </ThemeProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  );
}
