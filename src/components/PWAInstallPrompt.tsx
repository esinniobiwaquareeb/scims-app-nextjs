"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Download, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { isDark, mounted } = useTheme();

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as { standalone?: boolean }).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Check if prompt was dismissed
    const checkDismissalStatus = () => {
      // Check if permanently dismissed
      const permanentlyDismissed = localStorage.getItem('pwa-prompt-dismissed-permanent');
      if (permanentlyDismissed === 'true') {
        return false;
      }

      // Check if dismissed in this session
      const sessionDismissed = sessionStorage.getItem('pwa-prompt-dismissed-session');
      if (sessionDismissed === 'true') {
        return false;
      }

      // Check if shown recently (within last 7 days)
      const lastShown = localStorage.getItem('pwa-prompt-last-shown');
      if (lastShown) {
        const lastShownDate = new Date(lastShown);
        const daysSinceLastShown = (Date.now() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastShown < 7) {
          return false; // Don't show if shown within last 7 days
        }
      }

      // Check if already shown in this session
      const shownInSession = sessionStorage.getItem('pwa-prompt-shown-session');
      if (shownInSession === 'true') {
        return false;
      }

      return true;
    };

    // Check if we should actually show the prompt
    const shouldShowPrompt = () => {
      if (isInstalled) return false;
      // Check sessionStorage directly instead of state
      const shownInSession = sessionStorage.getItem('pwa-prompt-shown-session');
      if (shownInSession === 'true') return false;
      return checkDismissalStatus();
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show if conditions are met
      if (shouldShowPrompt()) {
        setShowPrompt(true);
        sessionStorage.setItem('pwa-prompt-shown-session', 'true');
        localStorage.setItem('pwa-prompt-last-shown', new Date().toISOString());
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Clear dismissal flags since app is installed
      localStorage.removeItem('pwa-prompt-dismissed-permanent');
      sessionStorage.removeItem('pwa-prompt-dismissed-session');
      sessionStorage.removeItem('pwa-prompt-shown-session');
    };

    // Check initial state
    const installed = checkIfInstalled();
    if (installed) {
      return; // Don't set up listeners if already installed
    }

    // No need to check here - shouldShowPrompt will handle it

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Delayed show (only if conditions are met and not already showing)
    let timer: NodeJS.Timeout | null = null;
    if (shouldShowPrompt()) {
      // Wait longer before showing (2 minutes instead of 30 seconds)
      timer = setTimeout(() => {
        // Re-check conditions before showing
        const sessionDismissed = sessionStorage.getItem('pwa-prompt-dismissed-session');
        const permanentlyDismissed = localStorage.getItem('pwa-prompt-dismissed-permanent');
        const shownInSession = sessionStorage.getItem('pwa-prompt-shown-session');
        
        if (!sessionDismissed && !permanentlyDismissed && !shownInSession && !isInstalled) {
          setShowPrompt(true);
          sessionStorage.setItem('pwa-prompt-shown-session', 'true');
          localStorage.setItem('pwa-prompt-last-shown', new Date().toISOString());
        }
      }, 120000); // 2 minutes
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isInstalled]); // Removed showPrompt and hasShownInSession from dependencies to prevent re-runs

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      showFallbackInstallInstructions();
      return;
    }

    setIsInstalling(true);
    
    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
        // Clear dismissal flags since user accepted
        localStorage.removeItem('pwa-prompt-dismissed-permanent');
        sessionStorage.removeItem('pwa-prompt-dismissed-session');
        sessionStorage.removeItem('pwa-prompt-shown-session');
      } else {
        // User dismissed, mark as shown to prevent showing again soon
        sessionStorage.setItem('pwa-prompt-shown-session', 'true');
        localStorage.setItem('pwa-prompt-last-shown', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      showFallbackInstallInstructions();
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const showFallbackInstallInstructions = () => {
    // Show browser-specific installation instructions
    const userAgent = navigator.userAgent;
    let instructions = '';

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      instructions = 'Tap the Share button and then "Add to Home Screen"';
    } else if (/Android/.test(userAgent)) {
      instructions = 'Tap the menu button and then "Add to Home Screen"';
    } else if (/Chrome/.test(userAgent)) {
      instructions = 'Click the install icon in the address bar or use the menu';
    } else if (/Firefox/.test(userAgent)) {
      instructions = 'Click the menu button and then "Install App"';
    } else if (/Safari/.test(userAgent)) {
      instructions = 'Click the Share button and then "Add to Home Screen"';
    } else {
      instructions = 'Use your browser\'s menu to install this app';
    }

    alert(`To install SCIMS:\n\n${instructions}`);
  };

  const handleClose = () => {
    setShowPrompt(false);
    onClose?.();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in sessionStorage to avoid showing again in this session
    sessionStorage.setItem('pwa-prompt-dismissed-session', 'true');
    // Also mark as shown to prevent showing again
    sessionStorage.setItem('pwa-prompt-shown-session', 'true');
    onClose?.();
  };

  const handleDismissPermanently = () => {
    setShowPrompt(false);
    // Store permanent dismissal in localStorage
    localStorage.setItem('pwa-prompt-dismissed-permanent', 'true');
    // Also mark as shown
    sessionStorage.setItem('pwa-prompt-shown-session', 'true');
    onClose?.();
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Don't show if already installed or if not showing
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <Card className={`shadow-lg border-0 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Download className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              Install SCIMS
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </Button>
          </div>
          <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Install SCIMS on your device for quick access and offline functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={`flex items-center gap-3 text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <Smartphone className="w-4 h-4" />
            <span>Access from home screen</span>
          </div>
          
          <div className={`flex items-center gap-3 text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <Monitor className="w-4 h-4" />
            <span>Works offline</span>
          </div>
          
          <div className={`flex items-center gap-3 text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <Tablet className="w-4 h-4" />
            <span>Faster loading</span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className={`w-full ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isInstalling ? 'Installing...' : 'Install App'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className={`flex-1 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Maybe Later
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDismissPermanently}
                className={`flex-1 ${
                  isDark 
                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Never
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
