/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { Card, CardContent } from '@/components/ui/card';
import { 
  useStoreProducts, 
  useStoreCustomers, 
  useStoreSales,
  useCreateCustomer,
  useSavedCarts,
  useSaveCart,
  useDeleteSavedCart,
  useBusinessSettings,
  useCategories
} from '@/utils/hooks/useStoreData';
import { 
  useOfflineCreateSale,
  useNetworkStatus
} from '@/utils/hooks/useOfflineData';
import { 
  ShoppingCart, 
  Activity,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Product, CartItem, Customer, Sale } from './types';

// Interface for creating a new sale (matches what the API expects)
interface SaleFormData {
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  receipt_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  cash_received?: number;
  change_given?: number;
  status: string;
  notes?: string;
  transaction_date: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    discount_amount: number;
  }>;
}

// Time display component to avoid hydration issues
const TimeDisplay = () => {
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return <span>{time}</span>;
};

// Import the smaller components
import { ProductGrid } from './ProductGrid';
import { ShoppingCart as ShoppingCartComponent } from './ShoppingCart';
import { SalesHistory } from './SalesHistory';
import { BarcodeScannerDialog } from './BarcodeScannerDialog';
import { CustomerSelectionDialog } from './CustomerSelectionDialog';
import { SaleDetailDialog } from './SaleDetailDialog';
import { SaveCartDialog } from './SaveCartDialog';
import { LoadSavedCartsDialog } from './LoadSavedCartsDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PointOfSaleProps {
  onBack: () => void;
  onSaleCompleted?: () => void;
}

// Default Walk-in Customer
const WALK_IN_CUSTOMER: Customer = {
  id: 'walk-in',
  name: 'Walk-in Customer',
  phone: '',
  email: '',
  created_at: new Date().toISOString()
};

// Utility function for floating point comparison
const isValidCashAmount = (cashAmount: string, total: number): boolean => {
  const cash = parseFloat(cashAmount);
  if (isNaN(cash)) return false;
  return cash >= (total - 0.001);
};

