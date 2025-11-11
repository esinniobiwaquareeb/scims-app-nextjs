'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Package,
  X,
  ExternalLink,
  Store,
  Truck,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Helper function to safely format dates
const formatNotificationTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { currentStore } = useAuth();
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
  const [processingNotifications, setProcessingNotifications] = useState<Set<string>>(new Set());
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});
  const [updatingStatuses, setUpdatingStatuses] = useState<Set<string>>(new Set());

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

  // Fetch order statuses for order notifications
  useEffect(() => {
    const fetchOrderStatuses = async () => {
      const orderNotifications = notifications.filter(n => n.type === 'order' && n.data?.orderId);
      if (orderNotifications.length === 0) return;

      const statusPromises = orderNotifications.map(async (notification) => {
        try {
          const response = await fetch(`/api/public/order/${notification.data?.orderId}`);
          if (response.ok) {
            const data = await response.json();
            return { orderId: notification.data?.orderId, status: data.order?.status || 'pending' };
          }
        } catch (error) {
          console.error('Error fetching order status:', error);
        }
        return null;
      });

      const results = await Promise.all(statusPromises);
      const statusMap: Record<string, string> = {};
      results.forEach(result => {
        if (result) {
          statusMap[result.orderId!] = result.status;
        }
      });
      setOrderStatuses(statusMap);
    };

    if (notifications.length > 0) {
      fetchOrderStatuses();
    }
  }, [notifications]);

  // Check if current store owns the notification
  const isStoreOwner = (notification: Notification): boolean => {
    if (!currentStore || !notification.storeId) return false;
    return notification.storeId === currentStore.id;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <Truck className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (notification: Notification, newStatus: string) => {
    if (!notification.data?.orderId || !currentStore) return;

    setUpdatingStatuses(prev => new Set(prev).add(notification.id));
    
    try {
      const response = await fetch(`/api/orders/${notification.data.orderId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          storeId: currentStore.id
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
        setOrderStatuses(prev => ({
          ...prev,
          [notification.data!.orderId!]: newStatus
        }));
        await refreshNotifications();
      } else {
        toast.error(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatuses(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleViewAll = () => {
    onClose();
    router.push('/notifications');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <Card className="h-full rounded-none border-0 flex flex-col">
          <CardHeader className="border-b flex-shrink-0">
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
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
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

            {/* View All Button */}
            <div className="mt-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleViewAll}
                className="w-full flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View All Notifications
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden">
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
                <div className="p-3 space-y-2">
                  {filteredNotifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header with icon, title, and badge */}
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium text-sm ${
                                notification.isRead ? 'text-gray-700' : 'text-gray-900'
                              } truncate`}>
                                {notification.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                              >
                                {notification.type}
                              </Badge>
                            </div>
                            <p className={`text-xs ${
                              notification.isRead ? 'text-gray-600' : 'text-gray-700'
                            } overflow-hidden`} style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        {/* Order details - simplified for overlay */}
                        {notification.type === 'order' && notification.data && (
                          <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                            <div className="space-y-1">
                              {/* Store name */}
                              {(notification.storeName || notification.data?.storeName) && (
                                <div className="flex items-center gap-1 mb-2 pb-2 border-b border-green-200">
                                  <Store className="w-3 h-3 text-green-600" />
                                  <span className="font-medium text-green-800">Store:</span>
                                  <span className="text-green-700 font-semibold truncate">
                                    {notification.storeName || notification.data?.storeName}
                                  </span>
                                </div>
                              )}
                              
                              {/* Order Status */}
                              {notification.data.orderId && (
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-200">
                                  <span className="font-medium text-green-800">Status:</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getStatusColor(orderStatuses[notification.data.orderId] || 'pending')}`}
                                  >
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(orderStatuses[notification.data.orderId] || 'pending')}
                                      {getStatusLabel(orderStatuses[notification.data.orderId] || 'pending')}
                                    </span>
                                  </Badge>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-green-600" />
                                <span className="font-medium text-green-800">Customer:</span>
                                <span className="text-green-700 truncate">{notification.data.customerName}</span>
                              </div>
                              
                              {notification.data.totalAmount && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-green-600" />
                                  <span className="font-medium text-green-800">Amount:</span>
                                  <span className="font-bold text-green-800">${notification.data.totalAmount.toFixed(2)}</span>
                                </div>
                              )}
                              
                              {notification.data.customerPhone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-green-600" />
                                  <span className="font-medium text-green-800">Phone:</span>
                                  <span className="text-green-700">{notification.data.customerPhone}</span>
                                </div>
                              )}
                              
                              {notification.data.orderItems && notification.data.orderItems.length > 0 && (
                                <div className="pt-1 border-t border-green-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Package className="w-3 h-3 text-green-600" />
                                    <span className="font-medium text-green-800">Items:</span>
                                    <span className="text-green-700">{notification.data.orderItems.length} item(s)</span>
                                  </div>
                                  {notification.data.orderItems.slice(0, 2).map((item: { name: string; quantity: number; price: number }, index: number) => (
                                    <div key={index} className="text-green-700 truncate">
                                      • {item.name} (Qty: {item.quantity})
                                    </div>
                                  ))}
                                  {notification.data.orderItems.length > 2 && (
                                    <div className="text-green-600 text-xs">
                                      +{notification.data.orderItems.length - 2} more items
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Order Status Management - Only for owning store */}
                        {notification.type === 'order' && notification.data?.orderId && isStoreOwner(notification) && (
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-green-800">Change Status:</span>
                              <Select
                                value={orderStatuses[notification.data.orderId] || 'pending'}
                                onValueChange={(value) => handleStatusChange(notification, value)}
                                disabled={updatingStatuses.has(notification.id)}
                              >
                                <SelectTrigger className="h-7 text-xs flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              {updatingStatuses.has(notification.id) && (
                                <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Time and actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatNotificationTime(notification.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {/* Mark as read - Only for owning store on order notifications */}
                            {!notification.isRead && (
                              isStoreOwner(notification) ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification)}
                                  className="h-6 w-6 p-0"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              ) : notification.type !== 'order' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification)}
                                  className="h-6 w-6 p-0"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              ) : (
                                <div className="h-6 w-6 flex items-center justify-center" title="Only the owning store can mark this as read">
                                  <Info className="w-3 h-3 text-gray-400" />
                                </div>
                              )
                            )}
                            
                            {/* Delete - Only for owning store */}
                            {isStoreOwner(notification) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                title="Delete notification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            ) : (
                              <div className="h-6 w-6 flex items-center justify-center" title="Only the owning store can delete this notification">
                                <Info className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show more indicator if there are more notifications */}
                  {filteredNotifications.length > 10 && (
                    <div className="text-center py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewAll}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View {filteredNotifications.length - 10} more notifications
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
