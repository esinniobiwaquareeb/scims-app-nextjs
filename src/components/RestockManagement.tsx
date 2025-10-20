import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { Header } from '@/components/common/Header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Download,
  RefreshCw,
  Loader2,
  Search
} from 'lucide-react';
import { 
  useCreateRestockOrder, 
  useUpdateRestockOrderStatus, 
  useReceiveRestockItems,
  useRestockOrders
} from '../utils/hooks/restock';
import { useBusinessSuppliers } from '../utils/hooks/suppliers';
import { useStoreProducts, useBusinessProductsWithLowStock } from '../utils/hooks/products';

interface RestockOrder {
  id: string;
  store_id: string;
  supplier_id: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  expected_delivery?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  supplier?: {
    name: string;
    contact_person: string;
    phone: string;
  };
  items?: RestockItem[];
}

interface RestockItem {
  id: string;
  restock_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity?: number;
  product?: {
    name: string;
    sku: string;
    current_stock: number;
    reorder_level: number;
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  reorder_level: number;
  min_stock_level: number;
  supplier_id?: string;
  suppliers?: {
    name: string;
  };
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
}

interface RestockManagementProps {
  onBack: () => void;
}

export const RestockManagement: React.FC<RestockManagementProps> = ({ onBack }) => {
  const { user, currentStore, currentBusiness } = useAuth();
  const { formatCurrency } = useSystem();
  const { logActivity } = useActivityLogger();
  
  // UI State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RestockOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form State
  const [newOrder, setNewOrder] = useState({
    supplier_id: '',
    notes: '',
    expected_delivery: '',
    items: [] as Array<{
      product_id: string;
      quantity: number;
      unit_cost: number;
    }>
  });

  // Use React Query hooks for data fetching
  // When "All Store" is selected, fetch business-level data
  const isAllStoresSelected = !currentStore?.id;
  
  const {
    data: restockOrders = [],
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useRestockOrders(currentStore?.id || '', { 
    enabled: !!currentStore?.id 
  });

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError
  } = useStoreProducts(currentStore?.id || '', { 
    enabled: !!currentStore?.id 
  });

  // Business-level products for "All Store" view
  const {
    data: businessProductsData,
    isLoading: isLoadingBusinessProducts,
    error: businessProductsError
  } = useBusinessProductsWithLowStock(currentBusiness?.id || '', { 
    enabled: isAllStoresSelected && !!currentBusiness?.id 
  });

  const {
    data: suppliers = [],
    isLoading: isLoadingSuppliers,
    error: suppliersError
  } = useBusinessSuppliers(currentBusiness?.id || '', { 
    enabled: !!currentBusiness?.id 
  });

  // Use mutations for CRUD operations
  const createOrderMutation = useCreateRestockOrder(currentStore?.id || '');
  const updateStatusMutation = useUpdateRestockOrderStatus();
  const receiveItemsMutation = useReceiveRestockItems();

  // Combined loading states
  const loading = isLoadingOrders || isLoadingProducts || isLoadingBusinessProducts || isLoadingSuppliers;
  const error = ordersError || productsError || businessProductsError || suppliersError;

  // Get low stock products
  const getLowStockProducts = () => {
    if (isAllStoresSelected) {
      // Business data has a different structure
      return businessProductsData?.lowStockProducts || [];
    }
    if (!productsData) return [];
    return productsData.filter((product: {
      id: string;
      name: string;
      stock_quantity: number;
      reorder_level?: number;
      min_stock_level?: number;
      [key: string]: unknown;
    }) => 
      product.stock_quantity <= (product.reorder_level || product.min_stock_level || 10)
    );
  };

  // Get all products for restocking (not just low stock)
  const getAllProducts = () => {
    if (isAllStoresSelected) {
      // For business view, use all active products (including zero-stock synced products)
      return businessProductsData?.allProducts || [];
    }
    if (!productsData) return [];
    return productsData; // Return all products for store view
  };

  // Create restock order
  const handleCreateOrder = async () => {
    if (!currentStore?.id || !user?.id || newOrder.items.length === 0) {
      toast.error('Please select a supplier and add items');
      return;
    }

    try {
      const orderData = {
        supplier_id: newOrder.supplier_id,
        status: 'pending',
        total_amount: newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0),
        notes: newOrder.notes,
        expected_delivery: newOrder.expected_delivery,
        created_by: user.id,
        items: newOrder.items
      };

      // Use the mutation hook - this will automatically invalidate cache on success
      await createOrderMutation.mutateAsync(orderData);
      
      // Close dialog and reset form on success
      setShowCreateDialog(false);
      resetForm();
      
      // Log activity
      logActivity('restock_order_create', 'Restock Management', 'Created restock order', {
        orderId: 'new', // Will be updated when we get the response
        supplierId: newOrder.supplier_id,
        itemCount: newOrder.items.length
      });
      
      // Note: Cache invalidation is handled automatically by the mutation hook
      // The restock orders table will automatically refresh with the new data
    } catch (error: unknown) {
      console.error('Error creating restock order:', error);
      // Error handling is done in the mutation hook
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      // Use the mutation hook - this will automatically invalidate cache on success
      await updateStatusMutation.mutateAsync({ orderId, status });
      
      // Log activity
      logActivity('restock_order_update', 'Restock Management', `Updated restock order status to ${status}`, {
        orderId,
        newStatus: status
      });
      
      // Note: Cache invalidation is handled automatically by the mutation hook
      // The restock orders table will automatically refresh with the updated data
    } catch (error: unknown) {
      console.error('Error updating order status:', error);
      // Error handling is done in the mutation hook
    }
  };

