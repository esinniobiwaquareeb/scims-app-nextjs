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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RotateCcw, 
  Package, 
  Minus, 
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateSupplyReturnData, SupplyOrderSummary, SupplyOrderItem } from '@/types/supply';

interface SupplyReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyOrder: SupplyOrderSummary;
  onSuccess: () => void;
}

interface ReturnItem {
  supply_order_item_id: string;
  product_name: string;
  quantity_supplied: number;
  quantity_returned: number;
  quantity_accepted: number;
  quantity_pending: number;
  unit_price: number;
  return_quantity: number;
  return_reason: string;
  condition: 'good' | 'damaged' | 'defective' | 'expired';
}

export const SupplyReturnModal: React.FC<SupplyReturnModalProps> = ({
  open,
  onOpenChange,
  supplyOrder,
  onSuccess
}) => {
  const { } = useAuth();
  const { formatCurrency } = useSystem();
  
  const [supplyOrderItems, setSupplyOrderItems] = useState<SupplyOrderItem[]>([]);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
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
        
        // Initialize return items
        const initialReturnItems: ReturnItem[] = data.supply_order.items.map((item: SupplyOrderItem) => ({
          supply_order_item_id: item.id,
          product_name: item.product?.name || 'Unknown Product',
          quantity_supplied: item.quantity_supplied,
          quantity_returned: item.quantity_returned,
          quantity_accepted: item.quantity_accepted,
          quantity_pending: item.quantity_supplied - item.quantity_returned - item.quantity_accepted,
          unit_price: item.unit_price,
          return_quantity: 0,
          return_reason: '',
          condition: 'good'
        }));
        
        setReturnItems(initialReturnItems);
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

  const updateReturnQuantity = (index: number, quantity: number) => {
    const item = returnItems[index];
    if (quantity < 0 || quantity > item.quantity_pending) return;

    setReturnItems(returnItems.map((returnItem, i) =>
      i === index ? { ...returnItem, return_quantity: quantity } : returnItem
    ));
  };

  const updateReturnReason = (index: number, reason: string) => {
    setReturnItems(returnItems.map((returnItem, i) =>
      i === index ? { ...returnItem, return_reason: reason } : returnItem
    ));
  };

  const updateCondition = (index: number, condition: 'good' | 'damaged' | 'defective' | 'expired') => {
    setReturnItems(returnItems.map((returnItem, i) =>
      i === index ? { ...returnItem, condition } : returnItem
    ));
  };

  const handleSubmit = async () => {
    const itemsToReturn = returnItems.filter(item => item.return_quantity > 0);
    
    if (itemsToReturn.length === 0) {
      toast.error('Please select items to return');
      return;
    }

    setSubmitting(true);

    try {
      const returnData: CreateSupplyReturnData = {
        supply_order_id: supplyOrder.id,
        notes,
        items: itemsToReturn.map(item => ({
          supply_order_item_id: item.supply_order_item_id,
          quantity_returned: item.return_quantity,
          return_reason: item.return_reason,
          condition: item.condition
        }))
      };

      const response = await fetch('/api/supply-returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Return processed successfully');
        onSuccess();
        handleClose();
      } else {
        toast.error(data.error || 'Failed to process return');
      }
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error('Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReturnItems([]);
    setNotes('');
    onOpenChange(false);
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

  const totalReturnValue = returnItems.reduce((sum, item) => 
    sum + (item.return_quantity * item.unit_price), 0
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
            <RotateCcw className="h-5 w-5" />
            Process Return - {supplyOrder.supply_number}
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
                    {supplyOrder.expected_return_date && (
                      <div className="flex justify-between">
                        <span className="text-sm">Expected Return:</span>
                        <span className="text-sm font-medium">
                          {new Date(supplyOrder.expected_return_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
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

          {/* Return Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items to Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnItems.map((item, index) => (
                  <div key={item.supply_order_item_id} className={`p-4 border rounded-lg ${
                    item.quantity_pending === 0 ? 'bg-gray-50 border-gray-200' : 'bg-white'
                  }`}>
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
                            <span className="text-muted-foreground">Total Supplied Value:</span>
                            <span className="font-medium">{formatCurrency(item.quantity_supplied * item.unit_price)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getConditionColor(item.condition)}>
                        {item.condition.toUpperCase()}
                      </Badge>
                    </div>

                    {item.quantity_pending === 0 ? (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm font-medium text-green-800">
                            All items have been processed (returned or accepted)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Return Quantity</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReturnQuantity(index, item.return_quantity - 1)}
                              disabled={item.return_quantity <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantity_pending}
                              value={item.return_quantity}
                              onChange={(e) => updateReturnQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReturnQuantity(index, item.return_quantity + 1)}
                              disabled={item.return_quantity >= item.quantity_pending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Condition</Label>
                          <Select
                            value={item.condition}
                            onValueChange={(value) => 
                              updateCondition(index, value as 'good' | 'damaged' | 'defective' | 'expired')
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="defective">Defective</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <Label>Return Reason</Label>
                          <Input
                            placeholder="Reason for return..."
                            value={item.return_reason}
                            onChange={(e) => updateReturnReason(index, e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {item.return_quantity > 0 && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">Return Details</p>
                            <p className="text-xs text-blue-600">
                              {item.return_quantity} units × {formatCurrency(item.unit_price)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-800">
                              {formatCurrency(item.return_quantity * item.unit_price)}
                            </p>
                            <p className="text-xs text-blue-600">Return Value</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Return Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Return Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="return-notes">Return Notes</Label>
                <Textarea
                  id="return-notes"
                  placeholder="Additional notes about the return..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Items to Return:</span>
                  <span>{returnItems.filter(item => item.return_quantity > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Return Value:</span>
                  <span className="font-bold">{formatCurrency(totalReturnValue)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={returnItems.filter(item => item.return_quantity > 0).length === 0 || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Return...
                  </>
                ) : (
                  'Process Return'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
