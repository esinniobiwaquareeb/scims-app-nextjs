'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ShoppingCart, 
  Plus,
  Minus,
  CheckCircle,
  Loader2,
  Package,
  CreditCard,
  Truck,
  User,
  Receipt,
  ArrowRight,
  Info
} from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import { DiscountApplicationComponent } from '@/components/DiscountApplication';

interface Product {
  id: string;
  name: string;
  description: string;
  public_description?: string;
  price: number;
  image_url?: string;
  public_images?: string[];
  category?: { name: string };
  brand?: { name: string };
  store?: { name: string };
  stock_quantity: number;
  created_at: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Business {
  currency: { symbol: string; code: string };
}

interface ShoppingCartProps {
  cart: CartItem[];
  business: Business;
  businessId?: string;
  storeId?: string;
  appliedDiscount?: {
    type: 'coupon' | 'promotion';
    id: string;
    name: string;
    discount_amount: number;
    discount_type: string;
    discount_value: number;
    code?: string;
  } | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onOrder: () => void;
  isOrdering: boolean;
  orderSuccess: boolean;
  error: string;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  availablePaymentMethods: string[];
  onDiscountApplied: (discount: {
    type: 'coupon' | 'promotion';
    id: string;
    name: string;
    discount_amount: number;
    discount_type: string;
    discount_value: number;
    code?: string;
  } | null) => void;
}

export default function StorefrontCart({
  cart,
  business,
  businessId,
  storeId,
  appliedDiscount,
  onUpdateQuantity,
  onOrder,
  isOrdering,
  orderSuccess,
  error,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  customerAddress,
  setCustomerAddress,
  orderNotes,
  setOrderNotes,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  availablePaymentMethods,
  onDiscountApplied
}: ShoppingCartProps) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('cart');

  const getCartTotal = () => {
    const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const discountAmount = appliedDiscount?.discount_amount || 0;
    return subtotal - discountAmount;
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <Card className={`sticky top-8 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart ({cart.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <Package className={`w-12 h-12 mx-auto mb-3 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <p className={`${
              isDark ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Your cart is empty
            </p>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`}>
              Add some products to get started
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cart" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
              </TabsTrigger>
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Summary</span>
              </TabsTrigger>
            </TabsList>

            {/* Cart Items Tab */}
            <TabsContent value="cart" className="space-y-4 mt-4">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.product.name}
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {business.currency.symbol}{item.product.price.toLocaleString()} each
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Total: {business.currency.symbol}{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className={`w-8 text-center text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Discount Application */}
              {businessId && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <DiscountApplicationComponent
                    businessId={businessId}
                    storeId={storeId}
                    subtotal={getCartSubtotal()}
                    productIds={cart.map(item => item.product.id)}
                    onDiscountApplied={onDiscountApplied}
                    appliedDiscount={appliedDiscount}
                  />
                </div>
              )}

              {/* Navigation Hint */}
              <div className={`mt-4 p-3 rounded-lg border ${
                isDark ? 'bg-blue-950 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-2">
                  <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      Ready to checkout?
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Go to the <strong>Details</strong> tab to enter your information, then <strong>Summary</strong> to review and place your order.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => setActiveTab('customer')}
                    >
                      Continue to Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Customer Info Tab */}
            <TabsContent value="customer" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Delivery Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="orderNotes">Special Instructions</Label>
                  <Textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions or notes"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                {/* Payment Method Selection */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod}
                    onMethodChange={setSelectedPaymentMethod}
                    availableMethods={availablePaymentMethods}
                    disabled={isOrdering}
                  />
                </div>

                {/* Navigation Hint */}
                <div className={`mt-4 p-3 rounded-lg border ${
                  isDark ? 'bg-green-950 border-green-800' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-green-200' : 'text-green-900'
                      }`}>
                        {customerName && customerPhone && selectedPaymentMethod 
                          ? 'All set! Ready to place your order.'
                          : 'Almost there!'
                        }
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDark ? 'text-green-300' : 'text-green-700'
                      }`}>
                        {customerName && customerPhone && selectedPaymentMethod
                          ? 'Go to the Summary tab to review and place your order.'
                          : 'Please fill in all required fields (marked with *) to continue.'
                        }
                      </p>
                      {customerName && customerPhone && selectedPaymentMethod && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => setActiveTab('summary')}
                        >
                          Review Order <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Order Summary Tab */}
            <TabsContent value="summary" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Order Items Summary */}
                <div className={`border rounded-lg p-4 ${
                  isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Order Items ({cart.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                        <div className="flex-1">
                          <p className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.product.name}
                          </p>
                          <p className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {item.quantity} × {business.currency.symbol}{item.product.price.toLocaleString()}
                          </p>
                        </div>
                        <p className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {business.currency.symbol}{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className={`border rounded-lg p-4 ${
                  isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Price Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                        Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'}):
                      </span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                        {business.currency.symbol}{getCartSubtotal().toLocaleString()}
                      </span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount ({appliedDiscount.name}):</span>
                        <span>
                          -{business.currency.symbol}{appliedDiscount.discount_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className={`border-t pt-2 mt-2 ${
                      isDark ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-lg font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          Total:
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {business.currency.symbol}{getCartTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info Summary */}
                <div className={`border rounded-lg p-4 ${
                  isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    {customerName ? (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Name:</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{customerName}</span>
                      </div>
                    ) : (
                      <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ⚠️ Name is required
                      </p>
                    )}
                    {customerPhone ? (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Phone:</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{customerPhone}</span>
                      </div>
                    ) : (
                      <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ⚠️ Phone is required
                      </p>
                    )}
                    {customerEmail && (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Email:</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{customerEmail}</span>
                      </div>
                    )}
                    {customerAddress && (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Address:</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} text-right max-w-[60%]`}>{customerAddress}</span>
                      </div>
                    )}
                    {orderNotes && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Special Instructions:</p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{orderNotes}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Payment Method:</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedPaymentMethod === 'pay_on_delivery' ? 'Pay on Delivery' : 'Online Payment'}
                        </span>
                      </div>
                    </div>
                    {(!customerName || !customerPhone || !selectedPaymentMethod) && (
                      <div className={`mt-3 p-2 rounded text-xs ${
                        isDark ? 'bg-yellow-900/30 border border-yellow-800 text-yellow-300' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                      }`}>
                        Please go back to the <strong>Details</strong> tab to complete required information.
                      </div>
                    )}
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {orderSuccess && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Order placed successfully! You will receive a confirmation via WhatsApp.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Order Button */}
                <Button
                  onClick={onOrder}
                  disabled={isOrdering || cart.length === 0 || !customerName || !customerPhone || !selectedPaymentMethod}
                  className="w-full"
                  size="lg"
                >
                  {isOrdering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      {selectedPaymentMethod === 'pay_on_delivery' ? (
                        <Truck className="w-4 h-4 mr-2" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      {selectedPaymentMethod === 'pay_on_delivery' 
                        ? 'Place Order (Pay on Delivery)'
                        : 'Place Order (Online Payment)'
                      }
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
