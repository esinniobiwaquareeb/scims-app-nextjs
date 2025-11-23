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
import { Plus, Edit, Trash2, Loader2, DollarSign } from 'lucide-react';
import type { Expense, ExpenseFormData } from '@/types';

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Marketing',
  'Transportation',
  'Supplies',
  'Maintenance',
  'Insurance',
  'Taxes',
  'Other',
];

export const ExpenseManagement: React.FC = () => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState<ExpenseFormData>({
    business_id: currentBusiness?.id || '',
    store_id: currentStore?.id || undefined,
    category: '',
    amount: 0,
    description: '',
    payment_method: 'cash',
    notes: '',
  });

  // Load data
  useEffect(() => {
    if (currentBusiness?.id) {
      loadData();
    }
  }, [currentBusiness?.id]);

  const loadData = useCallback(async () => {
    if (!currentBusiness?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/expenses?business_id=${currentBusiness.id}`);
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || formData.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const url = selectedExpense
        ? `/api/expenses/${selectedExpense.id}`
        : '/api/expenses';
      const method = selectedExpense ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${selectedExpense ? 'update' : 'create'} expense`);
      }

      toast.success(`Expense ${selectedExpense ? 'updated' : 'created'} successfully`);
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete expense');
      }

      toast.success('Expense deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      business_id: currentBusiness?.id || '',
      store_id: currentStore?.id || undefined,
      category: '',
      amount: 0,
      description: '',
      payment_method: 'cash',
      notes: '',
    });
    setSelectedExpense(null);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const columns = [
    { key: 'expense_date', label: 'Date', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount', render: (exp: Expense) => formatCurrency(exp.amount) },
    { key: 'description', label: 'Description' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'store_name', label: 'Store', render: (exp: Expense) => exp.store?.name || 'Business Level' },
    { key: 'created_by_name', label: 'Created By', render: (exp: Expense) => exp.created_by_user?.name || 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      render: (exp: Expense) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedExpense(exp);
              setFormData({
                business_id: exp.business_id,
                store_id: exp.store_id || undefined,
                category: exp.category,
                amount: exp.amount,
                description: exp.description || '',
                payment_method: exp.payment_method,
                notes: exp.notes || '',
              });
              setShowDialog(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(exp.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
            <h1 className="text-3xl font-bold">Financial Expenses</h1>
            <p className="text-muted-foreground">Track business expenses</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Expense
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Expenses"
              data={expenses}
              columns={columns}
              searchable
              searchPlaceholder="Search expenses..."
            />
          </CardContent>
        </Card>

        {/* Create/Edit Expense Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedExpense ? 'Edit Expense' : 'Create Expense'}</DialogTitle>
              <DialogDescription>
                Record a financial expense for your business
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Expense description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value: string) =>
                      setFormData(prev => ({ ...prev, payment_method: value as ExpenseFormData['payment_method'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.expense_date ? new Date(formData.expense_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                  />
                </div>
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      {selectedExpense ? 'Update' : 'Create'} Expense
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

