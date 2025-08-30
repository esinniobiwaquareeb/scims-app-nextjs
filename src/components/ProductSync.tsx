import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { Header } from '@/components/common/Header';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Package, 
  Copy, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  Upload
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  reorder_level: number;
  category_id?: string;
  supplier_id?: string;
  brand_id?: string;
  is_active: boolean;
  categories?: { name: string };
  suppliers?: { name: string };
  brands?: { name: string };
}

interface Store {
  id: string;
  name: string;
  is_active: boolean;
}

interface ProductSyncProps {
  onBack: () => void;
}

export const ProductSync: React.FC<ProductSyncProps> = ({ onBack }) => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { translate, formatCurrency } = useSystem();
  const { logActivity } = useActivityLogger();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [syncMode, setSyncMode] = useState<'copy' | 'sync'>('copy');
  
  // Load data
  useEffect(() => {
    if (currentBusiness?.id) {
      loadData();
    } else {
      setLoading(false);
      setError('No business selected. Please ensure you are logged into a business account.');
    }
  }, [currentBusiness?.id, user?.role]);

  // Load products when current store changes
  useEffect(() => {
    if (currentStore?.id && stores.length > 0) {
      setSelectedProducts([]); // Clear selected products when store changes
      loadProductsForStore(currentStore.id);
    }
  }, [currentStore?.id, stores.length]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    const matchesCategory = categoryFilter === 'all' || product.categories?.name === categoryFilter;
    return matchesSearch && matchesCategory && product.is_active;
  });

  // Export product list
  const exportProducts = useCallback(() => {
    if (filteredProducts.length === 0) {
      toast.error('No products to export');
      return;
    }

    import('../utils/export-utils').then(({ exportProducts: exportProductsUtil }) => {
      try {
        exportProductsUtil(filteredProducts as unknown as Record<string, unknown>[], {
          businessName: currentBusiness?.name
        });
        
        toast.success('Products exported successfully');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export products');
      }
    }).catch(error => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [filteredProducts, currentBusiness?.name]);

  // Check if user has access to this component
  if (!user || (user.role !== 'business_admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-red-700 mb-2">Access Denied</p>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access product synchronization.
          </p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    if (!currentBusiness?.id) {
      setError('No business selected');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Load all stores in the business first
      const storesResponse = await fetch(`/api/businesses/${currentBusiness.id}/stores`);
      if (!storesResponse.ok) {
        throw new Error('Failed to fetch stores');
      }
      const storesData = await storesResponse.json();
      const businessStores = storesData.stores || [];
      setStores(businessStores);
      
      if (businessStores.length === 0) {
        setError('No stores found in this business. Please ensure your business has at least one store configured.');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Load products for the current store if available
      if (currentStore?.id && businessStores.length > 0) {
        setTimeout(() => loadProductsForStore(currentStore.id), 100);
      }
      
    } catch (err: unknown) {
      console.error('Error loading sync data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sync data';
      setError(errorMessage);
      toast.error('Failed to load sync data');
    } finally {
      setLoading(false);
    }
  };

  // Load products for a specific store
  const loadProductsForStore = async (storeId: string) => {
    try {
      setLoadingProducts(true);
      setError(null);
      
      const productsResponse = await fetch(`/api/products?store_id=${storeId}`);
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products');
      }
      const productsData = await productsResponse.json();
      const storeProducts = productsData.products || [];
      
      setProducts(storeProducts);
      
      if (storeProducts.length === 0) {
        const storeName = stores.find(s => s.id === storeId)?.name || 'Unknown';
        setError(`No products found in store "${storeName}". Please add products to this store or select a different source store.`);
      } else {
        setError(null);
      }
    } catch (err: unknown) {
      const storeName = stores.find(s => s.id === storeId)?.name || 'Unknown';
      const errorMessage = err instanceof Error ? err.message : `Failed to load products from store "${storeName}"`;
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.categories?.name).filter(Boolean) as string[]))];

  // Handle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle store selection
  const toggleStoreSelection = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Select all products
  const selectAllProducts = () => {
    setSelectedProducts(filteredProducts.map(p => p.id));
  };

  // Deselect all products
  const deselectAllProducts = () => {
    setSelectedProducts([]);
  };

  // Select all stores
  const selectAllStores = () => {
    setSelectedStores(stores.filter(s => s.is_active && s.id !== currentStore?.id).map(s => s.id));
  };

  // Deselect all stores
  const deselectAllStores = () => {
    setSelectedStores([]);
  };

  // Sync products
  const handleSync = async () => {
    if (selectedProducts.length === 0 || selectedStores.length === 0) {
      toast.error('Please select products and target stores');
      return;
    }

    try {
      setSyncing(true);
      
      const selectedProductData = products.filter(p => selectedProducts.includes(p.id));
      const selectedStoreData = stores.filter(s => selectedStores.includes(s.id));
      
      let successCount = 0;
      let errorCount = 0;

      for (const store of selectedStoreData) {
        for (const product of selectedProductData) {
          try {
            if (syncMode === 'copy') {
              // Copy product to store
              const productData = {
                name: product.name,
                sku: `${product.sku}-${store.name.slice(0, 3).toUpperCase()}`,
                barcode: product.barcode,
                description: product.description,
                price: product.price,
                stock_quantity: 0, // Start with 0 stock
                min_stock_level: product.min_stock_level,
                reorder_level: product.reorder_level,
                category_id: product.category_id,
                supplier_id: product.supplier_id,
                brand_id: product.brand_id,
                is_active: true
              };

              const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  store_id: store.id,
                  ...productData
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to create product');
              }

              successCount++;
            } else {
              // Sync existing product (update price, description, etc.)
              const updateData = {
                price: product.price,
                description: product.description,
                min_stock_level: product.min_stock_level,
                reorder_level: product.reorder_level
              };

              // Check if product exists in target store by SKU
              const existingProductResponse = await fetch(`/api/products?store_id=${store.id}&sku=${product.sku}`);
              if (existingProductResponse.ok) {
                const existingData = await existingProductResponse.json();
                const existingProduct = existingData.products?.[0];
                
                if (existingProduct) {
                  const updateResponse = await fetch(`/api/products/${existingProduct.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                  });

                  if (!updateResponse.ok) {
                    throw new Error('Failed to update product');
                  }
                  successCount++;
                } else {
                  // Create if doesn't exist
                  const productData = {
                    name: product.name,
                    sku: product.sku,
                    barcode: product.barcode,
                    description: product.description,
                    price: product.price,
                    stock_quantity: 0,
                    min_stock_level: product.min_stock_level,
                    reorder_level: product.reorder_level,
                    category_id: product.category_id,
                    supplier_id: product.supplier_id,
                    brand_id: product.brand_id,
                    is_active: true
                  };

                  const createResponse = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      store_id: store.id,
                      ...productData
                    }),
                  });

                  if (!createResponse.ok) {
                    throw new Error('Failed to create product');
                  }
                  successCount++;
                }
              }
            }
          } catch (error) {
            console.error(`Error syncing product ${product.name} to store ${store.name}:`, error);
            errorCount++;
          }
        }
      }

      // Log activity
      logActivity('inventory_update', 'Product Sync', `Synced ${successCount} products to ${selectedStores.length} stores`, {
        productCount: successCount,
        storeCount: selectedStores.length,
        syncMode,
        errors: errorCount
      });

      if (errorCount === 0) {
        toast.success(`Successfully synced ${successCount} products to ${selectedStores.length} stores`);
      } else {
        toast.success(`Synced ${successCount} products with ${errorCount} errors`);
      }

      setShowSyncDialog(false);
      setSelectedProducts([]);
      setSelectedStores([]);
      
    } catch (error: unknown) {
      console.error('Error during sync:', error);
      toast.error('Failed to sync products');
    } finally {
      setSyncing(false);
    }
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'selection',
      header: '',
      render: (product: Product) => (
        <Checkbox
          checked={selectedProducts.includes(product.id)}
          onCheckedChange={() => toggleProductSelection(product.id)}
        />
      )
    },
    {
      key: 'name',
      header: 'Product',
      render: (product: Product) => (
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">{product.sku}</p>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price & Stock',
      render: (product: Product) => (
        <div>
          <p className="font-medium">{formatCurrency(product.price)}</p>
          <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category & Supplier',
      render: (product: Product) => (
        <div>
          <p className="text-sm text-muted-foreground">
            {product.categories?.name || 'No Category'}
          </p>
          <p className="text-sm text-muted-foreground">
            {product.suppliers?.name || 'No Supplier'}
          </p>
        </div>
      )
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (product: Product) => (
        <p className="text-sm text-muted-foreground">
          {product.brands?.name || 'No Brand'}
        </p>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product sync...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Product Synchronization"
        subtitle="Sync products across all stores in your business"
        showBackButton
        onBack={onBack}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportProducts}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowSyncDialog(true)} disabled={selectedProducts.length === 0}>
            <Copy className="w-4 h-4 mr-2" />
            Sync Selected ({selectedProducts.length})
          </Button>
        </div>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading sync data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-red-700 mb-2">Error Loading Data</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Loading Products Indicator */}
            {loadingProducts && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-blue-800 text-sm">Loading products from selected store...</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Sync Summary */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Package className="w-5 h-5" />
                  Sync Summary
                </CardTitle>
                <p className="text-sm text-blue-600 mt-1">
                  💡 Use the store selector in the header to change the source store
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-700">{products.length}</p>
                    <p className="text-sm text-blue-600">Source Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-700">{stores.filter(s => s.is_active && s.id !== currentStore?.id).length}</p>
                    <p className="text-sm text-blue-600">Target Stores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-700">{selectedProducts.length}</p>
                    <p className="text-sm text-blue-600">Selected Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-600">Source Store</p>
                    <p className="text-lg font-semibold text-blue-700">
                      {currentStore?.name || 'Select a store from header'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products by name, SKU, or barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => currentStore?.id && loadProductsForStore(currentStore.id)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products DataTable */}
            <DataTable
              title="Products to Sync"
              data={filteredProducts}
              columns={columns}
              searchable={false}
              tableName="products"
              userRole={user?.role}
              pagination={{
                enabled: true,
                pageSize: 20,
                showPageSizeSelector: true,
                showPageInfo: true
              }}
              actions={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllProducts}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllProducts}>
                    Deselect All
                  </Button>
                </div>
              }
              onExport={exportProducts}
              emptyMessage={
                products.length === 0 
                  ? 'No products found in the source store. Please add products to the source store first.'
                  : 'No products match the current search or filter criteria.'
              }
            />
          </div>
        )}
      </main>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sync Products</DialogTitle>
            <DialogDescription>
              Choose target stores and sync mode for the selected products
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Sync Mode Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Sync Mode</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="copy-mode"
                    checked={syncMode === 'copy'}
                    onCheckedChange={() => setSyncMode('copy')}
                  />
                  <Label htmlFor="copy-mode">
                    Copy Products - Create new products in target stores
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sync-mode"
                    checked={syncMode === 'sync'}
                    onCheckedChange={() => setSyncMode('sync')}
                  />
                  <Label htmlFor="sync-mode">
                    Sync Products - Update existing products or create new ones
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Store Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Target Stores</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllStores}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllStores}>
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stores.filter(s => s.is_active && s.id !== currentStore?.id).map(store => (
                  <div key={store.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={store.id}
                      checked={selectedStores.includes(store.id)}
                      onCheckedChange={() => toggleStoreSelection(store.id)}
                    />
                    <Label htmlFor={store.id} className="flex-1">
                      {store.name}
                    </Label>
                  </div>
                ))}
                {stores.filter(s => s.is_active && s.id !== currentStore?.id).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No target stores available. You need at least 2 stores to use Product Sync.
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{selectedProducts.length}</strong> products will be {syncMode === 'copy' ? 'copied to' : 'synced with'} <strong>{selectedStores.length}</strong> stores
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSync} 
                disabled={syncing || selectedStores.length === 0}
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Start Sync
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
