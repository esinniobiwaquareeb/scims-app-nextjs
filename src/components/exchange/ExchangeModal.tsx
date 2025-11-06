'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCcw,
  Package,
  Search,
  Plus,
  Minus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  ShoppingCart,
  DollarSign,
  Info,
  ArrowRight,
  Receipt,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  CreateExchangeTransactionData,
  CreateExchangeItemData,
  CreateExchangePurchaseItemData,
  ItemCondition,
  ExchangeTransactionType,
  ValidateReturnResponse,
  CalculateTradeInValueResponse
} from '@/types/exchange';
import type { Product, Customer } from '@/types';

interface ExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transactionType?: ExchangeTransactionType;
}

interface ExchangeItem extends CreateExchangeItemData {
  id: string;
  product_name?: string;
  product_sku?: string;
  product_barcode?: string;
  calculated_value?: number;
}

interface PurchaseItem extends CreateExchangePurchaseItemData {
  id: string;
  product_name?: string;
  product_sku?: string;
}

const CONDITION_OPTIONS: { value: ItemCondition; label: string; color: string; description: string }[] = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', description: 'Like new, no visible wear' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', description: 'Minor wear, fully functional' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', description: 'Visible wear, works well' },
  { value: 'damaged', label: 'Damaged', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', description: 'Visible damage, may need repair' },
  { value: 'defective', label: 'Defective', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', description: 'Not working, may not add to inventory' }
];

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  transactionType: initialTransactionType
}) => {
  const { currentStore, user } = useAuth();
  const { formatCurrency } = useSystem();

  const [activeTab, setActiveTab] = useState<'return' | 'trade_in' | 'exchange'>(
    initialTransactionType === 'return' ? 'return' : 
    initialTransactionType === 'trade_in' ? 'trade_in' : 'exchange'
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Return validation
  const [receiptNumber, setReceiptNumber] = useState('');
  const [validatedSale, setValidatedSale] = useState<ValidateReturnResponse['sale'] | null>(null);
  const [validatingReturn, setValidatingReturn] = useState(false);

  // Exchange items (returned/trade-in)
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [currentExchangeItem, setCurrentExchangeItem] = useState<Partial<ExchangeItem>>({
    item_type: 'returned',
    quantity: 1,
    condition: 'good',
    add_to_inventory: true
  });

  // Purchase items (new items being purchased)
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  // Transaction details
  const [notes, setNotes] = useState('');
  const [additionalPayment, setAdditionalPayment] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    if (open && currentStore?.id) {
      fetchCustomers();
      fetchProducts();
    }
  }, [open, currentStore?.id]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/customers?store_id=${currentStore?.id}`);
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?store_id=${currentStore?.id}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Validate return
  const handleValidateReturn = async () => {
    if (!receiptNumber.trim()) {
      toast.error('Please enter a receipt number');
      return;
    }

    setValidatingReturn(true);
    try {
      const response = await fetch('/api/exchanges/validate-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt_number: receiptNumber })
      });

      const data = await response.json();

      if (data.success && data.valid) {
        setValidatedSale(data.sale);
        toast.success('Receipt validated successfully');
        
        // Set customer if available
        if (data.sale.customer_id) {
          const customer = customers.find(c => c.id === data.sale.customer_id);
          if (customer) setSelectedCustomer(customer);
        }
      } else {
        toast.error(data.error || 'Invalid receipt number');
        setValidatedSale(null);
      }
    } catch (error) {
      console.error('Error validating return:', error);
      toast.error('Failed to validate return');
    } finally {
      setValidatingReturn(false);
    }
  };

  // Calculate trade-in value
  const handleCalculateTradeInValue = async (item: Partial<ExchangeItem> & { estimated_value?: number }) => {
    if (!item.condition || (!item.product_id && !item.product_name && !item.estimated_value)) {
      return;
    }

    try {
      const response = await fetch('/api/exchanges/calculate-tradein-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          condition: item.condition,
          estimated_value: item.estimated_value
        })
      });

      const data = await response.json();

      if (data.unit_value !== undefined) {
        return data.unit_value;
      }
    } catch (error) {
      console.error('Error calculating trade-in value:', error);
    }

    return 0;
  };

  // Add exchange item
  const handleAddExchangeItem = async () => {
    if (activeTab === 'return' && !validatedSale) {
      toast.error('Please validate the receipt first');
      return;
    }

    if (!currentExchangeItem.condition) {
      toast.error('Please select item condition');
      return;
    }

    if (!currentExchangeItem.quantity || currentExchangeItem.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    // For returns, link to original sale item
    if (activeTab === 'return' && validatedSale) {
      const saleItem = validatedSale.items?.find(
        (item: { product_id: string }) => item.product_id === currentExchangeItem.product_id
      );

      if (!saleItem) {
        toast.error('Product not found in original sale');
        return;
      }

      if (currentExchangeItem.quantity > saleItem.quantity) {
        toast.error(`Cannot return more than ${saleItem.quantity} items`);
        return;
      }

      // For returns, default to original price but allow manual override
      const returnValue = currentExchangeItem.unit_value || saleItem.unit_price;
      
      const newItem: ExchangeItem = {
        id: Date.now().toString(),
        item_type: 'returned',
        original_sale_item_id: saleItem.id,
        product_id: saleItem.product_id,
        quantity: currentExchangeItem.quantity,
        unit_value: returnValue,
        condition: currentExchangeItem.condition!,
        condition_notes: currentExchangeItem.condition_notes,
        add_to_inventory: currentExchangeItem.add_to_inventory !== false
      };

      setExchangeItems([...exchangeItems, newItem]);
    } else {
      // Trade-in item
      if (!currentExchangeItem.product_id && !currentExchangeItem.product_name) {
        toast.error('Please select or enter product details');
        return;
      }

      // Require manual value entry
      if (!currentExchangeItem.unit_value || currentExchangeItem.unit_value <= 0) {
        toast.error('Please enter the trade-in value');
        return;
      }

      const newItem: ExchangeItem = {
        id: Date.now().toString(),
        item_type: 'trade_in',
        product_id: currentExchangeItem.product_id,
        product_name: currentExchangeItem.product_name,
        product_sku: currentExchangeItem.product_sku,
        product_barcode: currentExchangeItem.product_barcode,
        quantity: currentExchangeItem.quantity!,
        unit_value: currentExchangeItem.unit_value,
        condition: currentExchangeItem.condition!,
        condition_notes: currentExchangeItem.condition_notes,
        add_to_inventory: currentExchangeItem.add_to_inventory !== false
      };

      setExchangeItems([...exchangeItems, newItem]);
    }

    // Reset form
    setCurrentExchangeItem({
      item_type: activeTab === 'return' ? 'returned' : 'trade_in',
      quantity: 1,
      condition: 'good',
      add_to_inventory: true,
      unit_value: undefined
    });
  };

  // Add purchase item
  const handleAddPurchaseItem = () => {
    if (!selectedProductForPurchase) {
      toast.error('Please select a product');
      return;
    }

    if (purchaseQuantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (selectedProductForPurchase.stock_quantity < purchaseQuantity) {
      toast.error(`Only ${selectedProductForPurchase.stock_quantity} items available in stock`);
      return;
    }

    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      product_id: selectedProductForPurchase.id,
      quantity: purchaseQuantity,
      unit_price: selectedProductForPurchase.price,
      discount_amount: 0,
      product_name: selectedProductForPurchase.name,
      product_sku: selectedProductForPurchase.sku
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setSelectedProductForPurchase(null);
    setPurchaseQuantity(1);
  };

  // Remove items
  const handleRemoveExchangeItem = (id: string) => {
    setExchangeItems(exchangeItems.filter(item => item.id !== id));
  };

  const handleRemovePurchaseItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
  };

  // Calculate totals
  const tradeInTotalValue = exchangeItems.reduce(
    (sum, item) => sum + (item.quantity * item.unit_value),
    0
  );

  const totalPurchaseAmount = purchaseItems.reduce(
    (sum, item) => sum + (item.quantity * item.unit_price) - (item.discount_amount || 0),
    0
  );

  const balance = totalPurchaseAmount - tradeInTotalValue;

  // Submit transaction
  const handleSubmit = async () => {
    if (exchangeItems.length === 0) {
      toast.error('Please add at least one item to return or trade in');
      return;
    }

    if (!currentStore?.id || !user?.id) {
      toast.error('Missing required information');
      return;
    }

    if (activeTab === 'return' && !validatedSale) {
      toast.error('Please validate the receipt first');
      return;
    }

    if (purchaseItems.length > 0 && balance > 0 && additionalPayment < balance) {
      toast.error(`Additional payment required: ${formatCurrency(balance)}`);
      return;
    }

    setSubmitting(true);

    try {
      const transactionData: CreateExchangeTransactionData = {
        store_id: currentStore.id,
        customer_id: selectedCustomer?.id,
        transaction_type: activeTab === 'return' ? 'return' : activeTab === 'trade_in' ? 'trade_in' : 'exchange',
        original_sale_id: validatedSale?.id,
        exchange_items: exchangeItems.map(item => ({
          item_type: item.item_type,
          original_sale_item_id: item.original_sale_item_id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          product_barcode: item.product_barcode,
          quantity: item.quantity,
          unit_value: item.unit_value,
          condition: item.condition,
          condition_notes: item.condition_notes,
          add_to_inventory: item.add_to_inventory
        })),
        purchase_items: purchaseItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount
        })),
        trade_in_total_value: tradeInTotalValue,
        additional_payment: balance > 0 ? balance : 0,
        notes
      };

      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(transactionData)
      });

      const data = await response.json();

      if (data.success) {
        // Complete transaction to trigger stock restoration
        const completeResponse = await fetch(`/api/exchanges/${data.transaction.id}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify({
            process_refund: activeTab === 'return',
            refund_method: 'cash',
            create_sale: purchaseItems.length > 0
          })
        });

        const completeData = await completeResponse.json();

        if (completeData.success) {
          toast.success('Transaction completed successfully');
          handleClose();
          onSuccess();
        } else {
          toast.error(completeData.error || 'Failed to complete transaction');
        }
      } else {
        toast.error(data.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating exchange transaction:', error);
      toast.error('Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveTab(initialTransactionType === 'return' ? 'return' : 
                 initialTransactionType === 'trade_in' ? 'trade_in' : 'exchange');
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    setProductSearchTerm('');
    setReceiptNumber('');
    setValidatedSale(null);
    setExchangeItems([]);
    setPurchaseItems([]);
    setCurrentExchangeItem({
      item_type: 'returned',
      quantity: 1,
      condition: 'good',
      add_to_inventory: true
    });
    setNotes('');
    setAdditionalPayment(0);
    onOpenChange(false);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(customerSearchTerm))
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.barcode?.includes(productSearchTerm)
  );

  // Determine current step for better UX
  const getCurrentStep = () => {
    if (activeTab === 'return' && !validatedSale) return 1;
    if (exchangeItems.length === 0) return 2;
    if (purchaseItems.length === 0 && balance <= 0) return 3;
    return 4;
  };

  const currentStep = getCurrentStep();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <RefreshCcw className="h-6 w-6" />
            Exchange & Trade-In
          </DialogTitle>
          <DialogDescription className="text-base">
            Process customer returns, trade-ins, or exchanges. Follow the steps below to complete the transaction.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
            }`}>
              {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Step 1: Select Transaction Type</p>
              <p className="text-xs text-muted-foreground">Choose return, trade-in, or exchange</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
            }`}>
              {currentStep > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Step 2: Add Items</p>
              <p className="text-xs text-muted-foreground">Add items to return or trade in</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
            }`}>
              {currentStep > 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Step 3: Review & Complete</p>
              <p className="text-xs text-muted-foreground">Review summary and complete transaction</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'return' | 'trade_in' | 'exchange')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="return" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Return
            </TabsTrigger>
            <TabsTrigger value="trade_in" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Trade-In
            </TabsTrigger>
            <TabsTrigger value="exchange" className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Exchange
            </TabsTrigger>
          </TabsList>

          <TabsContent value="return" className="space-y-4 mt-0">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Customer Return:</strong> Customer is returning an item they purchased from your store. You&apos;ll need the original receipt to process the return.
              </AlertDescription>
            </Alert>

            {/* Return Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Step 1: Validate Receipt
                </CardTitle>
                <CardDescription>
                  Enter the receipt number from the original purchase to validate the return
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="receipt-number">Receipt Number *</Label>
                    <Input
                      id="receipt-number"
                      placeholder="Enter receipt number (e.g., RCP-20240101-ABC123)"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleValidateReturn()}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleValidateReturn}
                      disabled={validatingReturn || !receiptNumber.trim()}
                      size="lg"
                    >
                      {validatingReturn ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Validate Receipt
                    </Button>
                  </div>
                </div>

                {validatedSale && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="font-semibold text-green-800 dark:text-green-200">Receipt Validated Successfully</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Receipt:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">{validatedSale.receipt_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Purchase Date:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {new Date(validatedSale.transaction_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                        <p className="font-medium text-green-800 dark:text-green-200 mb-2">Items Purchased:</p>
                        <div className="space-y-1">
                          {validatedSale.items?.map((item: { id: string; product_name?: string; quantity: number; unit_price: number }) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-green-700 dark:text-green-300">
                                {item.product_name} (Qty: {item.quantity})
                              </span>
                              <span className="font-medium text-green-800 dark:text-green-200">
                                {formatCurrency(item.unit_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Return Item */}
            {validatedSale && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Step 2: Add Item to Return
                  </CardTitle>
                  <CardDescription>
                    Select the item from the original purchase and set its condition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="return-product">Select Product *</Label>
                      <Select
                        value={currentExchangeItem.product_id || ''}
                        onValueChange={(value) => {
                          const product = validatedSale.items?.find(
                            (item: { product_id: string; product_name?: string }) => item.product_id === value
                          );
                          setCurrentExchangeItem({
                            ...currentExchangeItem,
                            product_id: value,
                            product_name: product?.product_name,
                            unit_value: product?.unit_price // Pre-fill with original price
                          });
                        }}
                      >
                        <SelectTrigger id="return-product">
                          <SelectValue placeholder="Choose product from receipt" />
                        </SelectTrigger>
                        <SelectContent>
                          {validatedSale.items?.map((item: { id: string; product_id: string; product_name?: string; quantity: number }) => (
                            <SelectItem key={item.id} value={item.product_id}>
                              {item.product_name} (Available: {item.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="return-quantity">Quantity to Return *</Label>
                      <Input
                        id="return-quantity"
                        type="number"
                        min="1"
                        value={currentExchangeItem.quantity || 1}
                        onChange={(e) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          quantity: parseInt(e.target.value) || 1
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="return-condition">Item Condition *</Label>
                      <Select
                        value={currentExchangeItem.condition || 'good'}
                        onValueChange={(value) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          condition: value as ItemCondition
                        })}
                      >
                        <SelectTrigger id="return-condition">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <span>{opt.label}</span>
                                <span className="text-xs text-muted-foreground">({opt.description})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="return-inventory">Add Back to Inventory?</Label>
                      <Select
                        value={currentExchangeItem.add_to_inventory !== false ? 'true' : 'false'}
                        onValueChange={(value) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          add_to_inventory: value === 'true'
                        })}
                      >
                        <SelectTrigger id="return-inventory">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes - Add to stock</SelectItem>
                          <SelectItem value="false">No - Don&apos;t add to stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Usually &quot;Yes&quot; unless item is defective or damaged beyond repair
                      </p>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="return-value">
                        Refund Amount (Optional)
                        <HelpCircle className="inline h-3 w-3 ml-1 text-muted-foreground" />
                      </Label>
                      <Input
                        id="return-value"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Leave empty to refund full original price"
                        value={currentExchangeItem.unit_value || ''}
                        onChange={(e) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          unit_value: parseFloat(e.target.value) || undefined
                        })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Defaults to original purchase price. Enter a lower amount for partial refunds (e.g., damaged items).
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleAddExchangeItem} className="w-full" size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item to Return List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trade_in" className="space-y-4 mt-0">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Trade-In:</strong> Customer is bringing an item (not purchased from your store) to trade for credit toward new purchases. Enter the item details and trade-in value.
              </AlertDescription>
            </Alert>

            {/* Trade-in Item Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Step 1: Add Trade-In Item
                </CardTitle>
                <CardDescription>
                  Enter details about the item the customer wants to trade in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="tradein-product-search">Search Existing Product (Optional)</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="tradein-product-search"
                        placeholder="Search by name, SKU, or barcode..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {productSearchTerm && filteredProducts.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-background">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setCurrentExchangeItem({
                                ...currentExchangeItem,
                                product_id: product.id,
                                product_name: product.name,
                                product_sku: product.sku,
                                product_barcode: product.barcode
                              });
                              setProductSearchTerm('');
                            }}
                          >
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku || 'N/A'} | Price: {formatCurrency(product.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="tradein-product-name">Product Name *</Label>
                    <Input
                      id="tradein-product-name"
                      placeholder="Enter product name (e.g., iPhone 12 Pro)"
                      value={currentExchangeItem.product_name || ''}
                      onChange={(e) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        product_name: e.target.value,
                        product_id: undefined
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If product doesn&apos;t exist in system, it will be created automatically
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tradein-sku">SKU (Optional)</Label>
                    <Input
                      id="tradein-sku"
                      placeholder="Product SKU"
                      value={currentExchangeItem.product_sku || ''}
                      onChange={(e) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        product_sku: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tradein-barcode">Barcode (Optional)</Label>
                    <Input
                      id="tradein-barcode"
                      placeholder="Product barcode"
                      value={currentExchangeItem.product_barcode || ''}
                      onChange={(e) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        product_barcode: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tradein-quantity">Quantity *</Label>
                    <Input
                      id="tradein-quantity"
                      type="number"
                      min="1"
                      value={currentExchangeItem.quantity || 1}
                      onChange={(e) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        quantity: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tradein-condition">Item Condition *</Label>
                    <Select
                      value={currentExchangeItem.condition || 'good'}
                      onValueChange={(value) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        condition: value as ItemCondition
                      })}
                    >
                      <SelectTrigger id="tradein-condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <span>{opt.label}</span>
                              <span className="text-xs text-muted-foreground">({opt.description})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="tradein-value" className="flex items-center gap-2">
                      Trade-In Value *
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="tradein-value"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter trade-in value (e.g., 5000.00)"
                          value={currentExchangeItem.unit_value || ''}
                          onChange={(e) => setCurrentExchangeItem({
                            ...currentExchangeItem,
                            unit_value: parseFloat(e.target.value) || undefined
                          })}
                          className="pl-10"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={async () => {
                          const calculatedValue = await handleCalculateTradeInValue(currentExchangeItem);
                          if (calculatedValue > 0) {
                            setCurrentExchangeItem({
                              ...currentExchangeItem,
                              unit_value: calculatedValue
                            });
                            toast.success(`Suggested value: ${formatCurrency(calculatedValue)}`);
                          } else {
                            toast.info('Could not calculate automatically. Please enter value manually.');
                          }
                        }}
                        disabled={!currentExchangeItem.condition || (!currentExchangeItem.product_id && !currentExchangeItem.product_name)}
                        title="Get suggested value based on condition"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Suggest Value
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Enter the trade-in value manually. Use &quot;Suggest Value&quot; for an estimated value based on condition (optional).
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tradein-inventory">Add to Inventory?</Label>
                    <Select
                      value={currentExchangeItem.add_to_inventory !== false ? 'true' : 'false'}
                      onValueChange={(value) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        add_to_inventory: value === 'true'
                      })}
                    >
                      <SelectTrigger id="tradein-inventory">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes - Add to stock</SelectItem>
                        <SelectItem value="false">No - Don&apos;t add to stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAddExchangeItem} className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trade-In Item
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchange" className="space-y-4 mt-0">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Exchange:</strong> Customer is returning an item AND purchasing new items in the same transaction. 
                First, process the return using the &quot;Return&quot; tab, then add new purchase items below.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>How to Process an Exchange</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Switch to &quot;Return&quot; tab</p>
                      <p className="text-sm text-muted-foreground">Validate the receipt and add the item being returned</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Add new purchase items</p>
                      <p className="text-sm text-muted-foreground">Scroll down to &quot;New Items to Purchase&quot; section and add items the customer wants to buy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Review and complete</p>
                      <p className="text-sm text-muted-foreground">Check the transaction summary and complete the exchange</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Customer Selection - More Prominent */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
              {selectedCustomer && <Badge variant="default" className="ml-auto">{selectedCustomer.name}</Badge>}
            </CardTitle>
            <CardDescription>
              {selectedCustomer 
                ? `Customer selected: ${selectedCustomer.name}${selectedCustomer.phone ? ` - ${selectedCustomer.phone}` : ''}`
                : 'Search for existing customer or leave blank for walk-in customer'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="Search customers by name or phone..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="w-full"
              />
              {customerSearchTerm && filteredCustomers.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md bg-background">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearchTerm('');
                      }}
                    >
                      <p className="font-medium text-sm">{customer.name}</p>
                      {customer.phone && (
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {customerSearchTerm && filteredCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">No customers found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exchange Items List - Improved Display */}
        {exchangeItems.length > 0 && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items Being Returned/Traded In
                <Badge variant="secondary" className="ml-auto">{exchangeItems.length} item(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exchangeItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-base">
                          {item.product_name || 'Unknown Product'}
                        </p>
                        <Badge className={CONDITION_OPTIONS.find(o => o.value === item.condition)?.color}>
                          {CONDITION_OPTIONS.find(o => o.value === item.condition)?.label}
                        </Badge>
                        {item.item_type === 'returned' && (
                          <Badge variant="outline">Return</Badge>
                        )}
                        {item.item_type === 'trade_in' && (
                          <Badge variant="outline">Trade-In</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Quantity: <span className="font-medium">{item.quantity}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Value: <span className="font-medium">{formatCurrency(item.unit_value)}</span> each
                        </span>
                        <span className="font-semibold text-primary">
                          Total: {formatCurrency(item.quantity * item.unit_value)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExchangeItem(item.id)}
                      className="ml-4"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Trade-In/Return Value:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(tradeInTotalValue)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Items - Improved */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              New Items to Purchase
              {purchaseItems.length > 0 && (
                <Badge variant="secondary" className="ml-auto">{purchaseItems.length} item(s)</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {purchaseItems.length === 0 
                ? 'Add items the customer wants to purchase. This is optional for returns and trade-ins.'
                : 'Items the customer is purchasing in this transaction'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="purchase-product-search">Search Product</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="purchase-product-search"
                    placeholder="Search by name, SKU, or barcode..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {productSearchTerm && filteredProducts.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-background">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedProductForPurchase(product);
                          setProductSearchTerm('');
                        }}
                      >
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock_quantity} | Price: {formatCurrency(product.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {selectedProductForPurchase && (
                  <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
                    <p className="text-sm font-medium">Selected: {selectedProductForPurchase.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Price: {formatCurrency(selectedProductForPurchase.price)} | 
                      Stock: {selectedProductForPurchase.stock_quantity}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="purchase-quantity">Quantity</Label>
                <Input
                  id="purchase-quantity"
                  type="number"
                  min="1"
                  max={selectedProductForPurchase?.stock_quantity || 999}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <Button 
              onClick={handleAddPurchaseItem} 
              className="w-full" 
              size="lg"
              disabled={!selectedProductForPurchase}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Purchase List
            </Button>

            {purchaseItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-medium mb-2">Purchase Items:</p>
                {purchaseItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePurchaseItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Purchase Amount:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(totalPurchaseAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary - More Prominent */}
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-6 w-6" />
              Transaction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                <span className="text-base font-medium">Total Return/Trade-In Value:</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(tradeInTotalValue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                <span className="text-base font-medium">Total Purchase Amount:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalPurchaseAmount)}
                </span>
              </div>
              <div className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                balance > 0 
                  ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
                  : balance < 0 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-muted border-muted-foreground/20'
              }`}>
                <span className="text-lg font-semibold">
                  {balance > 0 ? 'Customer Pays:' : balance < 0 ? 'Store Credit:' : 'Balance:'}
                </span>
                <span className={`text-2xl font-bold ${
                  balance > 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : balance < 0 
                    ? 'text-green-600 dark:text-green-400'
                    : ''
                }`}>
                  {balance > 0 
                    ? `+${formatCurrency(balance)}` 
                    : formatCurrency(Math.abs(balance))
                  }
                </span>
              </div>
            </div>

            {balance > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Label htmlFor="additional-payment" className="text-base font-semibold mb-2 block">
                  Additional Payment Received
                </Label>
                <Input
                  id="additional-payment"
                  type="number"
                  step="0.01"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(parseFloat(e.target.value) || 0)}
                  placeholder={formatCurrency(balance)}
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the amount the customer is paying. Required: {formatCurrency(balance)}
                </p>
              </div>
            )}

            {balance < 0 && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Customer has a credit of {formatCurrency(Math.abs(balance))}. This can be applied to future purchases or refunded.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="transaction-notes">Transaction Notes (Optional)</Label>
              <Textarea
                id="transaction-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this transaction..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting} size="lg">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || exchangeItems.length === 0}
            size="lg"
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Transaction
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
