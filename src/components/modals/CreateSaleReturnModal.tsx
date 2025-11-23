'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Package } from 'lucide-react';
import type { SaleReturnFormData } from '@/types';

// Local Sale and SaleItem types to match SalesReport
interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    price?: number;
    stock_quantity?: number;
  };
}

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

interface CreateSaleReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: SaleFromReport | null;
  onSuccess?: () => void;
}

// Use a flexible type to accept the Sale type from SalesReport
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SaleFromReport = any;

export const CreateSaleReturnModal: React.FC<CreateSaleReturnModalProps> = ({
  open,
  onOpenChange,
  sale,
  onSuccess,
}) => {
  const { formatCurrency } = useSystem();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SaleReturnFormData>({
    sale_id: '',
    return_items: [],
    refund_method: 'cash',
    return_reason: '',
    notes: '',
  });

  useEffect(() => {
    if (sale && open) {
      // Pre-populate return items
      const returnItems = (sale as SaleFromReport).items?.map((item: SaleItem) => ({
        sale_item_id: item.id,
        product_id: item.product_id,
        quantity_returned: 0,
        return_reason: '',
      })) || [];
      setFormData({
        sale_id: sale.id,
        return_items: returnItems,
        refund_method: 'cash',
        return_reason: '',
        notes: '',
      });
    }
  }, [sale, open]);

  const updateReturnItem = (index: number, field: keyof typeof formData.return_items[0], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      return_items: prev.return_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sale_id || formData.return_items.length === 0) {
      toast.error('Please select a sale and add items to return');
      return;
    }

    const hasItemsToReturn = formData.return_items.some(item => item.quantity_returned > 0);
    if (!hasItemsToReturn) {
      toast.error('Please specify quantities to return');
      return;
    }

    try {
      setSubmitting(true);

      // Filter out items with 0 quantity
      const itemsToReturn = formData.return_items.filter(item => item.quantity_returned > 0);

      const res = await fetch('/api/sale-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          return_items: itemsToReturn,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create sale return');
      }

      toast.success('Sale return created successfully');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create sale return');
    } finally {
      setSubmitting(false);
    }
  };

  if (!sale) return null;

  const totalReturnAmount = formData.return_items.reduce((sum, item) => {
    const saleItem = (sale as SaleFromReport).items?.find((si: SaleItem) => si.id === item.sale_item_id);
    return sum + ((item.quantity_returned || 0) * (saleItem?.unit_price || 0));
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sale Return</DialogTitle>
          <DialogDescription>
            Return items from a completed sale
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {sale && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Receipt:</span> {sale.receipt_number}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(sale.transaction_date || sale.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {formatCurrency(sale.total_amount)}
                  </div>
                  <div>
                    <span className="font-medium">Customer:</span>{' '}
                    {sale.customer?.name || 'Walk-in'}
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <Label>Items to Return *</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {formData.return_items.map((returnItem, index) => {
                    const saleItem = (sale as SaleFromReport).items?.find((si: SaleItem) => si.id === returnItem.sale_item_id);
                    if (!saleItem) return null;

                    const maxQuantity = saleItem.quantity;
                    const availableToReturn = maxQuantity;

                    return (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-4">
                            <Label>{saleItem.product?.name || 'Product'}</Label>
                            <p className="text-sm text-muted-foreground">
                              Sold: {saleItem.quantity} @ {formatCurrency(saleItem.unit_price)}
                            </p>
                          </div>

                          <div className="col-span-3">
                            <Label>Quantity to Return</Label>
                            <Input
                              type="number"
                              min="1"
                              max={availableToReturn}
                              value={returnItem.quantity_returned}
                              onChange={(e) =>
                                updateReturnItem(index, 'quantity_returned', parseInt(e.target.value) || 0)
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Max: {availableToReturn}
                            </p>
                          </div>

                          <div className="col-span-3">
                            <Label>Return Amount</Label>
                            <Input
                              value={formatCurrency(
                                (returnItem.quantity_returned || 0) * saleItem.unit_price
                              )}
                              disabled
                              className="bg-muted"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label>Reason</Label>
                            <Input
                              value={returnItem.return_reason || ''}
                              onChange={(e) =>
                                updateReturnItem(index, 'return_reason', e.target.value)
                              }
                              placeholder="Reason"
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Refund Method *</Label>
                  <Select
                    value={formData.refund_method}
                    onValueChange={(value: string) =>
                      setFormData(prev => ({ ...prev, refund_method: value as SaleReturnFormData['refund_method'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                      <SelectItem value="exchange">Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Total Return Amount</Label>
                  <Input
                    value={formatCurrency(totalReturnAmount)}
                    disabled
                    className="bg-muted font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Return Reason</Label>
                <Textarea
                  value={formData.return_reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, return_reason: e.target.value }))}
                  placeholder="General reason for return (optional)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes (optional)"
                  rows={2}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !sale}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Create Return
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

