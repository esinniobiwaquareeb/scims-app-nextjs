'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Package, 
  Minus, 
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { SupplyOrderSummary, SupplyOrderItem } from '@/types/supply';

interface AcceptReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyOrder: SupplyOrderSummary;
  onSuccess: () => void;
}

interface AcceptableItem {
  supply_order_item_id: string;
  product_name: string;
  quantity_supplied: number;
  quantity_returned: number;
  quantity_accepted: number;
  quantity_pending: number;
  unit_price: number;
  accept_quantity: number;
}

export const AcceptReturnModal: React.FC<AcceptReturnModalProps> = ({
  open,
  onOpenChange,
  supplyOrder,
  onSuccess
}) => {
  const { } = useAuth();
  const { formatCurrency } = useSystem();
  
  const [supplyOrderItems, setSupplyOrderItems] = useState<SupplyOrderItem[]>([]);
  const [acceptableItems, setAcceptableItems] = useState<AcceptableItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSupplyOrderItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/supply-orders/${supplyOrder.id}`);
      const data = await response.json();

      if (data.success && data.supply_order.items) {
        setSupplyOrderItems(data.supply_order.items);
        
        // Initialize acceptable items (only items that have been returned but not yet accepted)
        const initialAcceptableItems: AcceptableItem[] = data.supply_order.items
          .filter((item: SupplyOrderItem) => {
            const pending = item.quantity_supplied - item.quantity_returned - item.quantity_accepted;
            return item.quantity_returned > 0 && pending > 0;
          })
          .map((item: SupplyOrderItem) => ({
            supply_order_item_id: item.id,
            product_name: item.product?.name || 'Unknown Product',
            quantity_supplied: item.quantity_supplied,
            quantity_returned: item.quantity_returned,
            quantity_accepted: item.quantity_accepted,
            quantity_pending: item.quantity_supplied - item.quantity_returned - item.quantity_accepted,
            unit_price: item.unit_price,
            accept_quantity: 0
          }));
        
        setAcceptableItems(initialAcceptableItems);
      } else {
        toast.error('Failed to fetch supply order items');
      }
    } catch (error) {
      console.error('Error fetching supply order items:', error);
      toast.error('Failed to fetch supply order items');
    } finally {
      setLoading(false);
    }
  }, [supplyOrder.id]);

  // Fetch supply order items
  useEffect(() => {
    if (open && supplyOrder.id) {
      fetchSupplyOrderItems();
    }
  }, [open, supplyOrder.id, fetchSupplyOrderItems]);

  const updateAcceptQuantity = (index: number, quantity: number) => {
    const item = acceptableItems[index];
    if (quantity < 0 || quantity > item.quantity_pending) return;

    setAcceptableItems(acceptableItems.map((acceptableItem, i) =>
      i === index ? { ...acceptableItem, accept_quantity: quantity } : acceptableItem
    ));
  };

  const handleSubmit = async () => {
    const itemsToAccept = acceptableItems.filter(item => item.accept_quantity > 0);
    
    if (itemsToAccept.length === 0) {
      toast.error('Please select items to accept');
      return;
    }

    setSubmitting(true);

    try {
      const acceptData = {
        acceptedItems: itemsToAccept.map(item => ({
          supply_order_item_id: item.supply_order_item_id,
          quantity_accepted: item.accept_quantity
        }))
      };

      const response = await fetch(`/api/supply-orders/${supplyOrder.id}/accept-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acceptData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Returned items accepted successfully');
        onSuccess();
        handleClose();
      } else {
        toast.error(data.error || 'Failed to accept returned items');
      }
    } catch (error) {
      console.error('Error accepting returned items:', error);
      toast.error('Failed to accept returned items');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAcceptableItems([]);
    setNotes('');
    onOpenChange(false);
  };

  const totalAcceptValue = acceptableItems.reduce((sum, item) => 
    sum + (item.accept_quantity * item.unit_price), 0
  );

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading supply order items...</span>
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
            <CheckCircle className="h-5 w-5" />
            Accept Returned Items - {supplyOrder.supply_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supply Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Supply Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">CUSTOMER DETAILS</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Name:</span>
                      <span className="text-sm font-medium">{supplyOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Phone:</span>
                      <span className="text-sm font-medium">{supplyOrder.customer_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Supply Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(supplyOrder.supply_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">ORDER SUMMARY</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Items:</span>
                      <span className="text-sm font-medium">{supplyOrderItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Quantity Supplied:</span>
                      <span className="text-sm font-medium">
                        {supplyOrderItems.reduce((sum, item) => sum + item.quantity_supplied, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Quantity Returned:</span>
                      <span className="text-sm font-medium">
                        {supplyOrderItems.reduce((sum, item) => sum + item.quantity_returned, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Quantity Accepted:</span>
                      <span className="text-sm font-medium">
                        {supplyOrderItems.reduce((sum, item) => sum + item.quantity_accepted, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Total Order Value:</span>
                      <span className="text-sm font-bold">{formatCurrency(supplyOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Items Available for Acceptance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acceptableItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Items to Accept</h3>
                  <p className="text-muted-foreground">
                    All returned items have already been accepted or there are no returned items.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {acceptableItems.map((item, index) => (
                    <div key={item.supply_order_item_id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.product_name}</h4>
                          
                          {/* Quantity Summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                            <div className="bg-blue-50 p-2 rounded-md">
                              <p className="text-xs text-blue-600 font-medium">SUPPLIED</p>
                              <p className="text-sm font-bold text-blue-800">{item.quantity_supplied}</p>
                            </div>
                            <div className="bg-orange-50 p-2 rounded-md">
                              <p className="text-xs text-orange-600 font-medium">RETURNED</p>
                              <p className="text-sm font-bold text-orange-800">{item.quantity_returned}</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded-md">
                              <p className="text-xs text-green-600 font-medium">ACCEPTED</p>
                              <p className="text-sm font-bold text-green-800">{item.quantity_accepted}</p>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded-md">
                              <p className="text-xs text-yellow-600 font-medium">PENDING</p>
                              <p className="text-sm font-bold text-yellow-800">{item.quantity_pending}</p>
                            </div>
                          </div>
                          
                          {/* Price Information */}
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Unit Price:</span>
                              <span className="font-medium">{formatCurrency(item.unit_price)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Total Returned Value:</span>
                              <span className="font-medium">{formatCurrency(item.quantity_returned * item.unit_price)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Accept Quantity</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAcceptQuantity(index, item.accept_quantity - 1)}
                              disabled={item.accept_quantity <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantity_pending}
                              value={item.accept_quantity}
                              onChange={(e) => updateAcceptQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAcceptQuantity(index, item.accept_quantity + 1)}
                              disabled={item.accept_quantity >= item.quantity_pending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Max Acceptable</p>
                            <p className="text-lg font-bold text-green-600">{item.quantity_pending}</p>
                          </div>
                        </div>
                      </div>

                      {item.accept_quantity > 0 && (
                        <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800">Acceptance Details</p>
                              <p className="text-xs text-green-600">
                                {item.accept_quantity} units × {formatCurrency(item.unit_price)} each
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-800">
                                {formatCurrency(item.accept_quantity * item.unit_price)}
                              </p>
                              <p className="text-xs text-green-600">Acceptance Value</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acceptance Summary */}
          {acceptableItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Acceptance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="accept-notes">Acceptance Notes</Label>
                  <Textarea
                    id="accept-notes"
                    placeholder="Additional notes about the acceptance..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Items to Accept:</span>
                    <span>{acceptableItems.filter(item => item.accept_quantity > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Acceptance Value:</span>
                    <span className="font-bold">{formatCurrency(totalAcceptValue)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={acceptableItems.filter(item => item.accept_quantity > 0).length === 0 || submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting Items...
                    </>
                  ) : (
                    'Accept Returned Items'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
