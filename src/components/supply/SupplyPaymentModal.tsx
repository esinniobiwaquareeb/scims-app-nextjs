/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
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
  CreditCard, 
  DollarSign,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateSupplyPaymentData, SupplyOrderSummary, SupplyPayment } from '@/types/supply';

interface SupplyPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyOrder: SupplyOrderSummary;
  onSuccess: () => void;
}

export const SupplyPaymentModal: React.FC<SupplyPaymentModalProps> = ({
  open,
  onOpenChange,
  supplyOrder,
  onSuccess
}) => {
  const { user } = useAuth();
  const { formatCurrency } = useSystem();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'other'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [existingPayments, setExistingPayments] = useState<SupplyPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing payments
  useEffect(() => {
    if (open && supplyOrder.id) {
      fetchExistingPayments();
    }
  }, [open, supplyOrder.id]);

  const fetchExistingPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/supply-payments?supply_order_id=${supplyOrder.id}`);
      const data = await response.json();

      if (data.success) {
        setExistingPayments(data.supply_payments || []);
      } else {
        toast.error('Failed to fetch existing payments');
      }
    } catch (error) {
      console.error('Error fetching existing payments:', error);
      toast.error('Failed to fetch existing payments');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPaid = () => {
    return existingPayments.reduce((sum, payment) => sum + payment.amount_paid, 0);
  };

  const calculateRemainingAmount = () => {
    return supplyOrder.total_amount - calculateTotalPaid();
  };

  const handleSubmit = async () => {
    const amount = parseFloat(amountPaid);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (amount > calculateRemainingAmount()) {
      toast.error('Payment amount exceeds remaining balance');
      return;
    }

    setSubmitting(true);

    try {
      const paymentData: CreateSupplyPaymentData = {
        supply_order_id: supplyOrder.id,
        payment_method: paymentMethod,
        amount_paid: amount,
        notes
      };

      const response = await fetch('/api/supply-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment processed successfully');
        onSuccess();
        handleClose();
      } else {
        toast.error(data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmountPaid('');
    setNotes('');
    setPaymentMethod('cash');
    setExistingPayments([]);
    onOpenChange(false);
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

  const totalPaid = calculateTotalPaid();
  const remainingAmount = calculateRemainingAmount();

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading payment information...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment - {supplyOrder.supply_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supply Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Customer</p>
                  <p className="text-muted-foreground">{supplyOrder.customer_name}</p>
                </div>
                <div>
                  <p className="font-medium">Supply Date</p>
                  <p className="text-muted-foreground">
                    {new Date(supplyOrder.supply_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold">{formatCurrency(supplyOrder.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Remaining Balance:</span>
                  <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Payments */}
          {existingPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{payment.payment_number}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge className={getPaymentMethodColor(payment.payment_method)}>
                            {payment.payment_method.toUpperCase()}
                          </Badge>
                          <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(payment.amount_paid)}</p>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Payment */}
          {remainingAmount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>New Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile">Mobile Payment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount-paid">Amount to Pay</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="amount-paid"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingAmount}
                      placeholder="0.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum: {formatCurrency(remainingAmount)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="payment-notes">Payment Notes</Label>
                  <Textarea
                    id="payment-notes"
                    placeholder="Additional notes about this payment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Payment Amount:</span>
                    <span>{formatCurrency(parseFloat(amountPaid || '0'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Balance:</span>
                    <span className="font-bold">
                      {formatCurrency(remainingAmount - parseFloat(amountPaid || '0'))}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!amountPaid || parseFloat(amountPaid) <= 0 || submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    'Process Payment'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {remainingAmount <= 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-green-600 mb-2">
                  <CreditCard className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fully Paid</h3>
                <p className="text-muted-foreground">
                  This supply order has been fully paid.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
