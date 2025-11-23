'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/common/DataTable';
import { toast } from 'sonner';
import { Plus, CheckCircle, XCircle, Loader2, ArrowLeft, Package } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { SaleReturn, SaleReturnFormData, Sale, SaleItem } from '@/types';

export const SaleReturnManagement: React.FC = () => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);

  const [formData, setFormData] = useState<SaleReturnFormData>({
    sale_id: '',
    return_items: [],
    refund_method: 'cash',
    return_reason: '',
    notes: '',
  });

  // Load data
  useEffect(() => {
    loadData();
    const saleId = searchParams.get('sale_id');
    if (saleId) {
      loadSale(saleId);
      setFormData(prev => ({ ...prev, sale_id: saleId }));
      setShowDialog(true);
    }
  }, [currentStore?.id, searchParams]);

  const loadData = useCallback(async () => {
    if (!currentStore?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/sale-returns?store_id=${currentStore.id}`);
      const data = await res.json();
      setReturns(data.returns || []);
    } catch (error) {
      console.error('Error loading returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [currentStore?.id]);

  const loadSale = async (saleId: string) => {
    try {
      const res = await fetch(`/api/sales/${saleId}`);
      const data = await res.json();
      if (data.success && data.sale) {
        setSelectedSale(data.sale);
        // Pre-populate return items
        const returnItems = data.sale.items?.map((item: SaleItem) => ({
          sale_item_id: item.id,
          product_id: item.product_id,
          quantity_returned: 0,
          return_reason: '',
        })) || [];
        setFormData(prev => ({
          ...prev,
          sale_id: saleId,
          return_items: returnItems,
        }));
      }
    } catch (error) {
      console.error('Error loading sale:', error);
      toast.error('Failed to load sale details');
    }
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
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create sale return');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessReturn = async (returnId: string, status: 'completed' | 'cancelled') => {
    try {
      setProcessingReturn(returnId);

      const res = await fetch(`/api/sale-returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refund_status: status }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${status === 'completed' ? 'complete' : 'cancel'} return`);
      }

      toast.success(`Return ${status === 'completed' ? 'completed' : 'cancelled'} successfully`);
      loadData();
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process return');
    } finally {
      setProcessingReturn(null);
    }
  };

  const resetForm = () => {
    setFormData({
      sale_id: '',
      return_items: [],
      refund_method: 'cash',
      return_reason: '',
      notes: '',
    });
    setSelectedSale(null);
  };

  const updateReturnItem = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      return_items: prev.return_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const columns = [
    { key: 'return_number', label: 'Return #', sortable: true },
    { key: 'return_date', label: 'Date', sortable: true },
    {
      key: 'original_receipt',
      label: 'Original Sale',
      render: (ret: SaleReturn) => ret.sale?.receipt_number || 'N/A',
    },
    {
      key: 'total_return_amount',
      label: 'Amount',
      render: (ret: SaleReturn) => formatCurrency(ret.total_return_amount),
    },
    {
      key: 'refund_method',
      label: 'Refund Method',
    },
    {
      key: 'refund_status',
      label: 'Status',
      render: (ret: SaleReturn) => (
        <span className={`px-2 py-1 rounded text-xs ${
          ret.refund_status === 'completed' ? 'bg-green-100 text-green-800' :
          ret.refund_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {ret.refund_status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (ret: SaleReturn) => (
        <div className="flex gap-2">
          {ret.refund_status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProcessReturn(ret.id, 'completed')}
                disabled={processingReturn === ret.id}
              >
                {processingReturn === ret.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProcessReturn(ret.id, 'cancelled')}
                disabled={processingReturn === ret.id}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sale Returns</h1>
            <p className="text-muted-foreground">Process returns for completed sales</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Return
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Return History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Sale Returns"
              data={returns}
              columns={columns}
              searchable
              searchPlaceholder="Search returns..."
            />
          </CardContent>
        </Card>

        {/* Create Return Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Sale Return</DialogTitle>
              <DialogDescription>
                Return items from a completed sale
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Sale Receipt Number *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.sale_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, sale_id: e.target.value }));
                      if (e.target.value) {
                        loadSale(e.target.value);
                      }
                    }}
                    placeholder="Enter sale ID or receipt number"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Open sale selector
                      router.push('/app/sales?return_mode=true');
                    }}
                  >
                    Select Sale
                  </Button>
                </div>
              </div>

              {selectedSale && (
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Receipt:</span> {selectedSale.receipt_number}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(selectedSale.transaction_date || selectedSale.created_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> {formatCurrency(selectedSale.total_amount)}
                      </div>
                      <div>
                        <span className="font-medium">Customer:</span>{' '}
                        {selectedSale.customer?.name || 'Walk-in'}
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-2">
                    <Label>Items to Return *</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.return_items.map((returnItem, index) => {
                        const saleItem = selectedSale.items?.find((si: SaleItem) => si.id === returnItem.sale_item_id);
                        if (!saleItem) return null;

                        const maxQuantity = saleItem.quantity;
                        const availableToReturn = maxQuantity; // Could check existing returns

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
                        value={formatCurrency(
                          formData.return_items.reduce((sum, item) => {
                            const saleItem = selectedSale.items?.find(
                              (si: SaleItem) => si.id === item.sale_item_id
                            );
                            return sum + ((item.quantity_returned || 0) * (saleItem?.unit_price || 0));
                          }, 0)
                        )}
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
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !selectedSale}>
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
      </div>
    </DashboardLayout>
  );
};

