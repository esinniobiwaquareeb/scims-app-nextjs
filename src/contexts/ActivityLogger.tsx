'use client';

import React, { createContext, useContext } from 'react';

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
  const logActivity = async (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> => {
    try {
      // For now, just log to console
      // TODO: Implement actual API call to log activity
      console.log('Activity Log:', {
        activityType,
        category,
        description,
        metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return (
    <ActivityLoggerContext.Provider value={{ logActivity }}>
      {children}
    </ActivityLoggerContext.Provider>
  );
};
