/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';
import { useStoreProducts } from '@/utils/hooks/products';
import type { SaleItem, Product } from '@/types';

// Local Sale type to match SalesReport
interface Sale {
  id: string;
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  receipt_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  cash_received?: number;
  change_given?: number;
  delivery_cost?: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_status?: string;
  payment_history?: unknown[];
  is_editable?: boolean;
  notes?: string;
  transaction_date: string;
  created_at: string;
  updated_at?: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  items?: SaleItem[];
}

// Use a flexible type to accept the Sale type from SalesReport
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SaleFromReport = any;

interface EditSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: SaleFromReport | null;
  onSuccess?: () => void;
}

interface NewSaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  open,
  onOpenChange,
  sale,
  onSuccess,
}) => {
  const { currentStore } = useAuth();
  const { formatCurrency } = useSystem();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saleData, setSaleData] = useState<SaleFromReport | null>(null);
  const [notes, setNotes] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [newItems, setNewItems] = useState<NewSaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemsToRemove, setItemsToRemove] = useState<string[]>([]);

  const { data: products = [], isLoading: productsLoading } = useStoreProducts(
    currentStore?.id || '',
    { enabled: open && !!currentStore?.id }
  );

  useEffect(() => {
    if (sale && open) {
      setLoading(true);
      fetch(`/api/sales/${sale.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.sale) {
            setSaleData(data.sale);
            setNotes(data.sale.notes || '');
            setDeliveryCost(data.sale.delivery_cost || 0);
            setNewItems([]);
            setItemsToRemove([]);
          }
        })
        .catch(error => {
          console.error('Error loading sale:', error);
          toast.error('Failed to load sale details');
        })
        .finally(() => setLoading(false));
    }
  }, [sale, open]);

  const addNewItem = () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    const product = products.find((p: Product) => p.id === selectedProductId);
    if (!product) return;

    if (product.stock_quantity < 1) {
      toast.error('Insufficient stock for this product');
      return;
    }

    setNewItems(prev => [...prev, {
      product_id: selectedProductId,
      quantity: 1,
      unit_price: product.price || 0,
      discount_amount: 0,
    }]);
    setSelectedProductId('');
  };

  const removeNewItem = (index: number) => {
    setNewItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateNewItem = (index: number, field: keyof NewSaleItem, value: number) => {
    setNewItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const markItemForRemoval = (itemId: string) => {
    setItemsToRemove(prev => [...prev, itemId]);
  };

  const unmarkItemForRemoval = (itemId: string) => {
    setItemsToRemove(prev => prev.filter(id => id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleData) return;

    try {
      setSubmitting(true);

      // Update sale notes and delivery cost
      const updateRes = await fetch(`/api/sales/${saleData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          delivery_cost: deliveryCost,
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok || !updateData.success) {
        throw new Error(updateData.error || 'Failed to update sale');
      }

      // Add new items if any
      if (newItems.length > 0) {
        const addItemsRes = await fetch(`/api/sales/${saleData.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: newItems,
          }),
        });

        const addItemsData = await addItemsRes.json();
        if (!addItemsRes.ok || !addItemsData.success) {
          throw new Error(addItemsData.error || 'Failed to add items');
        }
      }

      // Remove items if any
      if (itemsToRemove.length > 0) {
        // Note: We need to implement DELETE endpoint for sale items
        // For now, we'll just show a message
        toast.info('Item removal will be implemented in the API');
      }

      toast.success('Sale updated successfully');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update sale');
    } finally {
      setSubmitting(false);
    }
  };

  if (!sale) return null;

  const currentItems = (saleData as SaleFromReport)?.items?.filter((item: SaleItem) => !itemsToRemove.includes(item.id)) || [];
  const newItemsTotal = newItems.reduce((sum, item) => 
    sum + (item.unit_price * item.quantity) - item.discount_amount, 0
  );
  const currentSubtotal = currentItems.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
  const newSubtotal = currentSubtotal + newItemsTotal;
  const newTotal = newSubtotal + (saleData?.tax_amount || 0) + deliveryCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>
            Update sale details, add or remove items
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sale Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sale Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Receipt Number</Label>
                    <Input value={saleData?.receipt_number || ''} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div>
                      <Badge variant={saleData?.status === 'completed' ? 'default' : 'secondary'}>
                        {saleData?.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentItems.map((item: SaleItem) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        itemsToRemove.includes(item.id) ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}
                        </p>
                      </div>
                      {itemsToRemove.includes(item.id) ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => unmarkItemForRemoval(item.id)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => markItemForRemoval(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add New Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((p: Product) => p.is_active && (p.stock_quantity || 0) > 0)
                        .map((product: Product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.price || 0)} (Stock: {product.stock_quantity})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addNewItem} disabled={!selectedProductId}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {newItems.length > 0 && (
                  <div className="space-y-2">
                    {newItems.map((item, index) => {
                      const product = products.find((p: Product) => p.id === item.product_id);
                      return (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{product?.name || 'Product'}</p>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div>
                                <Label>Quantity</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max={product?.stock_quantity || 0}
                                  value={item.quantity}
                                  onChange={(e) => updateNewItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div>
                                <Label>Unit Price</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => updateNewItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <Label>Discount</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.discount_amount}
                                  onChange={(e) => updateNewItem(index, 'discount_amount', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Total: {formatCurrency((item.unit_price * item.quantity) - item.discount_amount)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNewItem(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes and Delivery Cost */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this sale"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Delivery Cost</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryCost}
                    onChange={(e) => setDeliveryCost(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(newSubtotal)}</span>
                </div>
                {(saleData?.tax_amount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(saleData?.tax_amount || 0)}</span>
                  </div>
                )}
                {deliveryCost > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>{formatCurrency(deliveryCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(newTotal)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

