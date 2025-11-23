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
import { Plus, Mail, Edit, Trash2, FileText, Loader2, Send, CheckCircle } from 'lucide-react';
import type { Quotation, QuotationFormData, Product } from '@/types';

export const QuotationManagement: React.FC = () => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const [formData, setFormData] = useState<QuotationFormData>({
    business_id: currentBusiness?.id || '',
    store_id: currentStore?.id || undefined,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    items: [],
    tax_amount: 0,
    discount_amount: 0,
    notes: '',
  });

  // Load data
  useEffect(() => {
    if (currentBusiness?.id) {
      loadData();
      loadProducts();
    }
  }, [currentBusiness?.id, currentStore?.id]);

  const loadData = useCallback(async () => {
    if (!currentBusiness?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/quotations?business_id=${currentBusiness.id}`);
      const data = await res.json();
      setQuotations(data.quotations || []);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id]);

  const loadProducts = useCallback(async () => {
    if (!currentStore?.id) return;

    try {
      const res = await fetch(`/api/products?store_id=${currentStore.id}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, [currentStore?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || formData.items.length === 0) {
      toast.error('Please fill in customer name and add at least one item');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create quotation');
      }

      toast.success('Quotation created successfully');
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = async (quotationId: string) => {
    try {
      const res = await fetch(`/api/quotations/${quotationId}/send`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send quotation');
      }

      toast.success('Quotation sent successfully');
      loadData();
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send quotation');
    }
  };

  const handleDelete = async (quotationId: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      const res = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete quotation');
      }

      toast.success('Quotation deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete quotation');
    }
  };

  const resetForm = () => {
    setFormData({
      business_id: currentBusiness?.id || '',
      store_id: currentStore?.id || undefined,
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      items: [],
      tax_amount: 0,
      discount_amount: 0,
      notes: '',
    });
    setSelectedQuotation(null);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        item_name: '',
        quantity: 1,
        unit_price: 0,
        is_custom_item: false,
      }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const total = subtotal + (formData.tax_amount || 0) - (formData.discount_amount || 0);
    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  const columns = [
    { key: 'quotation_number', label: 'Quotation #', sortable: true },
    { key: 'customer_name', label: 'Customer' },
    { key: 'total_amount', label: 'Total', render: (q: Quotation) => formatCurrency(q.total_amount) },
    {
      key: 'status',
      label: 'Status',
      render: (q: Quotation) => (
        <span className={`px-2 py-1 rounded text-xs ${
          q.status === 'accepted' ? 'bg-green-100 text-green-800' :
          q.status === 'sent' ? 'bg-blue-100 text-blue-800' :
          q.status === 'draft' ? 'bg-gray-100 text-gray-800' :
          q.status === 'rejected' ? 'bg-red-100 text-red-800' :
          q.status === 'converted' ? 'bg-purple-100 text-purple-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {q.status}
        </span>
      ),
    },
    { key: 'created_at', label: 'Created', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (q: Quotation) => (
        <div className="flex gap-2">
          {q.status === 'draft' && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleSend(q.id)}>
                <Send className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setSelectedQuotation(q);
                setShowDialog(true);
              }}>
                <Edit className="w-4 h-4" />
              </Button>
            </>
          )}
          {q.status === 'sent' && (
            <Button size="sm" variant="outline" onClick={() => handleSend(q.id)}>
              <Mail className="w-4 h-4" />
            </Button>
          )}
          {['draft', 'expired'].includes(q.status) && (
            <Button size="sm" variant="outline" onClick={() => handleDelete(q.id)}>
              <Trash2 className="w-4 h-4" />
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
            <h1 className="text-3xl font-bold">Quotations</h1>
            <p className="text-muted-foreground">Create and manage quotations</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Quotations"
              data={quotations}
              columns={columns}
              searchable
              searchPlaceholder="Search quotations..."
            />
          </CardContent>
        </Card>

        {/* Create/Edit Quotation Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedQuotation ? 'Edit Quotation' : 'Create Quotation'}</DialogTitle>
              <DialogDescription>
                Create a quotation with order details, tax, discounts, and bank account information
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Email</Label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Phone</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Address</Label>
                  <Input
                    value={formData.customer_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Items *</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Label>Item Name *</Label>
                          <Input
                            value={item.item_name}
                            onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                            placeholder="Product name or custom item"
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Total</Label>
                          <Input
                            value={(item.quantity * item.unit_price).toFixed(2)}
                            disabled
                            className="bg-muted"
                          />
                        </div>

                        <div className="col-span-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tax Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <Input
                    value={total.toFixed(2)}
                    disabled
                    className="bg-muted font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bank Account Info (JSON)</Label>
                <Textarea
                  value={JSON.stringify(formData.bank_account_info || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, bank_account_info: parsed }));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"bank_name": "Bank Name", "account_number": "1234567890", "account_name": "Account Name"}'
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Save Quotation
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

