'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  Filter,
  ArrowLeft,
  Store
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

export default function NotificationsPage() {
  const router = useRouter();
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingNotifications, setProcessingNotifications] = useState<Set<string>>(new Set());
  
  const itemsPerPage = 10;

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = (() => {
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
    })();

    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.data?.customerName && notification.data.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
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

  const handleProcessOrder = async (notification: Notification) => {
    if (notification.type === 'order' && notification.data?.orderId) {
      setProcessingNotifications(prev => new Set(prev).add(notification.id));
      
      try {
        const response = await fetch(`/api/orders/${notification.data.orderId}/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'confirmed' }),
        });

        if (response.ok) {
          await markAsRead(notification.id);
          await refreshNotifications();
        } else {
          console.error('Failed to process order:', await response.text());
        }
      } catch (error) {
        console.error('Error processing order:', error);
      } finally {
        setProcessingNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <BellRing className="w-8 h-8" />
                  Notifications
                  {stats.unread > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats.unread}
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your notifications and alerts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshNotifications}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'All', count: stats.total },
                  { key: 'unread', label: 'Unread', count: stats.unread },
                  { key: 'orders', label: 'Orders', count: stats.orders },
                  { key: 'system', label: 'System', count: stats.system },
                  { key: 'alerts', label: 'Alerts', count: stats.alerts },
                ].map(({ key, label, count }) => (
                  <Button
                    key={key}
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilter(key as 'all' | 'unread' | 'orders' | 'system' | 'alerts');
                      setCurrentPage(1);
                    }}
                    className="flex items-center gap-2"
                  >
                    {label}
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteAllNotifications}
                disabled={notifications.length === 0}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Notifications ({filteredNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12 text-red-600">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <span>{error}</span>
              </div>
            ) : paginatedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <Bell className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-center">
                  {filter === 'all' 
                    ? "You're all caught up!" 
                    : `No ${filter} notifications found`
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      notification.isRead 
                        ? 'bg-white dark:bg-gray-900' 
                        : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className={`font-semibold text-lg ${
                                notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                              }`}>
                                {notification.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={`${getNotificationBadgeColor(notification.type)}`}
                              >
                                {notification.type}
                              </Badge>
                            </div>
                            
                            <p className={`text-base ${
                              notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.message}
                            </p>

                            {/* Order details for order notifications */}
                            {notification.type === 'order' && notification.data && (
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="space-y-4">
                                  {/* Store name - prominent display */}
                                  {(notification.storeName || notification.data?.storeName) && (
                                    <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg p-3 mb-4">
                                      <div className="flex items-center gap-3">
                                        <Store className="w-5 h-5 text-green-700 dark:text-green-300 flex-shrink-0" />
                                        <div>
                                          <span className="font-semibold text-green-900 dark:text-green-100 text-sm block">Store</span>
                                          <span className="text-green-800 dark:text-green-200 text-base font-bold">
                                            {notification.storeName || notification.data?.storeName}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                      <User className="w-5 h-5 text-green-600 flex-shrink-0" />
                                      <div>
                                        <span className="font-medium text-green-800 dark:text-green-200 text-sm block">Customer</span>
                                        <span className="text-green-700 dark:text-green-300 text-sm">{notification.data.customerName}</span>
                                      </div>
                                    </div>
                                    
                                    {notification.data.totalAmount && (
                                      <div className="flex items-center gap-3">
                                        <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium text-green-800 dark:text-green-200 text-sm block">Amount</span>
                                          <span className="font-bold text-green-800 dark:text-green-200 text-sm">${notification.data.totalAmount.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {notification.data.customerPhone && (
                                      <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium text-green-800 dark:text-green-200 text-sm block">Phone</span>
                                          <span className="text-green-700 dark:text-green-300 text-sm">{notification.data.customerPhone}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Order Items */}
                                  {notification.data.orderItems && notification.data.orderItems.length > 0 && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="font-medium text-green-800 dark:text-green-200">Order Items</span>
                                      </div>
                                      <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {notification.data.orderItems.slice(0, 5).map((item: { name: string; quantity: number; price: number }, index: number) => (
                                          <div key={index} className="bg-white/70 dark:bg-gray-800/70 border border-green-200 dark:border-green-700 rounded-md p-3">
                                            <div className="space-y-1">
                                              <div className="text-sm font-medium text-green-800 dark:text-green-200 truncate">{item.name}</div>
                                              <div className="flex justify-between items-center text-xs text-green-700 dark:text-green-300">
                                                <span>Quantity: {item.quantity}</span>
                                                <span>Price: ${item.price?.toFixed(2) || '0.00'}</span>
                                              </div>
                                              <div className="text-xs font-semibold text-green-800 dark:text-green-200 text-right">
                                                Total: ${(item.quantity * (item.price || 0)).toFixed(2)}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        {notification.data.orderItems.length > 5 && (
                                          <div className="text-center py-2">
                                            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                                              +{notification.data.orderItems.length - 5} more items
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Order ID and Status */}
                                  <div className="pt-3 border-t border-green-200 dark:border-green-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div className="text-sm text-green-600 dark:text-green-400">
                                        <span className="font-medium">Order ID:</span> {notification.data.orderId}
                                      </div>
                                      <div className="text-sm text-green-600 dark:text-green-400">
                                        <span className="font-medium">Status:</span> Pending
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Quick action for order notifications */}
                            {notification.type === 'order' && !notification.isRead && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleProcessOrder(notification)}
                                disabled={processingNotifications.has(notification.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {processingNotifications.has(notification.id) ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Process
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {!notification.isRead && notification.type !== 'order' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification)}
                                className="flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Mark Read
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
