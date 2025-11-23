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
import { Plus, Minus, Loader2, AlertTriangle, Package } from 'lucide-react';
import type { StockAdjustment, StockAdjustmentFormData, Product } from '@/types';

export const StockAdjustmentManagement: React.FC = () => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');

  const [formData, setFormData] = useState<StockAdjustmentFormData>({
    store_id: currentStore?.id || '',
    product_id: '',
    quantity_change: 0,
    reason: '',
    notes: '',
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [currentBusiness?.id, currentStore?.id]);

  const loadData = useCallback(async () => {
    if (!currentStore?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load products
      const productsRes = await fetch(`/api/products?store_id=${currentStore.id}`);
      if (!productsRes.ok) {
        throw new Error('Failed to load products');
      }
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);

      // Load adjustments
      const adjustmentsRes = await fetch(`/api/stock-adjustments?store_id=${currentStore.id}`);
      if (!adjustmentsRes.ok) {
        throw new Error('Failed to load adjustments');
      }
      const adjustmentsData = await adjustmentsRes.json();
      if (!adjustmentsData.success) {
        throw new Error(adjustmentsData.error || 'Failed to load adjustments');
      }
      setAdjustments(adjustmentsData.adjustments || []);
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentStore?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.store_id || !formData.product_id || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.quantity_change <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }

    if (!user?.id) {
      toast.error('User information not available');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate quantity change based on type
      const quantityChange = adjustmentType === 'increase'
        ? Math.abs(formData.quantity_change)
        : -Math.abs(formData.quantity_change);

      const res = await fetch('/api/stock-adjustments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          ...formData,
          quantity_change: quantityChange,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create stock adjustment');
      }

      toast.success('Stock adjustment created successfully');
      setShowDialog(false);
      setFormData({
        store_id: currentStore?.id || '',
        product_id: '',
        quantity_change: 0,
        reason: '',
        notes: '',
      });
      setAdjustmentType('increase');
      loadData();
    } catch (error) {
      console.error('Error creating adjustment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create stock adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (adjustmentId: string) => {
    if (!confirm('Are you sure you want to delete this adjustment? The stock change will be reversed.')) {
      return;
    }

    try {
      const res = await fetch(`/api/stock-adjustments/${adjustmentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete adjustment');
      }

      toast.success('Stock adjustment deleted and reversed');
      loadData();
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete adjustment');
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const currentStock = selectedProduct?.stock_quantity || 0;
  const newStock = adjustmentType === 'increase'
    ? currentStock + Math.abs(formData.quantity_change)
    : currentStock - Math.abs(formData.quantity_change);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const columns = [
    { 
      key: 'adjustment_date', 
      label: 'Date', 
      sortable: true,
      render: (adj: StockAdjustment) => formatDate(adj.adjustment_date),
    },
    { key: 'product_name', label: 'Product', render: (adj: StockAdjustment) => adj.product?.name || 'N/A' },
    {
      key: 'quantity_change',
      label: 'Change',
      render: (adj: StockAdjustment) => (
        <span className={adj.quantity_change > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
        </span>
      ),
    },
    { key: 'reason', label: 'Reason' },
    { key: 'created_by_name', label: 'Created By', render: (adj: StockAdjustment) => adj.created_by_user?.name || 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      render: (adj: StockAdjustment) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDelete(adj.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading stock adjustments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Adjustment</h1>
            <p className="text-muted-foreground">Rectify stock discrepancies with reason and date</p>
          </div>
          <Button onClick={() => setShowDialog(true)} disabled={!currentStore?.id}>
            <Plus className="w-4 h-4 mr-2" />
            New Adjustment
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadData()}
                  disabled={loading}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!currentStore?.id && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-yellow-800 text-sm">
                Please select a store to view and create stock adjustments.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Adjustment History</CardTitle>
          </CardHeader>
          <CardContent>
            {adjustments.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No stock adjustments found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first adjustment to get started
                </p>
              </div>
            ) : (
              <DataTable
                title="Stock Adjustments"
                data={adjustments}
                columns={columns}
                searchable
                searchPlaceholder="Search adjustments..."
              />
            )}
          </CardContent>
        </Card>

        {/* Create Adjustment Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Adjustment</DialogTitle>
              <DialogDescription>
                Adjust stock quantity to rectify discrepancies
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.is_active).map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Current: {product.stock_quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground">
                    Current stock: {currentStock} {selectedProduct.unit || 'units'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Adjustment Type *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={adjustmentType === 'increase' ? 'default' : 'outline'}
                    onClick={() => setAdjustmentType('increase')}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Increase
                  </Button>
                  <Button
                    type="button"
                    variant={adjustmentType === 'decrease' ? 'default' : 'outline'}
                    onClick={() => setAdjustmentType('decrease')}
                    className="flex-1"
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Decrease
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity_change}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity_change: parseInt(e.target.value) || 0 }))}
                  required
                />
                {selectedProduct && formData.quantity_change > 0 && (
                  <p className="text-sm text-muted-foreground">
                    New stock will be: {newStock} {selectedProduct.unit || 'units'}
                    {newStock < 0 && (
                      <span className="text-red-600 ml-2">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Warning: Stock will be negative!
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reason *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Stock count discrepancy, Damaged goods, Found inventory, etc."
                  rows={3}
                  required
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
                      <Plus className="w-4 h-4 mr-2" />
                      Create Adjustment
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

