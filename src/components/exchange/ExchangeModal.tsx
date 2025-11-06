'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DollarSign
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

const CONDITION_OPTIONS: { value: ItemCondition; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'damaged', label: 'Damaged', color: 'bg-orange-100 text-orange-800' },
  { value: 'defective', label: 'Defective', color: 'bg-red-100 text-red-800' }
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
        toast.success('Sale validated successfully');
        
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

      const data: CalculateTradeInValueResponse = await response.json();

      if (data.success) {
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
      toast.error('Please validate the return first');
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

      // Require manual value entry - straightforward approach
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
      unit_value: undefined // Clear value for next item
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
      toast.error('Please add at least one exchange item');
      return;
    }

    if (!currentStore?.id || !user?.id) {
      toast.error('Missing required information');
      return;
    }

    if (activeTab === 'return' && !validatedSale) {
      toast.error('Please validate the return first');
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
          toast.success('Exchange transaction completed successfully');
          handleClose();
          onSuccess();
        } else {
          toast.error(completeData.error || 'Failed to complete transaction');
        }
      } else {
        toast.error(data.error || 'Failed to create exchange transaction');
      }
    } catch (error) {
      console.error('Error creating exchange transaction:', error);
      toast.error('Failed to create exchange transaction');
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" size="full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            Exchange / Trade-in Transaction
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'return' | 'trade_in' | 'exchange')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="return">Return</TabsTrigger>
            <TabsTrigger value="trade_in">Trade-in</TabsTrigger>
            <TabsTrigger value="exchange">Exchange</TabsTrigger>
          </TabsList>

          <TabsContent value="return" className="space-y-4">
            {/* Return Validation */}
            <Card>
              <CardHeader>
                <CardTitle>Validate Return</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter receipt number"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleValidateReturn}
                    disabled={validatingReturn || !receiptNumber.trim()}
                  >
                    {validatingReturn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Validate
                  </Button>
                </div>

                {validatedSale && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-800">Sale Validated</p>
                    </div>
                    <p className="text-sm text-green-700">
                      Receipt: {validatedSale.receipt_number} | 
                      Date: {new Date(validatedSale.transaction_date).toLocaleDateString()}
                    </p>
                    <div className="mt-2 space-y-1">
                      {validatedSale.items?.map((item: { id: string; product_name?: string; quantity: number; unit_price: number }) => (
                        <p key={item.id} className="text-sm text-green-700">
                          {item.product_name} - Qty: {item.quantity} @ {formatCurrency(item.unit_price)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Return Item */}
            {validatedSale && (
              <Card>
                <CardHeader>
                  <CardTitle>Return Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Product</Label>
                      <Select
                        value={currentExchangeItem.product_id || ''}
                        onValueChange={(value) => {
                          const product = validatedSale.items?.find(
                            (item: { product_id: string; product_name?: string }) => item.product_id === value
                          );
                          setCurrentExchangeItem({
                            ...currentExchangeItem,
                            product_id: value,
                            product_name: product?.product_name
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {validatedSale.items?.map((item: { id: string; product_id: string; product_name?: string; quantity: number }) => (
                            <SelectItem key={item.id} value={item.product_id}>
                              {item.product_name} (Qty: {item.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantity</Label>
                      <Input
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
                      <Label>Condition</Label>
                      <Select
                        value={currentExchangeItem.condition || 'good'}
                        onValueChange={(value) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          condition: value as ItemCondition
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Return Value (optional - defaults to original price)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Leave empty to use original price"
                        value={currentExchangeItem.unit_value || ''}
                        onChange={(e) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          unit_value: parseFloat(e.target.value) || undefined
                        })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a different value if refunding less than original price (e.g., for damaged items)
                      </p>
                    </div>

                    <div>
                      <Label>Add to Inventory</Label>
                      <Select
                        value={currentExchangeItem.add_to_inventory !== false ? 'true' : 'false'}
                        onValueChange={(value) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          add_to_inventory: value === 'true'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAddExchangeItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Return Item
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trade_in" className="space-y-4">
            {/* Trade-in Item Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Trade-in Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Search Product</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, SKU, or barcode"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {productSearchTerm && (
                      <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer"
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
                              {product.sku} | {formatCurrency(product.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Or Enter Product Details</Label>
                    <Input
                      placeholder="Product name"
                      value={currentExchangeItem.product_name || ''}
                      onChange={(e) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        product_name: e.target.value,
                        product_id: undefined
                      })}
                    />
                  </div>

                  <div>
                    <Label>SKU (optional)</Label>
                    <Input
                      placeholder="SKU"
                      value={currentExchangeItem.product_sku || ''}
                      onChange={(e) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        product_sku: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <Label>Barcode (optional)</Label>
                    <Input
                      placeholder="Barcode"
                      value={currentExchangeItem.product_barcode || ''}
                      onChange={(e) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        product_barcode: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input
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
                    <Label>Condition</Label>
                    <Select
                      value={currentExchangeItem.condition || 'good'}
                      onValueChange={(value) => setCurrentExchangeItem({
                        ...currentExchangeItem,
                        condition: value as ItemCondition
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label>Trade-in Value *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter value (e.g., 5000.00)"
                        value={currentExchangeItem.unit_value || ''}
                        onChange={(e) => setCurrentExchangeItem({
                          ...currentExchangeItem,
                          unit_value: parseFloat(e.target.value) || undefined
                        })}
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const calculatedValue = await handleCalculateTradeInValue(currentExchangeItem);
                          if (calculatedValue > 0) {
                            setCurrentExchangeItem({
                              ...currentExchangeItem,
                              unit_value: calculatedValue
                            });
                            toast.success(`Suggested value: ${formatCurrency(calculatedValue)}`);
                          } else {
                            toast.info('Could not auto-calculate. Please enter value manually.');
                          }
                        }}
                        disabled={!currentExchangeItem.condition || (!currentExchangeItem.product_id && !currentExchangeItem.product_name)}
                        title="Get suggested value based on condition"
                      >
                        <Search className="h-4 w-4" />
                        Suggest
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the trade-in value. Use &quot;Suggest&quot; for an estimated value based on condition.
                    </p>
                  </div>
                </div>

                <Button onClick={handleAddExchangeItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trade-in Item
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchange" className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p>Exchange combines return and trade-in.</p>
              <p>Use the Return tab to add returned items, then add new purchase items below.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="Search customers..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
              />
              {customerSearchTerm && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearchTerm('');
                      }}
                    >
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedCustomer && (
                <Badge variant="default" className="mt-2">
                  {selectedCustomer.name} {selectedCustomer.phone && `- ${selectedCustomer.phone}`}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exchange Items List */}
        {exchangeItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exchange Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exchangeItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.product_name || 'Unknown Product'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={CONDITION_OPTIONS.find(o => o.value === item.condition)?.color}>
                          {item.condition}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.unit_value)} = {formatCurrency(item.quantity * item.unit_value)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExchangeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-right font-semibold">
                    Total Trade-in Value: {formatCurrency(tradeInTotalValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              New Items to Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Search Product</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {productSearchTerm && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedProductForPurchase(product);
                          setProductSearchTerm('');
                        }}
                      >
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock_quantity} | {formatCurrency(product.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddPurchaseItem} className="w-full" disabled={!selectedProductForPurchase}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {purchaseItems.length > 0 && (
              <div className="mt-4 space-y-2">
                {purchaseItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
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
                  <p className="text-right font-semibold">
                    Total Purchase: {formatCurrency(totalPurchaseAmount)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Transaction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Trade-in Value:</span>
              <span className="font-semibold">{formatCurrency(tradeInTotalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Purchase Amount:</span>
              <span className="font-semibold">{formatCurrency(totalPurchaseAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Balance:</span>
              <span className={`font-bold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : ''}`}>
                {balance > 0 ? `+${formatCurrency(balance)}` : formatCurrency(Math.abs(balance))}
              </span>
            </div>
            {balance > 0 && (
              <div className="mt-4">
                <Label>Additional Payment Required</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(parseFloat(e.target.value) || 0)}
                  placeholder={formatCurrency(balance)}
                />
              </div>
            )}
            <div className="mt-4">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || exchangeItems.length === 0}>
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

