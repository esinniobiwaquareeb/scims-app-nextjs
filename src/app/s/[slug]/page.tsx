'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import ProductFilters from '@/components/storefront/ProductFilters';
import ProductCard from '@/components/storefront/ProductCard';
import StorefrontCart from '@/components/storefront/ShoppingCart';
import StorefrontFooter from '@/components/storefront/StorefrontFooter';
import OrderSummaryModal from '@/components/storefront/OrderSummaryModal';
import { generateOrderPDF } from '@/utils/pdfGenerator';

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

interface Business {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  slug: string;
  currency: { symbol: string; code: string };
  language: { name: string };
  country: { name: string };
  settings: {
    enable_public_store: boolean;
    store_theme: string;
    store_banner_url?: string;
    store_description?: string;
    whatsapp_phone: string;
    whatsapp_message_template: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [stores, setStores] = useState<Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
    email: string;
  }>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    business: Business;
    items: CartItem[];
    customer: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
    };
    total: number;
    whatsappUrl: string;
    notes?: string;
  } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Order form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const fetchStoreData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/public/store/${slug}`);
      const data = await response.json();

      if (data.success) {
        setBusiness(data.business);
        setStores(data.stores);
        setProducts(data.products);
        setCategories(data.categories);
      } else {
        setError(data.error || 'Store not found');
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError('Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category?.name === selectedCategory
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    if (slug) {
      fetchStoreData();
    }
  }, [slug, fetchStoreData]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, sortBy, filterProducts]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!customerName || !customerPhone) {
      setError('Please fill in your name and phone number');
      return;
    }

    try {
      setIsOrdering(true);
      setError('');

      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total_price: item.product.price * item.quantity
      }));

      const response = await fetch('/api/public/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: business?.id,
          store_id: stores?.[0]?.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          customer_address: customerAddress,
          order_items: orderItems,
          subtotal: getCartTotal(),
          total_amount: getCartTotal(),
          notes: orderNotes
        }),
      });

      const data = await response.json();

      if (data.success && business) {
        // Prepare order data for summary modal
        const orderSummaryData = {
          orderNumber: data.order.order_number,
          business: business,
          items: cart.map(item => ({
            product: item.product,
            quantity: item.quantity
          })),
          customer: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: customerAddress
          },
          total: getCartTotal(),
          whatsappUrl: data.whatsappUrl || '',
          notes: orderNotes
        };

        setOrderData(orderSummaryData);
        setShowOrderSummary(true);
        setOrderSuccess(true);
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerAddress('');
        setOrderNotes('');
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!orderData) return;

    setIsGeneratingPDF(true);
    try {
      const pdfData = {
        orderNumber: orderData.orderNumber,
        business: orderData.business,
        items: orderData.items,
        customer: orderData.customer,
        total: orderData.total,
        notes: orderData.notes,
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      generateOrderPDF(pdfData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading store...</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader business={business} />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-4">
            <ProductFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
            />

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  business={business}
                  onAddToCart={addToCart}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <StorefrontCart
              cart={cart}
              business={business}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onOrder={handleOrder}
              isOrdering={isOrdering}
              orderSuccess={orderSuccess}
              error={error}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              customerAddress={customerAddress}
              setCustomerAddress={setCustomerAddress}
              orderNotes={orderNotes}
              setOrderNotes={setOrderNotes}
            />
          </div>
        </div>
      </div>

      <StorefrontFooter business={business} />

      {/* Order Summary Modal */}
      <OrderSummaryModal
        isOpen={showOrderSummary}
        onClose={() => setShowOrderSummary(false)}
        orderData={orderData}
        onDownloadPDF={handleDownloadPDF}
        isGeneratingPDF={isGeneratingPDF}
      />
    </div>
  );
}
