"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Download, Smartphone, Monitor, Tablet } from 'lucide-react';

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

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as { standalone?: boolean }).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    // Check initial state
    checkIfInstalled();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if we should show the prompt (e.g., user has been on site for a while)
    const timer = setTimeout(() => {
      if (!isInstalled && !showPrompt) {
        // Show a gentle reminder after 30 seconds
        setShowPrompt(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled, showPrompt]);

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
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setShowPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
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
    // Store dismissal in localStorage to avoid showing again soon
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed or if recently dismissed
  if (isInstalled || !showPrompt) {
    return null;
  }

  // Check if recently dismissed (within last 24 hours)
  const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Install SCIMS
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Install SCIMS on your device for quick access and offline functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Smartphone className="w-4 h-4" />
            <span>Access from home screen</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Monitor className="w-4 h-4" />
            <span>Works offline</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Tablet className="w-4 h-4" />
            <span>Faster loading</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isInstalling ? 'Installing...' : 'Install App'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="px-4"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
