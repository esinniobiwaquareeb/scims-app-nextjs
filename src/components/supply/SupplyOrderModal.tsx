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
import { 
  Plus, 
  Minus, 
  X, 
  Search, 
  Package, 
  User, 
  Calendar,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateSupplyOrderData, SupplyCartItem } from '@/types/supply';
import { Product, Customer } from '@/types/product';

interface SupplyOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const SupplyOrderModal: React.FC<SupplyOrderModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { currentStore, user } = useAuth();
  const { formatCurrency, translate } = useSystem();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<SupplyCartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch products and customers
  useEffect(() => {
    if (open && currentStore?.id) {
      fetchProducts();
      fetchCustomers();
    }
  }, [open, currentStore?.id]);

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

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              total_price: (item.quantity + 1) * item.unit_price
            }
          : item
      ));
    } else {
      const newItem: SupplyCartItem = {
        product,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? {
            ...item,
            quantity,
            total_price: quantity * item.unit_price
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTax = () => {
    return 0; // You can implement tax calculation logic here
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (cart.length === 0) {
      toast.error('Please add items to the supply order');
      return;
    }

    if (!currentStore?.id || !user?.id) {
      toast.error('Missing required information');
      return;
    }

    setSubmitting(true);

    try {
      const supplyData: CreateSupplyOrderData = {
        store_id: currentStore.id,
        customer_id: selectedCustomer.id,
        cashier_id: user.id,
        notes,
        expected_return_date: expectedReturnDate || undefined,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity_supplied: item.quantity,
          unit_price: item.unit_price
        }))
      };

      const response = await fetch('/api/supply-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplyData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Supply order created successfully');
        onSuccess();
        handleClose();
      } else {
        toast.error(data.error || 'Failed to create supply order');
      }
    } catch (error) {
      console.error('Error creating supply order:', error);
      toast.error('Failed to create supply order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCart([]);
    setSelectedCustomer(null);
    setNotes('');
    setExpectedReturnDate('');
    setSearchTerm('');
    onOpenChange(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Supply Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Selection and Product Search */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer-search">Search Customer</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="customer-search"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {selectedCustomer && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">{selectedCustomer.name}</p>
                          <p className="text-sm text-green-600">{selectedCustomer.phone}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {customers
                      .filter(customer =>
                        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (customer.phone && customer.phone.includes(searchTerm))
                      )
                      .map((customer) => (
                        <div
                          key={customer.id}
                          className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                            selectedCustomer?.id === customer.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product-search">Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="product-search"
                        placeholder="Search by name, SKU, or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>SKU: {product.sku || 'N/A'}</span>
                            <span>Stock: {product.stock_quantity}</span>
                            <span>Price: {formatCurrency(product.price)}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={product.stock_quantity <= 0}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Cart and Order Details */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Supply Cart ({cart.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No items in cart
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.unit_price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expected-return-date">Expected Return Date</Label>
                  <Input
                    id="expected-return-date"
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(calculateTax())}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedCustomer || cart.length === 0 || submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Supply Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
