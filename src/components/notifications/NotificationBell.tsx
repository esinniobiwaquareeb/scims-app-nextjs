'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { Bell, BellRing } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { stats } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const hasUnreadNotifications = stats.unread > 0;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPanelOpen(true)}
        className={cn("relative h-8 w-8 sm:h-9 sm:w-9 p-0", className)}
      >
        {hasUnreadNotifications ? (
          <BellRing className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
        ) : (
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        )}
        
        {hasUnreadNotifications && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
          >
            {stats.unread > 99 ? '99+' : stats.unread}
          </Badge>
        )}
      </Button>

      <NotificationPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
}
