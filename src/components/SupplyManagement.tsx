'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  RotateCcw,
  CreditCard,
  Eye,
  Calendar,
  User,
  Phone,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { SupplyOrderSummary, PendingReturn } from '@/types/supply';
import { SupplyOrderModal } from './supply/SupplyOrderModal';
import { SupplyReturnModal } from './supply/SupplyReturnModal';
import { SupplyPaymentModal } from './supply/SupplyPaymentModal';
import { SupplyOrderDetailModal } from './supply/SupplyOrderDetailModal';
import { AcceptReturnModal } from './supply/AcceptReturnModal';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SupplyManagementProps {
  onBack: () => void;
}

export const SupplyManagement: React.FC<SupplyManagementProps> = ({ onBack }) => {
  const { currentStore, user } = useAuth();
  const { formatCurrency } = useSystem();
  const { canDelete } = usePermissions();
  const { logBusinessActivity } = useActivityLogger();
  
  const [activeTab, setActiveTab] = useState('supply-orders');
  const [supplyOrders, setSupplyOrders] = useState<SupplyOrderSummary[]>([]);
  const [pendingReturns, setPendingReturns] = useState<PendingReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showSupplyOrderModal, setShowSupplyOrderModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAcceptReturnModal, setShowAcceptReturnModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupplyOrder, setSelectedSupplyOrder] = useState<SupplyOrderSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch supply orders
  const fetchSupplyOrders = useCallback(async () => {
    if (!currentStore?.id) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        store_id: currentStore.id,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/supply-orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setSupplyOrders(data.supply_orders || []);
      } else {
        toast.error(data.error || 'Failed to fetch supply orders');
      }
    } catch (error) {
      console.error('Error fetching supply orders:', error);
      toast.error('Failed to fetch supply orders');
    } finally {
      setLoading(false);
    }
  }, [currentStore?.id, statusFilter]);

  // Fetch pending returns
  const fetchPendingReturns = useCallback(async () => {
    if (!currentStore?.id) return;
    
    try {
      const response = await fetch(`/api/supply-orders/pending-returns?store_id=${currentStore.id}`);
      const data = await response.json();

      if (data.success) {
        setPendingReturns(data.pending_returns || []);
      } else {
        toast.error(data.error || 'Failed to fetch pending returns');
      }
    } catch (error) {
      console.error('Error fetching pending returns:', error);
      toast.error('Failed to fetch pending returns');
    }
  }, [currentStore?.id]);

  useEffect(() => {
    if (currentStore?.id) {
      fetchSupplyOrders();
      fetchPendingReturns();
    }
  }, [currentStore?.id, statusFilter, fetchSupplyOrders, fetchPendingReturns]);

  const handleCreateSupplyOrder = () => {
    setShowSupplyOrderModal(true);
  };

  const handleSupplyOrderCreated = () => {
    setShowSupplyOrderModal(false);
    fetchSupplyOrders();
    fetchPendingReturns();
    toast.success('Supply order created successfully');
  };

  const handleViewDetails = (supplyOrder: SupplyOrderSummary) => {
    setSelectedSupplyOrder(supplyOrder);
    setShowDetailModal(true);
  };

  const handleCreateReturn = (supplyOrder: SupplyOrderSummary) => {
    setSelectedSupplyOrder(supplyOrder);
    setShowReturnModal(true);
  };

  const handleCreatePayment = (supplyOrder: SupplyOrderSummary) => {
    setSelectedSupplyOrder(supplyOrder);
    setShowPaymentModal(true);
  };

  const handleAcceptReturn = (supplyOrder: SupplyOrderSummary) => {
    setSelectedSupplyOrder(supplyOrder);
    setShowAcceptReturnModal(true);
  };

  const handleReturnCreated = () => {
    setShowReturnModal(false);
    fetchSupplyOrders();
    fetchPendingReturns();
    toast.success('Return processed successfully');
  };

  const handlePaymentCreated = () => {
    setShowPaymentModal(false);
    fetchSupplyOrders();
    toast.success('Payment processed successfully');
  };

  const handleAcceptReturnCreated = () => {
    setShowAcceptReturnModal(false);
    fetchSupplyOrders();
    fetchPendingReturns();
    toast.success('Returned items accepted successfully');
  };

  const handleDeleteSupplyOrder = (supplyOrder: SupplyOrderSummary) => {
    setSelectedSupplyOrder(supplyOrder);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSupplyOrder = async () => {
    if (!selectedSupplyOrder) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/supply-orders/${selectedSupplyOrder.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Log the deletion activity
        await logBusinessActivity(
          'supply_order_deleted',
          'supply_management',
          `Deleted supply order ${selectedSupplyOrder.supply_number}`,
          {
            supply_order_id: selectedSupplyOrder.id,
            supply_number: selectedSupplyOrder.supply_number,
            customer_name: selectedSupplyOrder.customer_name,
            total_amount: selectedSupplyOrder.total_amount,
            status: selectedSupplyOrder.status
          }
        );

        toast.success('Supply order deleted successfully');
        setShowDeleteDialog(false);
        setSelectedSupplyOrder(null);
        fetchSupplyOrders();
        fetchPendingReturns();
      } else {
        toast.error(data.error || 'Failed to delete supply order');
      }
    } catch (error) {
      console.error('Error deleting supply order:', error);
      toast.error('Failed to delete supply order');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'supplied': return 'bg-blue-100 text-blue-800';
      case 'partially_returned': return 'bg-yellow-100 text-yellow-800';
      case 'fully_returned': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSupplyOrders = supplyOrders.filter(order =>
    order.supply_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_phone.includes(searchTerm)
  );

  const filteredPendingReturns = pendingReturns.filter(returnItem =>
    returnItem.supply_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.customer_phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Supply Management"
        subtitle="Manage supply orders, returns, and payments"
        showBackButton
        onBack={onBack}
        showLogout={false}
      >
        <Button onClick={handleCreateSupplyOrder} className="gap-2">
          <Plus className="h-4 w-4" />
          New Supply Order
        </Button>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by supply number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="supplied">Supplied</option>
                <option value="partially_returned">Partially Returned</option>
                <option value="fully_returned">Fully Returned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="supply-orders" className="gap-2">
              <Package className="h-4 w-4" />
              Supply Orders ({supplyOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending-returns" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Pending Returns ({pendingReturns.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Filter className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Supply Orders Tab */}
          <TabsContent value="supply-orders" className="mt-6">
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading supply orders...</p>
                </div>
              ) : filteredSupplyOrders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No supply orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'No supply orders match your search criteria.' : 'Create your first supply order to get started.'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleCreateSupplyOrder}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Supply Order
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredSupplyOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{order.supply_number}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{order.customer_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{order.customer_phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(order.supply_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>{order.total_items} items</span>
                              </div>
                            </div>
                            <div className="mt-3 text-sm">
                              <span className="font-medium">Total: {formatCurrency(order.total_amount)}</span>
                              <span className="text-muted-foreground ml-4">
                                Supplied: {order.total_quantity_supplied} | 
                                Returned: {order.total_quantity_returned} | 
                                Accepted: {order.total_quantity_accepted}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status === 'supplied' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateReturn(order)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreatePayment(order)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                            {(canDelete('supply_order') || user?.role === 'business_admin') && order.status !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSupplyOrder(order)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pending Returns Tab */}
          <TabsContent value="pending-returns" className="mt-6">
            <div className="grid gap-4">
              {filteredPendingReturns.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending returns</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No pending returns match your search criteria.' : 'All supply orders are up to date.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredPendingReturns.map((returnItem) => (
                    <Card key={returnItem.supply_order_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{returnItem.supply_number}</h3>
                              <Badge className="bg-orange-100 text-orange-800">
                                PENDING RETURN
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{returnItem.customer_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{returnItem.customer_phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(returnItem.supply_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>{returnItem.items_pending_return} items</span>
                              </div>
                            </div>
                            <div className="mt-3 text-sm">
                              <span className="text-muted-foreground">
                                Expected Return: {returnItem.expected_return_date ? 
                                  new Date(returnItem.expected_return_date).toLocaleDateString() : 
                                  'Not set'
                                }
                              </span>
                              <span className="text-muted-foreground ml-4">
                                Quantity Pending: {returnItem.total_quantity_pending}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const order = supplyOrders.find(o => o.id === returnItem.supply_order_id);
                                if (order) handleViewDetails(order);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const order = supplyOrders.find(o => o.id === returnItem.supply_order_id);
                                if (order) handleCreateReturn(order);
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const order = supplyOrders.find(o => o.id === returnItem.supply_order_id);
                                if (order) handleAcceptReturn(order);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Supply Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supplyOrders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active supply orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingReturns.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting return
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(supplyOrders.reduce((sum, order) => sum + order.total_amount, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Outstanding supply value
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showSupplyOrderModal && (
          <SupplyOrderModal
            open={showSupplyOrderModal}
            onOpenChange={setShowSupplyOrderModal}
            onSuccess={handleSupplyOrderCreated}
          />
        )}

        {showReturnModal && selectedSupplyOrder && (
          <SupplyReturnModal
            open={showReturnModal}
            onOpenChange={setShowReturnModal}
            supplyOrder={selectedSupplyOrder}
            onSuccess={handleReturnCreated}
          />
        )}

        {showPaymentModal && selectedSupplyOrder && (
          <SupplyPaymentModal
            open={showPaymentModal}
            onOpenChange={setShowPaymentModal}
            supplyOrder={selectedSupplyOrder}
            onSuccess={handlePaymentCreated}
          />
        )}

        {showDetailModal && selectedSupplyOrder && (
          <SupplyOrderDetailModal
            open={showDetailModal}
            onOpenChange={setShowDetailModal}
            supplyOrderId={selectedSupplyOrder.id}
          />
        )}

        {showAcceptReturnModal && selectedSupplyOrder && (
          <AcceptReturnModal
            open={showAcceptReturnModal}
            onOpenChange={setShowAcceptReturnModal}
            supplyOrder={selectedSupplyOrder}
            onSuccess={handleAcceptReturnCreated}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supply Order</AlertDialogTitle>
              <div className="text-sm text-muted-foreground">
                <p>
                  Are you sure you want to delete supply order <strong>{selectedSupplyOrder?.supply_number}</strong>?
                </p>
                <p className="mt-2">
                  This action will permanently delete the supply order and all associated data including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Supply order details</li>
                  <li>All supply order items</li>
                  <li>Related returns and payments</li>
                </ul>
                <p className="mt-2">
                  <strong className="text-red-600">This action cannot be undone.</strong>
                </p>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteSupplyOrder}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete Supply Order'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};
