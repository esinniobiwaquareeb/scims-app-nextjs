import { useState, useEffect, useCallback } from 'react';

interface PWAStatus {
  isOnline: boolean;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
}

interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isInstalled: false,
    isUpdateAvailable: false,
    isServiceWorkerSupported: 'serviceWorker' in navigator,
    isServiceWorkerRegistered: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPromptEvent | null>(null);

  // Check if app is installed
  const checkIfInstalled = useCallback(() => {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    
    setStatus(prev => ({ ...prev, isInstalled: isStandalone }));
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setStatus(prev => ({ ...prev, isServiceWorkerRegistered: true }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setStatus(prev => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }, []);

  // Handle install prompt
  const handleInstallPrompt = useCallback((event: Event) => {
    event.preventDefault();
    setDeferredPrompt(event as PWAInstallPromptEvent);
  }, []);

  // Install the app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      return { success: false, error: 'No install prompt available' };
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        return { success: true, outcome: 'accepted' };
      } else {
        return { success: true, outcome: 'dismissed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [deferredPrompt]);

  // Update the app
  const updateApp = useCallback(() => {
    if (status.isUpdateAvailable) {
      window.location.reload();
    }
  }, [status.isUpdateAvailable]);

  // Check online/offline status
  const updateOnlineStatus = useCallback(() => {
    setStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
  }, []);

  // Initialize PWA functionality
  useEffect(() => {
    // Check initial installation status
    checkIfInstalled();

    // Register service worker
    registerServiceWorker();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setStatus(prev => ({ ...prev, isInstalled: true }));
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [checkIfInstalled, registerServiceWorker, updateOnlineStatus, handleInstallPrompt]);

  return {
    ...status,
    deferredPrompt,
    installApp,
    updateApp,
    registerServiceWorker,
  };
};

export default usePWA;
