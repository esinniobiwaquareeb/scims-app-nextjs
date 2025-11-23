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
import { ArrowRight, Package, Loader2, Plus } from 'lucide-react';
import type { StockTransfer, StockTransferFormData, Store, Product } from '@/types';

export const StockTransferManagement: React.FC = () => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();

  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState<StockTransferFormData>({
    from_store_id: currentStore?.id || '',
    to_store_id: '',
    product_id: '',
    quantity: 1,
    notes: '',
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [currentBusiness?.id]);

  const loadData = useCallback(async () => {
    if (!currentBusiness?.id) return;

    try {
      setLoading(true);

      // Load stores
      const storesRes = await fetch(`/api/businesses/${currentBusiness.id}/stores`);
      const storesData = await storesRes.json();
      setStores(storesData.stores || []);

      // Load transfers
      const transfersRes = await fetch(`/api/stock-transfers?business_id=${currentBusiness.id}`);
      const transfersData = await transfersRes.json();
      setTransfers(transfersData.transfers || []);

      // Load products from current store
      if (currentStore?.id) {
        const productsRes = await fetch(`/api/products?store_id=${currentStore.id}`);
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id, currentStore?.id]);

  // Load products when from_store changes
  const loadProductsForStore = useCallback(async (storeId: string) => {
    try {
      const res = await fetch(`/api/products?store_id=${storeId}`);
      const data = await res.json();
      setProducts(data.products || []);
      setFormData(prev => ({ ...prev, product_id: '' }));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.from_store_id || !formData.to_store_id || !formData.product_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.from_store_id === formData.to_store_id) {
      toast.error('Source and destination stores must be different');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/stock-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create stock transfer');
      }

      toast.success('Stock transfer created successfully');
      setShowDialog(false);
      setFormData({
        from_store_id: currentStore?.id || '',
        to_store_id: '',
        product_id: '',
        quantity: 1,
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create stock transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTransfer = async (transferId: string) => {
    try {
      const res = await fetch(`/api/stock-transfers/${transferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete transfer');
      }

      toast.success('Stock transfer completed. Stock has been moved.');
      loadData();
    } catch (error) {
      console.error('Error completing transfer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete transfer');
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const availableStock = selectedProduct?.stock_quantity || 0;

  const columns = [
    { key: 'transfer_date', label: 'Date', sortable: true },
    { key: 'product_name', label: 'Product', render: (transfer: StockTransfer) => transfer.product?.name || 'N/A' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'from_store_name', label: 'From', render: (transfer: StockTransfer) => transfer.from_store?.name || 'N/A' },
    { key: 'to_store_name', label: 'To', render: (transfer: StockTransfer) => transfer.to_store?.name || 'N/A' },
    {
      key: 'status',
      label: 'Status',
      render: (transfer: StockTransfer) => (
        <span className={`px-2 py-1 rounded text-xs ${
          transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
          transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          transfer.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {transfer.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (transfer: StockTransfer) => (
        <div className="flex gap-2">
          {transfer.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleCompleteTransfer(transfer.id)}
              variant="outline"
            >
              Complete
            </Button>
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
            <h1 className="text-3xl font-bold">Stock Transfer</h1>
            <p className="text-muted-foreground">Move stock between stores</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Stock Transfers"
              data={transfers}
              columns={columns}
              searchable
              searchPlaceholder="Search transfers..."
            />
          </CardContent>
        </Card>

        {/* Create Transfer Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Transfer</DialogTitle>
              <DialogDescription>
                Move stock from one store to another
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Store *</Label>
                  <Select
                    value={formData.from_store_id}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, from_store_id: value, product_id: '' }));
                      loadProductsForStore(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.filter(s => s.is_active).map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>To Store *</Label>
                  <Select
                    value={formData.to_store_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, to_store_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores
                        .filter(s => s.is_active && s.id !== formData.from_store_id)
                        .map(store => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                  disabled={!formData.from_store_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(p => p.is_active && p.stock_quantity > 0)
                      .map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock_quantity})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground">
                    Available stock: {availableStock} {selectedProduct.unit || 'units'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes about this transfer"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Create Transfer
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

