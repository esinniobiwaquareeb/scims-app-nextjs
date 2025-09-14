'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Notification, NotificationStats } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentStore, currentBusiness } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!currentStore?.id || !currentBusiness?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/notifications?storeId=${currentStore.id}&businessId=${currentBusiness.id}&limit=100`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      // Ensure all notifications have valid createdAt dates and proper field mapping
      const validNotifications = (data.notifications || []).map((notification: any) => ({
        ...notification,
        isRead: notification.is_read || notification.isRead || false,
        storeId: notification.store_id || notification.storeId,
        businessId: notification.business_id || notification.businessId,
        createdAt: notification.created_at || notification.createdAt || new Date().toISOString(),
        updatedAt: notification.updated_at || notification.updatedAt || new Date().toISOString(),
      }));
      setNotifications(validNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [currentStore?.id, currentBusiness?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!currentStore?.id || !currentBusiness?.id) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAllAsRead: true,
          storeId: currentStore.id,
          businessId: currentBusiness.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [currentStore?.id, currentBusiness?.id]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, []);

  const deleteAllNotifications = useCallback(async () => {
    if (!currentStore?.id || !currentBusiness?.id) return;

    try {
      const response = await fetch(
        `/api/notifications?deleteAll=true&storeId=${currentStore.id}&businessId=${currentBusiness.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete all notifications');
      }

      setNotifications([]);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete all notifications');
    }
  }, [currentStore?.id, currentBusiness?.id]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Calculate stats
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    orders: notifications.filter(n => n.type === 'order').length,
    system: notifications.filter(n => n.type === 'system').length,
    alerts: notifications.filter(n => n.type === 'alert').length,
  };

  // Auto-fetch notifications when store/business changes
  useEffect(() => {
    if (currentStore?.id && currentBusiness?.id) {
      fetchNotifications();
    }
  }, [currentStore?.id, currentBusiness?.id, fetchNotifications]);

  // Set up polling for new notifications every 10 seconds for better real-time experience
  useEffect(() => {
    if (!currentStore?.id || !currentBusiness?.id) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000); // 10 seconds for better real-time experience

    return () => clearInterval(interval);
  }, [currentStore?.id, currentBusiness?.id, fetchNotifications]);

  // Optional: Play sound for new order notifications (can be enabled if needed)
  // useEffect(() => {
  //   const newOrderNotifications = notifications.filter(
  //     notification => 
  //       notification.type === 'order' && 
  //       !notification.isRead &&
  //       new Date(notification.createdAt).getTime() > Date.now() - 15000 // Last 15 seconds
  //   );

  //   if (newOrderNotifications.length > 0) {
  //     // Play notification sound
  //     try {
  //       const audio = new Audio('/sounds/notification.mp3');
  //       audio.volume = 0.5;
  //       audio.play().catch(() => {
  //         // Fallback to system beep if audio file doesn't exist
  //         console.log('\u0007'); // System beep
  //       });
  //     } catch {
  //       console.log('\u0007'); // System beep fallback
  //     }
  //   }
  // }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    stats,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
