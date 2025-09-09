'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  Info,
  Clock,
  User,
  Phone,
  DollarSign,
  Package
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification';
import { createTestOrderNotification } from '@/utils/testNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { currentStore, currentBusiness } = useAuth();
  const {
    notifications,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'orders' | 'system' | 'alerts'>('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'orders':
        return notification.type === 'order';
      case 'system':
        return notification.type === 'system';
      case 'alerts':
        return notification.type === 'alert';
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'system':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'alert':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'system':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleCreateTestNotification = async () => {
    if (currentStore?.id && currentBusiness?.id) {
      await createTestOrderNotification(currentStore.id, currentBusiness.id);
      await refreshNotifications();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                Notifications
                {stats.unread > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.unread}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshNotifications}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 mt-4">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'unread', label: 'Unread', count: stats.unread },
                { key: 'orders', label: 'Orders', count: stats.orders },
                { key: 'system', label: 'System', count: stats.system },
                { key: 'alerts', label: 'Alerts', count: stats.alerts },
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(key as 'all' | 'unread' | 'orders' | 'system' | 'alerts')}
                  className="text-xs"
                >
                  {label}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="flex-1"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteAllNotifications}
                disabled={notifications.length === 0}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>

            {/* Test button for development */}
            <div className="flex gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCreateTestNotification}
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-1" />
                Test Order
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading notifications...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8 text-red-600">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  <span>{error}</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <Bell className="w-12 h-12 mb-4" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm text-center">
                    {filter === 'all' 
                      ? "You're all caught up!" 
                      : `No ${filter} notifications found`
                    }
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium text-sm ${
                                  notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                                >
                                  {notification.type}
                                </Badge>
                              </div>
                              
                              <p className={`text-sm mb-2 ${
                                notification.isRead ? 'text-gray-600' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>

                              {/* Order details for order notifications */}
                              {notification.type === 'order' && notification.data && (
                                <div className="bg-gray-50 rounded-md p-3 mb-2">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {notification.data.customerName && (
                                      <div className="flex items-center gap-1">
                                        <User className="w-3 h-3 text-gray-500" />
                                        <span className="font-medium">Customer:</span>
                                        <span>{notification.data.customerName}</span>
                                      </div>
                                    )}
                                    {notification.data.customerPhone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-gray-500" />
                                        <span className="font-medium">Phone:</span>
                                        <span>{notification.data.customerPhone}</span>
                                      </div>
                                    )}
                                    {notification.data.totalAmount && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3 text-gray-500" />
                                        <span className="font-medium">Total:</span>
                                        <span>${notification.data.totalAmount.toFixed(2)}</span>
                                      </div>
                                    )}
                                    {notification.data.orderItems && (
                                      <div className="flex items-center gap-1 col-span-2">
                                        <Package className="w-3 h-3 text-gray-500" />
                                        <span className="font-medium">Items:</span>
                                        <span>{notification.data.orderItems.length} items</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
