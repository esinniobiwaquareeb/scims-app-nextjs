import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toaster, toast } from 'sonner';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message, {
      duration: 6000,
      position: 'top-right',
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    toast.info(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message, {
      duration: 5000,
      position: 'top-right',
    });
  }, []);

  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};
