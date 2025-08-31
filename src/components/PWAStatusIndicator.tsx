"use client";

import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Wifi, WifiOff, Download, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAStatusIndicator: React.FC = () => {
  const { 
    isOnline, 
    isInstalled, 
    isUpdateAvailable, 
    isServiceWorkerSupported,
    updateApp 
  } = usePWA();

  if (!isServiceWorkerSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Installation Status */}
      {isInstalled && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          Installed
        </Badge>
      )}

      {/* Update Available */}
      {isUpdateAvailable && (
        <Button
          size="sm"
          variant="outline"
          onClick={updateApp}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Update Available
        </Button>
      )}
    </div>
  );
};

export default PWAStatusIndicator;