export const PointOfSale: React.FC<PointOfSaleProps> = ({ onBack, onSaleCompleted }) => {
  const { 
    currentStore, 
    currentBusiness, 
    user 
  } = useAuth();
  
  const { 
    translate, 
    formatCurrency, 
    playSound, 
    printReceipt,
    formatTime,
    formatDate,
    formatDateTime,
    getCurrentCurrency
  } = useSystem();
  
  // Get business settings to determine business type and features
  const { data: businessSettings } = useBusinessSettings(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });
  
  // Derive business type and features from settings
  const businessType = businessSettings?.business_type || 'retail';
  const isFeatureEnabled = (feature: string) => {
    if (!businessSettings) return false;
    
    switch (feature) {
      case 'stockTracking':
        return businessSettings.enable_stock_tracking || false;
      case 'inventoryAlerts':
        return businessSettings.enable_inventory_alerts || false;
      case 'restockManagement':
        return businessSettings.enable_restock_management || false;
      case 'recipeManagement':
        return businessSettings.enable_recipe_management || false;
      case 'serviceBooking':
        return businessSettings.enable_service_booking || false;
      case 'menuManagement':
        return businessSettings.enable_menu_management || false;
      case 'ingredientTracking':
        return businessSettings.enable_ingredient_tracking || false;
      default:
        return false;
    }
  };
  
  // Get POS features based on business type and enabled features
  const posFeatures = useMemo(() => {
    const features = [];
    
    if (isFeatureEnabled('stockTracking')) {
      features.push('stockTracking', 'inventoryAlerts', 'restockManagement');
    }
    
    if (isFeatureEnabled('recipeManagement')) {
      features.push('recipeManagement', 'menuManagement', 'ingredientTracking');
    }
    
    if (isFeatureEnabled('serviceBooking')) {
      features.push('serviceBooking');
    }
    
    return features;
  }, [businessSettings]);
  
  const { logActivity } = useActivityLogger();
  
  // Network status for offline awareness
  const { isOnline } = useNetworkStatus();
  
  // Create a translate wrapper that matches the expected signature
  const translateWrapper = useCallback((key: string, fallback?: string) => {
    return translate(key) || fallback || key;
  }, [translate]);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('pos');
  const [error, setError] = useState<string | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartSearchTerm, setCartSearchTerm] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(WALK_IN_CUSTOMER);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Modal states
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Time state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime] = useState(new Date());
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Save for later state
  const [showSavedCarts, setShowSavedCarts] = useState(false);
  const [showSaveCartDialog, setShowSaveCartDialog] = useState(false);
  
  // Success state for completed sales
  const [showSaleSuccess, setShowSaleSuccess] = useState(false);
  const [lastSaleInfo, setLastSaleInfo] = useState<any>(null);
  
  const storeConfig = useSystem().getStoreSettings(currentStore?.id || '');

  // Use React Query hooks for data fetching
  const {
    data: storeProducts = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useStoreProducts(currentStore?.id || '', { enabled: !!currentStore?.id });

  const {
    data: storeCustomers = [],
    isLoading: customersLoading
  } = useStoreCustomers(currentStore?.id || '', { enabled: !!currentStore?.id });

  const {
    data: allSales = [],
    isLoading: salesLoading,
    refetch: refetchSales
  } = useStoreSales(currentStore?.id || '', { enabled: !!currentStore?.id });

  const processSaleMutation = useOfflineCreateSale();
  const createCustomerMutation = useCreateCustomer(currentStore?.id || '');
  const saveCartMutation = useSaveCart(currentStore?.id || '');
  const deleteSavedCartMutation = useDeleteSavedCart();

  const {
    data: savedCarts = [],
    isLoading: savedCartsLoading,
    refetch: refetchSavedCarts
  } = useSavedCarts(currentStore?.id || '', user?.id || '', {
    enabled: !!currentStore?.id && !!user?.id
  });

  // Get categories for the business
  const { data: businessCategories, isLoading: categoriesLoading } = useCategories(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });

  // Process the data
  const products = useMemo(() => {
    return (storeProducts || []).filter((p: { is_active: any; stock_quantity: number; }) => p.is_active && p.stock_quantity > 0);
  }, [storeProducts]);

  const categories = useMemo(() => {
    if (!businessCategories || businessCategories.length === 0) {
      return ['All'];
    }
    return ['All', ...businessCategories.map((cat: { name: any; }) => cat.name)];
  }, [businessCategories]);

  const customers = useMemo(() => {
    return [WALK_IN_CUSTOMER, ...(storeCustomers || [])];
  }, [storeCustomers]);

  // Process today's sales for the cashier
  const todaySales = useMemo(() => {
    if (!allSales || !user?.id) return [];
    
    return allSales.filter((sale: Sale) => {
      const saleDate = new Date(sale.transaction_date);
      const today = new Date();
      const isToday = saleDate.toDateString() === today.toDateString();
      
      // For admin roles, show all sales for the store
      // For cashier role, show only their own sales
      if (user.role === 'business_admin' || user.role === 'store_admin') {
        return isToday;
      } else {
        const isCashierSale = sale.cashier_id === user.id;
        return isToday && isCashierSale;
      }
    });
  }, [allSales, user?.id, user?.role]);

  // Combined loading state
  const isLoading = productsLoading || customersLoading || salesLoading || savedCartsLoading || categoriesLoading;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Ensure selectedCustomer is always set to WALK_IN_CUSTOMER on mount
  useEffect(() => {
    if (!selectedCustomer || selectedCustomer.id !== 'walk-in') {
      setSelectedCustomer(WALK_IN_CUSTOMER);
    }
  }, []);

  // Memoized calculations
  const calculateSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const calculateTax = useCallback(() => {
    const subtotal = calculateSubtotal();
    const config = storeConfig as any;
    return config?.enable_tax ? subtotal * ((config?.tax_rate || 0) / 100) : 0;
  }, [calculateSubtotal, storeConfig]);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() + calculateTax();
  }, [calculateSubtotal, calculateTax]);

  const getChange = useCallback(() => {
    if (paymentMethod === 'cash' && cashAmount) {
      const cash = parseFloat(cashAmount);
      const total = calculateTotal();
      return cash >= total ? cash - total : 0;
    }
    return 0;
  }, [paymentMethod, cashAmount, calculateTotal]);

  // Cart operations
  const addToCart = useCallback((product: Product) => {
    playSound('click');
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock_quantity) {
          return prevCart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });

    logActivity('sale_create', 'POS', `Added ${product.name} to cart`, {
      productId: product.id,
      productName: product.name,
      price: product.price
    });
  }, [playSound, logActivity]);

  const updateQuantity = useCallback((productId: string, change: number) => {
    playSound('click');
    
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            return null;
          }
          if (newQuantity <= item.product.stock_quantity) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }, [playSound]);

  const removeFromCart = useCallback((productId: string) => {
    playSound('click');
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, [playSound]);

  // Payment processing
  const processPayment = useCallback(async (onPaymentComplete?: () => void) => {
    if (!currentStore?.id || cart.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();
      const cashAmountValue = parseFloat(cashAmount) || 0;
      const change = paymentMethod === 'cash' ? Math.max(0, cashAmountValue - total) : 0;

      const saleData: SaleFormData = {
        store_id: currentStore.id,
        cashier_id: user?.id || '',
        customer_id: selectedCustomer?.id !== 'walk-in' ? selectedCustomer?.id : undefined,
        receipt_number: `R${Date.now().toString().slice(-6)}`,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        discount_amount: 0,
        total_amount: calculateTotal(),
        payment_method: paymentMethod === 'mixed' ? 
          (parseFloat(cashAmount) > parseFloat(cardAmount) ? 'cash' : 'card') : 
          paymentMethod,
        cash_received: paymentMethod === 'cash' ? cashAmountValue : 
          (paymentMethod === 'mixed' ? parseFloat(cashAmount) || 0 : undefined),
        change_given: paymentMethod === 'cash' ? change : 
          (paymentMethod === 'mixed' ? Math.max(0, parseFloat(cashAmount) - total) : 0),
        status: 'completed',
        notes: '',
        transaction_date: new Date().toISOString(),
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity,
          discount_amount: item.discount_amount || 0
        }))
      };

      const response = await processSaleMutation.mutateAsync(saleData as any);
      
      // Handle both online and offline responses
      let newSale;
      if (response.success && response.sale) {
        // Online response format
        newSale = response.sale;
      } else if (response.id) {
        // Offline response format (direct sale object)
        newSale = response;
        
        // Check if offline storage failed but sale was still processed
        if (response.offline_storage_failed) {
          console.warn('Offline storage failed for sale:', response.error);
          toast.warning('Sale completed but offline storage failed. Data may not sync when online.');
        }
      } else {
        throw new Error('Invalid sale response');
      }
      
      const config = storeConfig as any;
      const receiptData = {
        storeName: config?.name || currentStore?.name || '',
        address: config?.address || '',
        phone: config?.phone || '',
        receiptHeader: config?.receiptHeader || translateWrapper('receipt.header'),
        receiptFooter: config?.receiptFooter || translateWrapper('receipt.footer'),
        logo: config?.logo,
        cashierName: user?.name || '',
        customerName: selectedCustomer?.id === 'walk-in' ? 'Walk-in Customer' : selectedCustomer?.name,
        customerPhone: selectedCustomer?.id === 'walk-in' ? '' : selectedCustomer?.phone,
        paymentMethod: paymentMethod === 'mixed' ? 
          `${translateWrapper('pos.cash')} + ${translateWrapper('pos.cash')}` : 
          (paymentMethod === 'cash' ? translateWrapper('pos.cash') : translateWrapper('pos.card')),
        receiptNumber: newSale.receipt_number || newSale.id.slice(-6),
        items: cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        tax,
        taxRate: config?.taxRate || 0,
        discount_amount: 0,
        total,
        cashAmount: paymentMethod === 'cash' ? cashAmountValue : 
          (paymentMethod === 'mixed' ? parseFloat(cashAmount) || 0 : 0),
        change: paymentMethod === 'cash' ? change : 
          (paymentMethod === 'mixed' ? Math.max(0, parseFloat(cashAmount) - total) : 0),
        transactionDate: new Date(),
        currencySymbol: getCurrentCurrency() // Add currency symbol from SystemContext
      };

      playSound('success');
      
      // Log activity with appropriate sale ID
      const saleId = newSale.id || newSale.offline_id;
      logActivity('sale_create', 'POS', `Sale completed - Total: ${formatCurrency(total)}`, {
        saleId: saleId,
        items: cart.length,
        subtotal,
        tax,
        total,
        paymentMethod: paymentMethod === 'mixed' ? 'mixed' : paymentMethod,
        customerId: selectedCustomer?.id !== 'walk-in' ? selectedCustomer?.id : '',
        customerName: selectedCustomer?.name,
        cash_received: paymentMethod === 'cash' ? cashAmountValue : 
          (paymentMethod === 'mixed' ? parseFloat(cashAmount) || 0 : ''),
        change_given: paymentMethod === 'cash' ? change : 
          (paymentMethod === 'mixed' ? Math.max(0, parseFloat(cashAmount) - total) : ''),
        cardAmount: paymentMethod === 'card' ? parseFloat(cardAmount) || 0 : 
          (paymentMethod === 'mixed' ? parseFloat(cardAmount) || 0 : '')
      });

      // Clear cart and reset for next transaction
      setCart([]);
      setSelectedCustomer(WALK_IN_CUSTOMER);
      setCashAmount('');
      setCardAmount('');
      
      // Immediately refresh product stock to show updated quantities
      refetchProducts();
      
      // Show appropriate success message for online/offline
      const receiptNumber = newSale.receipt_number || newSale.id.slice(-6);
      if (response.success && response.sale) {
        toast.success(`Sale completed successfully! Receipt #${receiptNumber}`);
      } else {
        toast.success(`Sale completed offline! Receipt #${receiptNumber} (will sync when online)`);
      }
      
      setLastSaleInfo({
        receiptNumber: receiptNumber,
        total: total,
        items: cart.length,
        timestamp: new Date().toISOString()
      });
      setShowSaleSuccess(true);
      
      setTimeout(() => {
        setShowSaleSuccess(false);
        setLastSaleInfo(null);
      }, 3000);
      
      if (onSaleCompleted) {
        onSaleCompleted();
      }
      
      // Print receipt with longer delay to ensure payment completion
      setTimeout(() => {
        printReceipt(receiptData);
      }, 500);
      
      setActiveTab('pos');
      
      // Call the completion callback after printing with additional delay
      // This gives users time to interact with the print dialog
      setTimeout(() => {
        if (onPaymentComplete) {
          onPaymentComplete();
        }
      }, 2000); // 2 second delay to allow print dialog interaction
      
    } catch (error: unknown) {
      console.error('Payment processing error:', error);
      playSound('error');
      
      // Show appropriate error message for offline scenarios
      if (!navigator.onLine) {
        toast.error('Payment processing failed: Working offline. Please try again when online.');
      } else {
        toast.error('Payment processing failed: ' + (error as Error).message);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [currentStore?.id, cart, calculateSubtotal, calculateTax, calculateTotal, paymentMethod, cashAmount, cardAmount, selectedCustomer, storeConfig, user?.name, translateWrapper, formatCurrency, playSound, logActivity, printReceipt, onSaleCompleted, processSaleMutation, refetchProducts]);

  // Customer operations
  const handleAddCustomer = useCallback(async () => {
    if (!customerName.trim() || !customerPhone.trim() || !currentStore?.id) {
      toast.error('Please enter both name and phone number');
      return;
    }

    try {
      const customerData = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: '',
        is_active: true,
        store_id: currentStore?.id || ''
      };

      await createCustomerMutation.mutateAsync(customerData);
      
      setCustomerName('');
      setCustomerPhone('');
      setShowCustomerDialog(false);

      logActivity('customer_create', 'POS', `Added new customer: ${customerData.name}`, {
        customerName: customerData.name,
        customerPhone: customerData.phone
      });
      
      toast.success(`Customer "${customerData.name}" created successfully!`);
    } catch (error: unknown) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer: ' + (error as Error).message);
    }
  }, [customerName, customerPhone, currentStore?.id, createCustomerMutation, logActivity]);

  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDialog(false);
    if (showSaveCartDialog) {
      setShowSaveCartDialog(false);
    }
  }, [showSaveCartDialog]);

  const clearCustomer = useCallback(() => {
    setSelectedCustomer(WALK_IN_CUSTOMER);
  }, []);

  const handleCustomerDialogChange = useCallback((open: boolean) => {
    setShowCustomerDialog(open);
    if (!open) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerSearchTerm('');
    }
  }, []);

  // Barcode operations
  const findProductByBarcode = useCallback((barcode: string): Product | null => {
    return storeProducts.find((product: { barcode: string; }) => product.barcode === barcode) || null;
  }, [storeProducts]);

  const handleBarcodeInput = useCallback((barcode: string) => {
    const product = findProductByBarcode(barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      setShowBarcodeScanner(false);
    } else {
      playSound('error');
      toast.error(translateWrapper('pos.productNotFound') || 'Product not found');
    }
  }, [findProductByBarcode, addToCart, playSound, translateWrapper]);

  const handleBarcodeSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      handleBarcodeInput(barcodeInput.trim());
    }
  }, [barcodeInput, handleBarcodeInput]);

  // Sales operations
  const refreshSalesData = useCallback(async () => {
    if (!currentStore?.id || !user?.id) return;
    
    try {
      await refetchSales();
      toast.success('Sales data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing sales data:', error);
      toast.error('Failed to refresh sales data');
    }
  }, [currentStore?.id, user?.id, refetchSales]);

  const handleSaleClick = useCallback((sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetail(true);
  }, []);

  // Generate automatic cart name
  const generateCartName = useCallback(() => {
    const now = new Date();
    const timeStr = formatTime(now);
    const dateStr = formatDate(now);
    
    const customerStr = selectedCustomer?.id === 'walk-in' ? 'Walk-in' : selectedCustomer?.name?.split(' ')[0] || 'Customer';
    const itemCount = cart.length;
    const totalValue = formatCurrency(calculateTotal());
    
    return `${customerStr} - ${itemCount} items - ${totalValue} - ${dateStr} ${timeStr}`;
  }, [cart.length, selectedCustomer?.id, selectedCustomer?.name, calculateTotal, formatCurrency, formatTime, formatDate]);

  // Save cart for later
  const saveCartForLater = useCallback(async () => {
    if (cart.length === 0 || !currentStore?.id || !user?.id) {
      toast.error('Please ensure cart is not empty');
      return;
    }

    try {
      const cartData = {
        store_id: currentStore?.id,
        cashier_id: user.id,
        customer_id: selectedCustomer?.id !== 'walk-in' ? selectedCustomer?.id : undefined,
        cart_name: generateCartName(),
        cart_data: {
          items: cart,
          customer: selectedCustomer?.id === 'walk-in' ? WALK_IN_CUSTOMER : selectedCustomer,
          total: calculateTotal(),
          timestamp: new Date().toISOString()
        }
      };

      await saveCartMutation.mutateAsync(cartData);
      
      setShowSaveCartDialog(false);
    } catch (error: unknown) {
      console.error('Error saving cart:', error);
      toast.error('Failed to save cart');
    }
  }, [cart, currentStore?.id, user?.id, selectedCustomer, generateCartName, calculateTotal, saveCartMutation]);

  // Load saved cart into current cart
  const loadSavedCart = useCallback((savedCart: any) => {
    if (savedCart.cart_data?.items) {
      setCart(savedCart.cart_data.items);
      if (savedCart.cart_data.customer) {
        if (savedCart.cart_data.customer.id === 'walk-in') {
          setSelectedCustomer(WALK_IN_CUSTOMER);
        } else {
          setSelectedCustomer(savedCart.cart_data.customer);
        }
      } else {
        setSelectedCustomer(WALK_IN_CUSTOMER);
      }
      setShowSavedCarts(false);
      toast.success('Cart loaded successfully');
    }
  }, []);

  // Delete saved cart
  const deleteSavedCart = useCallback(async (cartId: string) => {
    try {
      await deleteSavedCartMutation.mutateAsync(cartId);
    } catch (error) {
      console.error('Error deleting saved cart:', error);
      toast.error('Failed to delete saved cart');
    }
  }, [deleteSavedCartMutation]);

  // Fullscreen toggle function
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts for fullscreen control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
      
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading POS system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <main className={`w-full ${isFullscreen ? 'h-screen' : 'h-screen'}`}>
        {/* Main POS Content */}
        <div className={`h-full w-full flex flex-col lg:flex-row gap-3 lg:gap-6 p-3 lg:p-6 pb-20 ${isFullscreen ? 'h-[calc(100vh-20px)]' : 'h-[calc(100vh-20px)]'}`}>
          {/* Error Display */}
          {error && (
            <Card className="mb-4 border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm shadow-sm">
              <CardContent className="p-3">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Products Section - Left Side */}
          <ProductGrid
            products={products}
            categories={categories}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onProductClick={addToCart}
            onScanBarcode={() => setShowBarcodeScanner(true)}
          />

          {/* Cart Section - Right Side */}
          <ShoppingCartComponent
            cart={cart}
            selectedCustomer={selectedCustomer || WALK_IN_CUSTOMER}
            paymentMethod={paymentMethod}
            cashAmount={cashAmount}
            cardAmount={cardAmount}
            isProcessing={isProcessing}
            showSaleSuccess={showSaleSuccess}
            lastSaleInfo={lastSaleInfo}
            cartSearchTerm={cartSearchTerm}
            onCartSearchChange={setCartSearchTerm}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onClearCart={() => setCart([])}
            onPaymentMethodChange={setPaymentMethod}
            onCashAmountChange={setCashAmount}
            onCardAmountChange={setCardAmount}
            onProcessPayment={(onComplete) => processPayment(onComplete)}
            onSaveCart={() => setShowSaveCartDialog(true)}
            onLoadSavedCarts={() => setShowSavedCarts(true)}
            onSelectCustomer={() => setShowCustomerDialog(true)}
            onClearCustomer={clearCustomer}
            calculateSubtotal={calculateSubtotal}
            calculateTax={calculateTax}
            calculateTotal={calculateTotal}
            getChange={getChange}
            isValidCashAmount={isValidCashAmount}
            formatCurrency={formatCurrency}
            translate={translateWrapper}
          />
        </div>

        {/* Comprehensive Bottom Navigation Bar - Responsive Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 shadow-lg">
          <div className="px-2 sm:px-3 lg:px-6 py-2 sm:py-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              {/* Left Side - Store Info and User */}
              <div className="flex items-center justify-between sm:justify-start gap-2 lg:gap-4 order-2 sm:order-1">
                {/* Store Information */}
                <div className="flex items-center gap-1 lg:gap-2 bg-muted rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border border-border">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-xs lg:text-sm font-medium text-foreground hidden sm:inline">
                    {currentStore?.name || 'Store'}
                  </span>
                  <span className="text-xs lg:text-sm font-medium text-foreground sm:hidden">
                    {currentStore?.name?.substring(0, 8) || 'Store'}
                  </span>
                </div>

                {/* Business Type Indicator */}
                <div className="flex items-center gap-1 lg:gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border border-blue-200 dark:border-blue-800">
                  <span className="text-lg">{businessType === 'retail' ? '🛍️' : businessType === 'restaurant' ? '🍽️' : businessType === 'service' ? '🔧' : businessType === 'hybrid' ? '🔄' : businessType === 'pharmacy' ? '💊' : '🏢'}</span>
                  <span className="text-xs lg:text-sm font-medium text-blue-700 dark:text-blue-300 hidden sm:inline">
                    {businessType.charAt(0).toUpperCase() + businessType.slice(1)}
                  </span>
                </div>

                {/* User Role Badge */}
                <Badge variant="secondary" className="text-xs hidden sm:inline-block">
                  {user?.role?.replace('_', ' ')}
                </Badge>

                {/* Current Time */}
                <div className="text-xs text-muted-foreground hidden sm:block">
                  <TimeDisplay />
                </div>
              </div>

              {/* Right Side - All Navigation Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-1 lg:gap-2 order-1 sm:order-2 w-full sm:w-auto">
                {/* Main Navigation - Responsive Layout */}
                <div className="flex items-center gap-1 lg:gap-2">
                  <button
                    onClick={() => setActiveTab('pos')}
                    className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all text-xs lg:text-sm ${
                      activeTab === 'pos' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="font-medium hidden xs:inline">POS</span>
                    <span className="font-medium xs:hidden lg:inline">Point of Sale</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('sales')}
                    className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all text-xs lg:text-sm ${
                      activeTab === 'sales' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Activity className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="font-medium hidden xs:inline">Sales</span>
                    <span className="font-medium xs:hidden lg:inline">Transactions</span>
                  </button>
                </div>

                {/* Secondary Actions - Responsive Layout */}
                <div className="flex items-center gap-1 lg:gap-2">
                  {/* Notifications - Hidden on very small screens */}
                  <button className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-xs lg:text-sm hidden sm:flex">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM8 9l-5 5 5 5V9z" />
                    </svg>
                    <span className="font-medium hidden lg:inline">Notifications</span>
                  </button>

                  {/* More - Hidden on very small screens */}
                  <button className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-xs lg:text-sm hidden sm:flex">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="font-medium hidden lg:inline">More</span>
                  </button>

                  {/* Fullscreen Toggle */}
                  <Button
                    onClick={toggleFullscreen}
                    variant="outline"
                    size="sm"
                    className="h-7 lg:h-8 px-2 lg:px-3 text-xs lg:text-sm"
                  >
                    {isFullscreen ? (
                      <>
                        <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                        </svg>
                        <span className="hidden sm:inline">Exit</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="hidden sm:inline">Full</span>
                      </>
                    )}
                  </Button>

                  {/* Exit POS Button */}
                  <Button 
                    onClick={onBack} 
                    size="sm"
                    variant="destructive"
                    className="h-7 lg:h-8 px-2 lg:px-3 text-xs lg:text-sm"
                  >
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="hidden sm:inline">Exit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales History Overlay */}
        {activeTab === 'sales' && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 z-30 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales History</h2>
                <button
                  onClick={() => setActiveTab('pos')}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SalesHistory
                todaySales={todaySales}
                currentTime={currentTime}
                loginTime={loginTime}
                onRefreshSales={refreshSalesData}
                onSaleClick={handleSaleClick}
                formatCurrency={formatCurrency}
                formatTime={formatTime}
                formatDateTime={formatDateTime}
                translate={translateWrapper}
              />
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <BarcodeScannerDialog
        open={showBarcodeScanner}
        onOpenChange={setShowBarcodeScanner}
        barcodeInput={barcodeInput}
        onBarcodeInputChange={setBarcodeInput}
        onSubmit={handleBarcodeSubmit}
      />

      <CustomerSelectionDialog
        open={showCustomerDialog}
        onOpenChange={handleCustomerDialogChange}
        customers={customers}
        selectedCustomer={selectedCustomer}
        customerSearchTerm={customerSearchTerm}
        customerName={customerName}
        customerPhone={customerPhone}
        onCustomerSearchChange={setCustomerSearchTerm}
        onCustomerNameChange={setCustomerName}
        onCustomerPhoneChange={setCustomerPhone}
        onSelectCustomer={handleSelectCustomer}
        onAddCustomer={handleAddCustomer}
      />

      <SaleDetailDialog
        open={showSaleDetail}
        onOpenChange={setShowSaleDetail}
        sale={selectedSale}
        onReprintReceipt={(receiptData) => {
          // Update receipt data with current store and user info
          const config = storeConfig as any;
          const updatedReceiptData = {
            ...receiptData,
            storeName: currentStore?.name || '',
            cashierName: user?.name || '',
            address: config?.address || '',
            phone: config?.phone || '',
            receiptHeader: config?.receiptHeader || translateWrapper('receipt.header'),
            receiptFooter: config?.receiptFooter || translateWrapper('receipt.footer'),
            logo: config?.logo,
            taxRate: config?.taxRate || 0,
            currencySymbol: getCurrentCurrency() // Add currency symbol for reprint
          };
          printReceipt(updatedReceiptData);
        }}
        formatCurrency={formatCurrency}
        formatDateTime={formatDateTime}
      />

      <SaveCartDialog
        open={showSaveCartDialog}
        onOpenChange={setShowSaveCartDialog}
        selectedCustomer={selectedCustomer}
        cartItemCount={cart.length}
        cartTotal={calculateTotal()}
        onSelectCustomer={() => setShowCustomerDialog(true)}
        onSaveCart={saveCartForLater}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      <LoadSavedCartsDialog
        open={showSavedCarts}
        onOpenChange={setShowSavedCarts}
        savedCarts={savedCarts}
        onLoadCart={loadSavedCart}
        onDeleteCart={deleteSavedCart}
        formatDate={formatDate}
      />
    </div>
  );
};
