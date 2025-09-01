'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  User, 
  Calendar, 
  Phone, 

  RotateCcw,
  CreditCard,
  Loader2,

} from 'lucide-react';
import { SupplyOrder } from '@/types/supply';

interface SupplyOrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyOrderId: string;
}

export const SupplyOrderDetailModal: React.FC<SupplyOrderDetailModalProps> = ({
  open,
  onOpenChange,
  supplyOrderId
}) => {
  const { formatCurrency } = useSystem();
  const [supplyOrder, setSupplyOrder] = useState<SupplyOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && supplyOrderId) {
      fetchSupplyOrderDetails();
    }
  }, [open, supplyOrderId]);

  const fetchSupplyOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/supply-orders/${supplyOrderId}`);
      const data = await response.json();

      if (data.success) {
        setSupplyOrder(data.supply_order);
      } else {
        console.error('Failed to fetch supply order details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching supply order details:', error);
    } finally {
      setLoading(false);
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'damaged': return 'bg-yellow-100 text-yellow-800';
      case 'defective': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'mobile': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading supply order details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!supplyOrder) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Supply order not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Supply Order Details - {supplyOrder.supply_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{supplyOrder.supply_number}</h2>
                  <Badge className={getStatusColor(supplyOrder.status)}>
                    {supplyOrder.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(supplyOrder.total_amount)}</p>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{supplyOrder.customer?.name}</p>
                    <p className="text-muted-foreground">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{supplyOrder.customer?.phone}</p>
                    <p className="text-muted-foreground">Phone</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {new Date(supplyOrder.supply_date).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground">Supply Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{supplyOrder.items?.length || 0} items</p>
                    <p className="text-muted-foreground">Items</p>
                  </div>
                </div>
              </div>

              {supplyOrder.notes && (
                <div className="mt-4 p-3 bg-gray-50 border rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Notes:</span> {supplyOrder.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="items" className="gap-2">
                <Package className="h-4 w-4" />
                Items ({supplyOrder.items?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="returns" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Returns ({supplyOrder.returns?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Payments ({supplyOrder.payments?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Items Tab */}
            <TabsContent value="items" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supply Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {supplyOrder.items && supplyOrder.items.length > 0 ? (
                    <div className="space-y-4">
                      {supplyOrder.items.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{item.product?.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>SKU: {item.product?.sku || 'N/A'}</span>
                                <span>Price: {formatCurrency(item.unit_price)}</span>
                                <span>Total: {formatCurrency(item.total_price)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="font-bold text-blue-800">{item.quantity_supplied}</p>
                              <p className="text-blue-600">Supplied</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="font-bold text-yellow-800">{item.quantity_returned}</p>
                              <p className="text-yellow-600">Returned</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="font-bold text-green-800">{item.quantity_accepted}</p>
                              <p className="text-green-600">Accepted</p>
                            </div>
                          </div>

                          {item.return_reason && (
                            <div className="mt-3 p-3 bg-gray-50 border rounded-md">
                              <p className="text-sm">
                                <span className="font-medium">Return Reason:</span> {item.return_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No items found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Returns Tab */}
            <TabsContent value="returns" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  {supplyOrder.returns && supplyOrder.returns.length > 0 ? (
                    <div className="space-y-4">
                      {supplyOrder.returns.map((returnItem) => (
                        <div key={returnItem.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{returnItem.return_number}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  {new Date(returnItem.return_date).toLocaleDateString()}
                                </span>
                                <span>Value: {formatCurrency(returnItem.total_returned_amount)}</span>
                                {returnItem.processed_by_user && (
                                  <span>Processed by: {returnItem.processed_by_user.name}</span>
                                )}
                              </div>
                            </div>
                            <Badge className={getStatusColor(returnItem.status)}>
                              {returnItem.status.toUpperCase()}
                            </Badge>
                          </div>

                          {returnItem.items && returnItem.items.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Returned Items:</h5>
                              {returnItem.items.map((returnItemDetail) => (
                                <div key={returnItemDetail.id} className="p-3 bg-gray-50 border rounded-md">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm">
                                        {returnItemDetail.supply_order_item?.product?.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Quantity: {returnItemDetail.quantity_returned}
                                      </p>
                                    </div>
                                    <Badge className={getConditionColor(returnItemDetail.condition)}>
                                      {returnItemDetail.condition.toUpperCase()}
                                    </Badge>
                                  </div>
                                  {returnItemDetail.return_reason && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Reason: {returnItemDetail.return_reason}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {returnItem.notes && (
                            <div className="mt-3 p-3 bg-gray-50 border rounded-md">
                              <p className="text-sm">
                                <span className="font-medium">Notes:</span> {returnItem.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No returns found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  {supplyOrder.payments && supplyOrder.payments.length > 0 ? (
                    <div className="space-y-4">
                      {supplyOrder.payments.map((payment) => (
                        <div key={payment.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{payment.payment_number}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  {new Date(payment.payment_date).toLocaleDateString()}
                                </span>
                                <span>Amount: {formatCurrency(payment.amount_paid)}</span>
                                {payment.processed_by_user && (
                                  <span>Processed by: {payment.processed_by_user.name}</span>
                                )}
                              </div>
                            </div>
                            <Badge className={getPaymentMethodColor(payment.payment_method)}>
                              {payment.payment_method.toUpperCase()}
                            </Badge>
                          </div>

                          {payment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 border rounded-md">
                              <p className="text-sm">
                                <span className="font-medium">Notes:</span> {payment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Payment Summary */}
                      <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Paid:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(supplyOrder.payments.reduce((sum, payment) => sum + payment.amount_paid, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-medium">Remaining Balance:</span>
                          <span className={`font-bold ${supplyOrder.total_amount - supplyOrder.payments.reduce((sum, payment) => sum + payment.amount_paid, 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(supplyOrder.total_amount - supplyOrder.payments.reduce((sum, payment) => sum + payment.amount_paid, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No payments found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