  // Receive items
  const handleReceiveItems = async (orderId: string, receivedItems: { product_id: string; received_quantity: number }[]) => {
    try {
      // Use the mutation hook - this will automatically invalidate cache on success
      await receiveItemsMutation.mutateAsync({ orderId, receivedItems });
      
      // Close dialog on success
      setShowReceiveDialog(false);
      
      // Log activity
      logActivity('restock_order_receive', 'Restock Management', 'Received restock items', {
        orderId,
        itemCount: receivedItems.length
      });
      
      // Note: Cache invalidation is handled automatically by the mutation hook
      // The restock orders table will automatically refresh with the updated data
    } catch (error: unknown) {
      console.error('Error receiving items:', error);
      // Error handling is done in the mutation hook
    }
  };

  // Add item to order
  const addItemToOrder = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_cost: 0 }]
    }));
  };

  // Remove item from order
  const removeItemFromOrder = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item in order
  const updateOrderItem = (index: number, field: string, value: string | number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Reset form
  const resetForm = () => {
    setNewOrder({
      supplier_id: '',
      notes: '',
      expected_delivery: '',
      items: []
    });
  };

  // Filter orders
  const filteredOrders = restockOrders.filter((order: RestockOrder) => {
    if (!searchTerm) {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesStatus;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.supplier?.name?.toLowerCase().includes(searchLower) ||
      order.notes?.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower) ||
      order.items?.some(item => 
        item.product?.name?.toLowerCase().includes(searchLower) ||
        item.product?.sku?.toLowerCase().includes(searchLower)
      );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export orders
  const exportOrders = () => {
    const headers = ['Order ID', 'Supplier', 'Status', 'Total Amount', 'Created Date', 'Expected Delivery'];
    const rows = filteredOrders.map((order: RestockOrder) => [
      order.id,
      order.supplier?.name || 'Unknown',
      order.status,
      formatCurrency(order.total_amount),
      new Date(order.created_at).toLocaleDateString(),
      order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'N/A'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restock_orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Orders exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading restock management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Restock Management"
        subtitle={`Manage inventory replenishment and restock orders${isAllStoresSelected ? ' (Select a store to view orders)' : ''}`}
        showBackButton
        onBack={onBack}
        showLogout={false}
      >
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-800 text-sm font-medium mb-1">Failed to load restock data</p>
                  <p className="text-red-700 text-xs">{error?.message || 'Unknown error'}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchOrders()}
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mutation Status */}
        {(createOrderMutation.isPending || updateStatusMutation.isPending || receiveItemsMutation.isPending) && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-blue-800 text-sm">
                  {createOrderMutation.isPending && 'Creating restock order...'}
                  {updateStatusMutation.isPending && 'Updating order status...'}
                  {receiveItemsMutation.isPending && 'Receiving items...'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Low Stock Alert */}
          {getLowStockProducts().length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock Alert
                  {isAllStoresSelected && (
                    <Badge variant="outline" className="text-orange-700 border-orange-300 text-xs">
                      Business-wide view
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-600 mb-3">
                  {getLowStockProducts().length} products need restocking:
                  {isAllStoresSelected && (
                    <span className="block text-xs text-orange-500 mt-1">
                      Showing low stock products across all stores. Select a specific store to create restock orders.
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {getLowStockProducts().slice(0, 10).map((product: Product) => (
                    <Badge key={product.id} variant="outline" className="text-orange-700 border-orange-300">
                      {product.name} ({product.stock_quantity} left)
                    </Badge>
                  ))}
                  {getLowStockProducts().length > 10 && (
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      +{getLowStockProducts().length - 10} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="flex-1 w-full min-w-0 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders, suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => refetchOrders()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restock Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Restock Orders</CardTitle>
                <div className="flex items-center gap-2">
                  {searchTerm && (
                    <div className="text-sm text-gray-600">
                      {filteredOrders.length} of {restockOrders.length} orders found
                    </div>
                  )}
                  <Button variant="outline" onClick={exportOrders}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    disabled={isAllStoresSelected}
                    title={isAllStoresSelected ? "Select a specific store to create restock orders" : ""}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Order
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isAllStoresSelected ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a specific store to view restock orders</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Restock orders are managed at the store level. Please select a store to view and manage restock orders.
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {searchTerm ? (
                    <div>
                      <p className="text-muted-foreground mb-2">No restock orders found for &quot;{searchTerm}&quot;</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchTerm('')}
                        className="text-sm"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No restock orders found</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order: RestockOrder) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <span className="font-medium">Order #{order.id.slice(-6)}</span>
                          <span className="text-sm text-muted-foreground">
                            {order.supplier?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatCurrency(order.total_amount)}
                          </span>
                          <div className="flex gap-1">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(order.id, 'ordered')}
                                >
                                  Mark Ordered
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {order.status === 'ordered' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowReceiveDialog(true);
                                  }}
                                >
                                  Receive Items
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p>{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        {order.expected_delivery && (
                          <div>
                            <span className="text-muted-foreground">Expected:</span>
                            <p>{new Date(order.expected_delivery).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Items:</span>
                          <p>{order.items?.length || 0}</p>
                        </div>
                        {order.notes && (
                          <div>
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="truncate">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Restock Order</DialogTitle>
            <DialogDescription>
              Create a new restock order for low inventory items
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier</Label>
                <Select value={newOrder.supplier_id} onValueChange={(value) => setNewOrder(prev => ({ ...prev, supplier_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.filter((s: Supplier) => s.is_active).map((supplier: Supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Expected Delivery</Label>
                <Input
                  type="date"
                  value={newOrder.expected_delivery}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, expected_delivery: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes for this order..."
                value={newOrder.notes}
                onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Order Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItemToOrder}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <Label>Product</Label>
                      <Select 
                        value={item.product_id} 
                        onValueChange={(value) => updateOrderItem(index, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllProducts().map((product: Product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Current: {product.stock_quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div>
                      <Label>Unit Cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_cost}
                        onChange={(e) => updateOrderItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItemFromOrder(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder} disabled={newOrder.items.length === 0}>
                Create Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Restock Order</DialogTitle>
            <DialogDescription>
              Modify the restock order before receiving items
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <Select value={selectedOrder.supplier_id} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.filter((s: Supplier) => s.is_active).map((supplier: Supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes for this order..."
                  value={selectedOrder.notes || ''}
                  onChange={(e) => {
                    // Update the selected order notes
                    setSelectedOrder(prev => prev ? { ...prev, notes: e.target.value } : null);
                  }}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label className="mb-3 block">Order Items</Label>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 items-end">
                      <div>
                        <Label>Product</Label>
                        <Select value={item.product_id} disabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllProducts().map((product: Product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            // Update the item quantity
                            if (selectedOrder.items) {
                              selectedOrder.items[index].quantity = newQuantity;
                              setSelectedOrder({ ...selectedOrder });
                            }
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label>Unit Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_cost}
                          onChange={(e) => {
                            const newUnitCost = parseFloat(e.target.value) || 0;
                            // Update the item unit cost
                            if (selectedOrder.items) {
                              selectedOrder.items[index].unit_cost = newUnitCost;
                              setSelectedOrder({ ...selectedOrder });
                            }
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label>Total Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={(item.quantity * item.unit_cost).toFixed(2)}
                          disabled
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowEditDialog(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive Items Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive Restock Items</DialogTitle>
            <DialogDescription>
              Mark items as received and update inventory
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {item.product?.name || 'Unknown Product'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Ordered: {item.quantity}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Label>Received Quantity:</Label>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        defaultValue={item.quantity}
                        onChange={(e) => {
                          const receivedQty = parseInt(e.target.value) || 0;
                          // Update the item with received quantity
                          if (selectedOrder.items) {
                            selectedOrder.items[index].received_quantity = receivedQty;
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedOrder.items) {
                      const receivedItems = selectedOrder.items.map((item: RestockItem) => ({
                        product_id: item.product_id,
                        received_quantity: item.received_quantity || item.quantity
                      }));
                      handleReceiveItems(selectedOrder.id, receivedItems);
                    }
                  }}
                  disabled={receiveItemsMutation.isPending}
                >
                  {receiveItemsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Receiving...
                    </>
                  ) : (
                    'Receive Items'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
