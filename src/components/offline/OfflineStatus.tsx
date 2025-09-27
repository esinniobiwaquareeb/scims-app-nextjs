'use client';

import React from 'react';
import { useNetworkStatus } from '@/utils/hooks/useStoreData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

export const OfflineStatus: React.FC = () => {
  const { isOnline, syncInProgress, pendingItems, syncAllOfflineData, lastSync } = useNetworkStatus();

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp || timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5 text-green-600" />
              Online Status
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-600" />
              Offline Status
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sync Status:</span>
          <div className="flex items-center gap-2">
            {syncInProgress ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Syncing...</span>
              </>
            ) : (
              <Badge variant={pendingItems > 0 ? "secondary" : "default"}>
                {pendingItems > 0 ? `${pendingItems} pending` : 'Up to date'}
              </Badge>
            )}
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Sync:</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatLastSync(lastSync)}
            </span>
          </div>
        </div>


        {/* Sync Button */}
        {isOnline && pendingItems > 0 && !syncInProgress && (
          <Button
            onClick={syncAllOfflineData}
            className="w-full"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Now
          </Button>
        )}

        {/* Offline Notice */}
        {!isOnline && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You&apos;re working offline. Data will sync automatically when connection is restored.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
