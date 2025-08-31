'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface ActivityLogData {
  user_id: string;
  business_id?: string;
  store_id?: string;
  activity_type: string;
  category: string;
  description: string;
  metadata?: Record<string, string | number | boolean>;
  ip_address?: string;
  user_agent?: string;
}

interface ActivityLoggerContextType {
  logActivity: (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ) => Promise<void>;
  logUserActivity: (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ) => Promise<void>;
  logBusinessActivity: (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ) => Promise<void>;
  logStoreActivity: (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ) => Promise<void>;
}

const ActivityLoggerContext = createContext<ActivityLoggerContextType | undefined>(undefined);

export const useActivityLogger = (): ActivityLoggerContextType => {
  const context = useContext(ActivityLoggerContext);
  if (context === undefined) {
    throw new Error('useActivityLogger must be used within an ActivityLoggerProvider');
  }
  return context;
};

export const ActivityLoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, currentBusiness, currentStore } = useAuth();
  const [clientInfo, setClientInfo] = useState<{ ip_address?: string; user_agent?: string }>({});

  // Get client information on mount
  useEffect(() => {
    const getUserAgent = () => {
      if (typeof window !== 'undefined') {
        return window.navigator.userAgent;
      }
      return undefined;
    };

    const getIPAddress = async () => {
      try {
        // Try to get IP from a public service
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.warn('Could not fetch IP address:', error);
        return undefined;
      }
    };

    setClientInfo({
      user_agent: getUserAgent(),
      ip_address: undefined // Will be set by the server
    });

    // Get IP address
    getIPAddress().then(ip => {
      setClientInfo(prev => ({ ...prev, ip_address: ip }));
    });
  }, []);

  const logActivity = async (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> => {
    try {
      // Log to console for development
      if (process.env.NODE_ENV === 'development') {

      }

      // Send to API
      const response = await fetch('/api/activity-logs/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          business_id: currentBusiness?.id,
          store_id: currentStore?.id,
          activity_type: activityType,
          category,
          description,
          metadata,
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log activity');
      }

    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to prevent breaking the main application flow
    }
  };

  const logUserActivity = async (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> => {
    if (!user?.id) {
      console.warn('Cannot log user activity: No user ID');
      return;
    }
    await logActivity(activityType, category, description, metadata);
  };

  const logBusinessActivity = async (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> => {
    if (!currentBusiness?.id) {
      console.warn('Cannot log business activity: No business ID');
      return;
    }
    await logActivity(activityType, category, description, metadata);
  };

  const logStoreActivity = async (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> => {
    if (!currentStore?.id) {
      console.warn('Cannot log store activity: No store ID');
      return;
    }
    await logActivity(activityType, category, description, metadata);
  };

  return (
    <ActivityLoggerContext.Provider value={{ 
      logActivity, 
      logUserActivity, 
      logBusinessActivity, 
      logStoreActivity 
    }}>
      {children}
    </ActivityLoggerContext.Provider>
  );
};
