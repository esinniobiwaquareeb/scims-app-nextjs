/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/common/ImageUpload';
import Image from 'next/image';

import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2,
  Package,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Copy,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { useBusinessStores } from '@/utils/hooks/stores';
import { useBusinessCategories } from '@/utils/hooks/categories';
import { useBusinessSuppliers } from '@/utils/hooks/suppliers';
import { useBusinessBrands } from '@/utils/hooks/brands';
import { useBusinessUnits } from '@/utils/hooks/units';
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useStoreProducts
} from '@/utils/hooks/products';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  sku: string;
  barcode?: string;
  description?: string;
  stock_quantity: number;
  min_stock_level: number;
  category_id?: string | null;
  supplier_id?: string | null;
  brand_id?: string | null;
  image_url?: string;
  category?: { id: string; name: string };
  supplier?: { id: string; name: string };
  brand?: { id: string; name: string };
  is_active: boolean;
  is_public?: boolean;
  public_description?: string;
  public_images?: string[];
  unit?: string;
  created_at: string;
  updated_at: string;
  reorder_level?: number;
}

interface Category {
  id: string;
  name: string;
  color?: string;
  is_active: boolean;
}

interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  is_active: boolean;
}

interface Brand {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface ProductManagementProps {
  onBack?: () => void; // Optional for backward compatibility
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ onBack }) => {
  const { user, currentStore, currentBusiness } = useAuth();
  const { formatCurrency } = useSystem();
  
  // Simple permission check - replace with proper permission system later
  const hasPermission = () => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'business_admin') return true;
    if (user?.role === 'store_admin') return true;
    return false;
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState(
    user?.role === 'store_admin' ? currentStore?.id || '' : 'All'
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Import states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    totalRows: number;
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    createdCategories: string[];
    createdBrands: string[];
    createdSuppliers: string[];
  } | null>(null);
  
  // Data states
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    cost: 0,
    sku: '',
    barcode: '',
    description: '',
    stock_quantity: 0,
    min_stock_level: 0,
    category_id: null,
    supplier_id: null,
    brand_id: null,
    image_url: '',
    reorder_level: 0,
    is_public: false,
    public_description: '',
    unit: 'piece'
  });

  // Image upload state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);



  const resetNewProductForm = useCallback(() => {
    setNewProduct({
      name: '',
      price: 0,
      cost: 0,
      sku: '',
      barcode: '',
      description: '',
      stock_quantity: 0,
      min_stock_level: 0,
      category_id: null,
      supplier_id: null,
      brand_id: null,
      image_url: '',
      reorder_level: 0,
      unit: 'piece'
    });
    setSelectedImageFile(null);
  }, []);

  // Image upload function
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    // Determine which store to use for image upload
    const targetStoreId = selectedStoreFilter === 'All' ? currentStore?.id : selectedStoreFilter;
    if (!targetStoreId) return null;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storeId', targetStoreId);
      formData.append('type', 'product');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    }
  }, [selectedStoreFilter, currentStore?.id]);

  // Use React Query hooks for data fetching with smart caching
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useStoreProducts(selectedStoreFilter, { 
    enabled: !!selectedStoreFilter && selectedStoreFilter !== '' && !!currentBusiness?.id,
    businessId: currentBusiness?.id
  });

  // useStoreProducts now handles both specific stores and "All" stores
  const allProducts = products;
  const isLoadingProducts = productsLoading;
  const productsErrorCombined = productsError;

  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useBusinessCategories(currentBusiness?.id || '', { enabled: !!currentBusiness?.id });

  const {
    data: suppliers = [],
    isLoading: suppliersLoading
  } = useBusinessSuppliers(currentBusiness?.id || '', { enabled: !!currentBusiness?.id });

  const {
    data: brands = [],
    isLoading: brandsLoading
  } = useBusinessBrands(currentBusiness?.id || '', { enabled: !!currentBusiness?.id });

  const {
    data: units = [],
    isLoading: unitsLoading
  } = useBusinessUnits(currentBusiness?.id || '', { enabled: !!currentBusiness?.id });

  const {
    data: stores = [],
    isLoading: storesLoading
  } = useBusinessStores(currentBusiness?.id || '', { enabled: !!currentBusiness?.id });

  // Update store filter when user role or current store changes
  useEffect(() => {
    if (user?.role === 'store_admin' && currentStore?.id) {
      setSelectedStoreFilter(currentStore.id);
    } else if (user?.role === 'business_admin') {
      // For business admin, sync with currentStore from header, or default to 'All'
      if (currentStore?.id) {
        setSelectedStoreFilter(currentStore.id);
      } else {
        setSelectedStoreFilter('All');
      }
    }
  }, [user?.role, currentStore?.id]);

  // Use mutations for CRUD operations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct(currentStore?.id || '', currentBusiness?.id);

  // Combined loading state
  const isLoading = productsLoading || categoriesLoading || suppliersLoading || brandsLoading || storesLoading || unitsLoading;
  
  // Combined mutation loading state
  const isMutating = createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending;

  // Refetch loading state
  const [isRefetching, setIsRefetching] = useState(false);

  // Clear editing state when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      // Clear any previous editing state when switching to a new product
      setEditingImageFile(null);
      setError(null);
    }
  }, [editingProduct]); // Trigger when editingProduct changes

  // Clear editing state when edit dialog closes
  useEffect(() => {
    if (!editingProduct) {
      // Clear all editing state when dialog closes
      setEditingImageFile(null);
      setError(null);
    }
  }, [editingProduct]);

  // Clear success states after a few seconds
  useEffect(() => {
    if (createProductMutation.isSuccess || updateProductMutation.isSuccess || deleteProductMutation.isSuccess) {
      const timer = setTimeout(() => {
        // Reset success states
        createProductMutation.reset();
        updateProductMutation.reset();
        deleteProductMutation.reset();
      }, 3000); // Clear after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [createProductMutation.isSuccess, updateProductMutation.isSuccess, deleteProductMutation.isSuccess, createProductMutation, updateProductMutation, deleteProductMutation]);

  const allCategories = ['All', ...categories.filter((c: Category) => c.is_active).map((c: Category) => c.name)];

  const filteredProducts = allProducts.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm)) ||
                         (product.supplier?.name && product.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (product.supplier_id && suppliers.find((s: Supplier) => s.id === product.supplier_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                           product.category?.name === selectedCategory ||
                           (product.category_id && categories.find((c: Category) => c.id === product.category_id)?.name === selectedCategory);
    const isActive = product.is_active;
    return matchesSearch && matchesCategory && isActive;
  });

  const lowStockProducts = allProducts.filter((p: Product) => p.stock_quantity <= (p.reorder_level || p.min_stock_level || 10) && p.is_active);

  const handleAddProduct = async () => {
    if (!newProduct.name || !currentStore?.id) return;

    try {
      setIsSaving(true);
      setError(null);

      let imageUrl = newProduct.image_url || '';

      // Upload image if a new file is selected
      if (selectedImageFile) {
        const uploadedUrl = await uploadImage(selectedImageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // If image upload fails, don't proceed with product creation
          setError('Failed to upload image. Please try again.');
          return;
        }
      }

      // Filter out join fields that don't exist in the database
      const {
        ...insertFields
      } = newProduct;

      // Convert empty strings to null for UUID fields to prevent database errors
      const cleanedInsertFields = {
        ...insertFields,
        category_id: insertFields.category_id || null,
        supplier_id: insertFields.supplier_id || null,
        brand_id: insertFields.brand_id || null,
      };

      const productData = {
        ...cleanedInsertFields,
        image_url: imageUrl,
        store_id: currentStore.id,
        business_id: currentBusiness?.id,
        is_active: true
      };

      // Use the mutation hook - this will automatically invalidate cache on success
      await createProductMutation.mutateAsync(productData as any);
      
      // Close dialog and reset form on success
      setIsAddDialogOpen(false);
      resetNewProductForm();
      
      // Force immediate refetch to ensure UI is updated
      setIsRefetching(true);
      try {
        await refetchProducts();
      } finally {
        setIsRefetching(false);
      }
      
      toast.success('Product created successfully!');
    } catch (error: unknown) {
      console.error('Error creating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      setError(errorMessage);
      // Don't close dialog on error - let user fix and retry
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = useCallback(async () => {
    if (!editingProduct || !currentStore?.id) return;

    try {
      setIsSaving(true);
      setError(null);

      let imageUrl = editingProduct.image_url || '';

      // Upload image if a new file is selected
      if (editingImageFile) {
        const uploadedUrl = await uploadImage(editingImageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // If image upload fails, don't proceed with product update
          setError('Failed to upload image. Please try again.');
          return;
        }
      }

      // Filter out join fields that don't exist in the database
      const {
        ...updateFields
      } = editingProduct;

      // Convert empty strings to null for UUID fields to prevent database errors
      const cleanedUpdateFields = {
        ...updateFields,
        category_id: updateFields.category_id || null,
        supplier_id: updateFields.supplier_id || null,
        brand_id: updateFields.brand_id || null,
      };

      // Only include fields that exist in the database table
      const productData = {
        name: cleanedUpdateFields.name,
        price: cleanedUpdateFields.price,
        cost: cleanedUpdateFields.cost,
        sku: cleanedUpdateFields.sku,
        barcode: cleanedUpdateFields.barcode,
        description: cleanedUpdateFields.description,
        stock_quantity: cleanedUpdateFields.stock_quantity,
        min_stock_level: cleanedUpdateFields.min_stock_level,
        category_id: cleanedUpdateFields.category_id,
        supplier_id: cleanedUpdateFields.supplier_id,
        brand_id: cleanedUpdateFields.brand_id,
        image_url: imageUrl,
        is_active: cleanedUpdateFields.is_active,
        is_public: cleanedUpdateFields.is_public,
        public_description: cleanedUpdateFields.public_description,
        unit: cleanedUpdateFields.unit || 'piece'
      };

      // Use the mutation hook - this will automatically invalidate cache on success
      await updateProductMutation.mutateAsync({
        productId: editingProduct.id,
        productData: productData as any
      });
      
      // Close dialog and reset state on success
      setEditingProduct(null);
      setEditingImageFile(null);
      
      // Force immediate refetch to ensure UI is updated
      setIsRefetching(true);
      try {
        await refetchProducts();
      } finally {
        setIsRefetching(false);
      }
      
      toast.success('Product updated successfully!');
    } catch (error: unknown) {
      console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      setError(errorMessage);
      // Don't close dialog on error - let user fix and retry
    } finally {
      setIsSaving(false);
    }
  }, [editingProduct, currentStore?.id, editingImageFile, uploadImage, updateProductMutation, refetchProducts]);

  const handleDeleteProduct = useCallback(async (id: string) => {
    if (!currentStore?.id) return;

    try {
      setIsSaving(true);
      setError(null);
      
      // Use the mutation hook - this will automatically invalidate cache on success
      await deleteProductMutation.mutateAsync(id);
      
      // Force immediate refetch to ensure UI is updated
      setIsRefetching(true);
      try {
        await refetchProducts();
      } finally {
        setIsRefetching(false);
      }
      
      toast.success('Product deleted successfully!');
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      setError(errorMessage);
      toast.error('Failed to delete product');
    } finally {
      setIsSaving(false);
    }
  }, [currentStore, deleteProductMutation, refetchProducts]);

  const handleCloneProduct = useCallback(async (product: Product) => {
    if (!currentStore?.id) return;

    try {
      setIsSaving(true);
      setError(null);

      const timestamp = Date.now();
      const uniqueSuffix = `_COPY_${timestamp}`;

      const clonedProduct = {
        name: `${product.name} (Copy)`,
        price: product.price,
        cost: product.cost || 0,
        sku: `${product.sku}${uniqueSuffix}`,
        barcode: product.barcode ? `${product.barcode}${uniqueSuffix}` : '',
        description: product.description,
        stock_quantity: product.stock_quantity,
        min_stock_level: product.min_stock_level,
        category_id: product.category_id,
        supplier_id: product.supplier_id,
        brand_id: product.brand_id,
        image_url: product.image_url,
        is_active: product.is_active,
        reorder_level: product.reorder_level,
      };

      setNewProduct(clonedProduct);
      setSelectedImageFile(null);

      if (isAddDialogOpen) {
        setIsAddDialogOpen(false);
        setTimeout(() => {
          setIsAddDialogOpen(true);
        }, 100);
      } else {
        setIsAddDialogOpen(true);
      }

      toast.success('Product cloned successfully! You can now modify and save the cloned product.');
    } catch (error: unknown) {
      console.error('Error cloning product:', error);
      setError(error instanceof Error ? error.message : 'Failed to clone product');
    } finally {
      setIsSaving(false);
    }
  }, [currentStore?.id, isAddDialogOpen]);

  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setError(null);
    resetNewProductForm();
  }, [resetNewProductForm]);

  const closeEditDialog = useCallback(() => {
    setEditingProduct(null);
    setEditingImageFile(null);
    setError(null);
  }, []);

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (product.stock_quantity <= (product.reorder_level || product.min_stock_level || 10)) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  // Export products to CSV
  const exportProducts = useCallback((e?: React.MouseEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (filteredProducts.length === 0) {
      toast.error('No products to export');
      return;
    }

    import('../utils/export-utils').then(({ exportProducts: exportProductsUtil }) => {
      try {
        exportProductsUtil(filteredProducts, {
          storeName: currentStore?.name
        });
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export products');
      }
    }).catch(error => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [filteredProducts, currentStore?.name]);

  // Download sample CSV
  const downloadSampleCSV = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/sample-products-import.csv';
    link.download = 'sample-products-import.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample CSV downloaded!');
  }, []);

  // Handle product import
  const handleImport = useCallback(async () => {
    if (!importFile || !currentStore?.id || !currentBusiness?.id) {
      toast.error('Please select a file and ensure you have a store selected');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('store_id', currentStore.id);
      formData.append('business_id', currentBusiness.id);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data.result);
      
      if (data.result.imported > 0) {
        toast.success(`Successfully imported ${data.result.imported} product(s)!`);
        // Refresh products list
        await refetchProducts();
        // Note: Categories and brands hooks will auto-refetch on next render
        // Close dialog after a short delay to show results
        setTimeout(() => {
          if (data.result.failed === 0) {
            setShowImportDialog(false);
            setImportFile(null);
            setImportResult(null);
          }
        }, 2000);
      }

      if (data.result.failed > 0) {
        toast.warning(`${data.result.failed} product(s) failed to import. Check the details below.`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import products');
    } finally {
      setImporting(false);
    }
  }, [importFile, currentStore?.id, currentBusiness?.id, refetchProducts]);

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (product: Product) => (
        <div className="min-w-0">
          <p className="font-medium break-words">{product.name}</p>
          <p className="text-sm text-muted-foreground break-words">{product.sku}</p>
          {product.barcode && (
            <p className="text-xs text-muted-foreground break-words">Barcode: {product.barcode}</p>
          )}
        </div>
      )
    },
    {
      key: 'image',
      label: 'Image',
      render: (product: Product) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-100">
          {product.image_url ? (
            <Image 
              src={product.image_url} 
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center text-gray-400 text-xs ${product.image_url ? 'hidden' : ''}`}>
            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">IMG</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (product: Product) => {
        return product.category?.name || 
               (product.category_id && categories.find((c: Category) => c.id === product.category_id)?.name) ||
               'No Category';
      }
    },
    {
      key: 'price',
      label: 'Selling Price',
      render: (product: Product) => formatCurrency(product.price)
    },
    {
      key: 'cost',
      label: 'Cost Price',
      render: (product: Product) => formatCurrency(product.cost || 0)
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product: Product) => (
        <div>
          <span className={product.stock_quantity <= (product.reorder_level || product.min_stock_level || 10) ? 'text-orange-600 font-semibold' : ''}>
            {product.stock_quantity}
          </span>
          <span className="text-sm text-muted-foreground ml-1">
            (min: {product.min_stock_level})
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (product: Product) => {
        const status = getStockStatus(product);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      }
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (product: Product) => {
        return product.supplier?.name || 
               (product.supplier_id && suppliers.find((s: Supplier) => s.id === product.supplier_id)?.name) ||
               'No Supplier';
      }
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (product: Product) => {
        return product.brand?.name || 
               (product.brand_id && brands.find((b: Brand) => b.id === product.brand_id)?.name) ||
               'No Brand';
      }
    },
    {
      key: 'public',
      label: 'Public',
      render: (product: Product) => (
        <div className="flex items-center">
          {product.is_public ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              Public
            </Badge>
          ) : (
            <Badge variant="secondary">
              Private
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product: Product) => {
        return (
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => {
            // Clear any previous editing state first
            setEditingImageFile(null);
            setError(null);
            // Then set the new product to edit
            setEditingProduct(product);
          }} disabled={isSaving || !hasPermission() || updateProductMutation.isPending || isMutating}>
            <Edit className="w-3 h-3" />
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleCloneProduct(product)}
            disabled={isSaving || !hasPermission() || isMutating}
            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            title={`Clone "${product.name}" to create a similar product`}
          >
            <Copy className="w-3 h-3 mr-1" />
            Clone
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => {
              setProductToDelete(product);
              setShowDeleteDialog(true);
            }}
            disabled={isSaving || !hasPermission() || deleteProductMutation.isPending || isMutating}
            className="bg-red-500 hover:bg-red-600 text-white"
            title="Delete product"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout
        title="Product Management"
        subtitle="Loading products..."
      >
        <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
        title="Product Management"
        subtitle={selectedStoreFilter === 'All' ? 'Managing inventory across all stores' : 
                 currentStore ? `Managing inventory for ${currentStore.name}` : 'Manage inventory and product catalog'}
      >
        {/* Success Message */}
        {!isMutating && !isRefetching && !error && (createProductMutation.isSuccess || updateProductMutation.isSuccess || deleteProductMutation.isSuccess) && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-green-800 text-sm">
                  {createProductMutation.isSuccess && 'Product created successfully!'}
                  {updateProductMutation.isSuccess && 'Product updated successfully!'}
                  {deleteProductMutation.isSuccess && 'Product deleted successfully!'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {(error || productsErrorCombined) && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800 text-sm">{error || productsErrorCombined?.message || 'An error occurred'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setError(null);
                    refetchProducts();
                  }}
                  disabled={isLoadingProducts}
                >
                  <RefreshCw className={`w-3 h-3 mr-2 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mutation Status */}
        {(isMutating || isRefetching) && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-blue-800 text-sm">
                  {createProductMutation.isPending && 'Creating product...'}
                  {updateProductMutation.isPending && 'Updating product...'}
                  {deleteProductMutation.isPending && 'Deleting product...'}
                  {isRefetching && 'Refreshing data...'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-semibold">{filteredProducts.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-orange-600">{lowStockProducts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stock Value</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(filteredProducts.reduce((sum: number, p: Product) => sum + p.price * p.stock_quantity, 0))}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-600 mb-3">
                The following products are running low on stock:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map((product: Product) => (
                  <Badge key={product.id} variant="outline" className="text-orange-700 border-orange-300">
                    {product.name} ({product.stock_quantity} left)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Search products, SKU, barcode, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4 flex-shrink-0">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {user?.role === 'business_admin' && stores.length > 1 && (
                  <Select value={selectedStoreFilter} onValueChange={setSelectedStoreFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Stores</SelectItem>
                      {stores
                        .filter((store: any) => store.is_active)
                        .map((store: any) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <DataTable
          title="Products"
          data={filteredProducts}
          columns={columns}
          onExport={exportProducts}
          emptyMessage="No products found"
          tableName="products"
          userRole={user?.role}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={downloadSampleCSV}
                title="Download sample CSV template"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Sample CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(true)}
                disabled={!currentStore?.id}
                title="Import products from CSV"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} disabled={!hasPermission()} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          }
        />

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent key={editingProduct?.id || 'no-product'} className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product details.
              </DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <ScrollArea key={`edit-${editingProduct.id}`} className="max-h-[70vh] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="Enter product name"
                        autoFocus
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-price">
                        Selling Price <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-sku">SKU</Label>
                      <Input
                        id="edit-sku"
                        value={editingProduct.sku}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        placeholder="Enter SKU"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cost">
                        Cost Price <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-cost"
                        type="number"
                        step="0.01"
                        value={editingProduct.cost || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-barcode">Barcode</Label>
                      <Input
                        id="edit-barcode"
                        value={editingProduct.barcode || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                        placeholder="Enter barcode"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-unit">Unit</Label>
                      <Select
                        value={editingProduct.unit || ''}
                        onValueChange={(value) => setEditingProduct({ ...editingProduct, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.length > 0 ? (
                            units
                              .filter((unit: { is_active: boolean }) => unit.is_active)
                              .sort((a: { sort_order: number }, b: { sort_order: number }) => 
                                (a.sort_order || 0) - (b.sort_order || 0)
                              )
                              .map((unit: { id: string; name: string; symbol?: string | null }) => (
                                <SelectItem key={unit.id} value={unit.name}>
                                  {unit.name}{unit.symbol ? ` (${unit.symbol})` : ''}
                                </SelectItem>
                              ))
                          ) : (
                            <>
                              <SelectItem value="piece">Piece</SelectItem>
                              <SelectItem value="packet">Packet</SelectItem>
                              <SelectItem value="dozen">Dozen</SelectItem>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="kg">Kilogram (kg)</SelectItem>
                              <SelectItem value="g">Gram (g)</SelectItem>
                              <SelectItem value="liter">Liter</SelectItem>
                              <SelectItem value="ml">Milliliter (ml)</SelectItem>
                              <SelectItem value="meter">Meter</SelectItem>
                              <SelectItem value="cm">Centimeter (cm)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-reorder">Reorder Level</Label>
                      <Input
                        id="edit-reorder"
                        type="number"
                        value={editingProduct.reorder_level || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, reorder_level: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-stock">
                        Current Stock <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-stock"
                        type="number"
                        value={editingProduct.stock_quantity}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-minStock">Min Stock</Label>
                      <Input
                        id="edit-minStock"
                        type="number"
                        value={editingProduct.min_stock_level}
                        onChange={(e) => setEditingProduct({ ...editingProduct, min_stock_level: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-category">Category</Label>
                      <Select 
                        value={editingProduct.category_id || ''} 
                        onValueChange={(value) => setEditingProduct({ ...editingProduct, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category">
                            {editingProduct.category_id ? 
                              categories.find((c: Category) => c.id === editingProduct.category_id)?.name || 'Unknown Category' 
                              : 'Select category'
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter((c: Category) => c.is_active).map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-supplier">Supplier</Label>
                      <Select 
                        value={editingProduct.supplier_id || ''} 
                        onValueChange={(value) => setEditingProduct({ ...editingProduct, supplier_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier">
                            {editingProduct.supplier_id ? 
                              suppliers.find((s: Supplier) => s.id === editingProduct.supplier_id)?.name || 'Unknown Supplier' 
                              : 'Select supplier'
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.filter((s: Supplier) => s.is_active).map((supplier: Supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              <div>
                                <p className="font-medium">{supplier.name}</p>
                                {supplier.contact_person && (
                                  <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-brand">Brand</Label>
                      <Select 
                        value={editingProduct.brand_id || ''} 
                        onValueChange={(value) => setEditingProduct({ ...editingProduct, brand_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand">
                            {editingProduct.brand_id ? 
                              brands.find((b: Brand) => b.id === editingProduct.brand_id)?.name || 'Unknown Brand' 
                              : 'Select brand'
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {brands.filter((b: Brand) => b.is_active).map((brand: Brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-public-description">Public Description (for website)</Label>
                    <Textarea
                      id="edit-public-description"
                      value={editingProduct.public_description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, public_description: e.target.value })}
                      placeholder="Enter public description for your website"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-is-public"
                      checked={editingProduct.is_public || false}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_public: checked })}
                    />
                    <Label htmlFor="edit-is-public">Show on public website</Label>
                  </div>

                                  {/* Image Upload Section for Edit */}
                <ImageUpload
                  currentImageUrl={editingProduct.image_url}
                  onImageChange={(file, imageUrl) => {
                    setEditingImageFile(file);
                    setEditingProduct({ ...editingProduct, image_url: imageUrl || undefined });
                  }}
                  disabled={isSaving || isMutating}
                  placeholder="Upload product image"
                />

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={closeEditDialog} disabled={isSaving || isMutating}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditProduct} disabled={isSaving || updateProductMutation.isPending || isMutating}>
                      {isSaving || updateProductMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Product'
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {newProduct.name && newProduct.name.includes('(Copy)') ? 'Clone Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {newProduct.name && newProduct.name.includes('(Copy)') 
                  ? `Review and modify the cloned product details. Original: ${newProduct.name.replace(' (Copy)', '')}`
                  : 'Enter the details for the new product.'
                }
              </DialogDescription>
              {newProduct.name && newProduct.name.includes('(Copy)') && (
                <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
                  <p className="font-medium text-blue-800 mb-1">Cloned Fields:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>• Selling Price: {formatCurrency(newProduct.price || 0)}</span>
                    <span>• Cost Price: {formatCurrency(newProduct.cost || 0)}</span>
                    <span>• Category: {categories.find((c: Category) => c.id === newProduct.category_id)?.name || 'None'}</span>
                    <span>• Supplier: {suppliers.find((s: Supplier) => s.id === newProduct.supplier_id)?.name || 'None'}</span>
                    <span>• Brand: {brands.find((b: Brand) => b.id === newProduct.brand_id)?.name || 'None'}</span>
                  </div>
                </div>
              )}
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-name">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-name"
                      value={newProduct.name || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-price">
                      Selling Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-price"
                      type="number"
                      step="0.01"
                      value={newProduct.price || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-sku">SKU</Label>
                    <Input
                      id="add-sku"
                      value={newProduct.sku || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="Enter SKU"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-cost">
                      Cost Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-cost"
                      type="number"
                      step="0.01"
                      value={newProduct.cost || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="add-barcode">Barcode</Label>
                    <Input
                      id="add-barcode"
                      value={newProduct.barcode || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                      placeholder="Enter barcode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-unit">Unit</Label>
                    <Select
                      value={newProduct.unit || ''}
                      onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.length > 0 ? (
                          units
                            .filter((unit: { is_active: boolean }) => unit.is_active)
                            .sort((a: { sort_order: number }, b: { sort_order: number }) => 
                              (a.sort_order || 0) - (b.sort_order || 0)
                            )
                            .map((unit: { id: string; name: string; symbol?: string | null }) => (
                              <SelectItem key={unit.id} value={unit.name}>
                                {unit.name}{unit.symbol ? ` (${unit.symbol})` : ''}
                              </SelectItem>
                            ))
                        ) : (
                          <>
                            <SelectItem value="piece">Piece</SelectItem>
                            <SelectItem value="packet">Packet</SelectItem>
                            <SelectItem value="dozen">Dozen</SelectItem>
                            <SelectItem value="box">Box</SelectItem>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="g">Gram (g)</SelectItem>
                            <SelectItem value="liter">Liter</SelectItem>
                            <SelectItem value="ml">Milliliter (ml)</SelectItem>
                            <SelectItem value="meter">Meter</SelectItem>
                            <SelectItem value="cm">Centimeter (cm)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="add-reorder">Reorder Level</Label>
                    <Input
                      id="add-reorder"
                      type="number"
                      value={newProduct.reorder_level || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, reorder_level: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="add-stock">
                      Current Stock <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-stock"
                      type="number"
                      value={newProduct.stock_quantity || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-minStock">Min Stock</Label>
                    <Input
                      id="add-minStock"
                      type="number"
                      value={newProduct.min_stock_level || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, min_stock_level: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-category">Category</Label>
                    <Select 
                      value={newProduct.category_id || ''} 
                      onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category">
                          {newProduct.category_id ? 
                            categories.find((c: Category) => c.id === newProduct.category_id)?.name || 'Unknown Category' 
                            : 'Select category'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter((c: Category) => c.is_active).map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-supplier">Supplier</Label>
                    <Select 
                      value={newProduct.supplier_id || ''} 
                      onValueChange={(value) => setNewProduct({ ...newProduct, supplier_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier">
                          {newProduct.supplier_id ? 
                            suppliers.find((s: Supplier) => s.id === newProduct.supplier_id)?.name || 'Unknown Supplier' 
                            : 'Select supplier'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.filter((s: Supplier) => s.is_active).map((supplier: Supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            <div>
                              <p className="font-medium">{supplier.name}</p>
                              {supplier.contact_person && (
                                <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="add-brand">Brand</Label>
                    <Select 
                      value={newProduct.brand_id || ''} 
                      onValueChange={(value) => setNewProduct({ ...newProduct, brand_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand">
                          {newProduct.brand_id ? 
                            brands.find((b: Brand) => b.id === newProduct.brand_id)?.name || 'Unknown Brand' 
                            : 'Select brand'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {brands.filter((b: Brand) => b.is_active).map((brand: Brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="add-description">Description</Label>
                  <Textarea
                    id="add-description"
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="add-public-description">Public Description (for website)</Label>
                  <Textarea
                    id="add-public-description"
                    value={newProduct.public_description || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, public_description: e.target.value })}
                    placeholder="Enter public description for your website"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="add-is-public"
                    checked={newProduct.is_public || false}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_public: checked })}
                  />
                  <Label htmlFor="add-is-public">Show on public website</Label>
                </div>

                {/* Image Upload Section for Add */}
                <ImageUpload
                  currentImageUrl={newProduct.image_url}
                  onImageChange={(file, imageUrl) => {
                    setSelectedImageFile(file);
                    setNewProduct({ ...newProduct, image_url: imageUrl || undefined });
                  }}
                  disabled={isSaving || isMutating}
                  placeholder="Upload product image"
                />

                <div className="flex gap-2 justify-end pt-4 border-t">
                  {newProduct.name && newProduct.name.includes('(Copy)') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        resetNewProductForm();
                        toast.info('Form cleared. You can now enter new product details.');
                      }} 
                      disabled={isSaving || isMutating}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      Clear Cloned Data
                    </Button>
                  )}
                  <Button variant="outline" onClick={closeAddDialog} disabled={isSaving || isMutating}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct} disabled={isSaving || !newProduct.name || createProductMutation.isPending || isMutating}>
                    {isSaving || createProductMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                      ) : (
                        'Save Product'
                      )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setProductToDelete(null);
                  setShowDeleteDialog(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (productToDelete) {
                    handleDeleteProduct(productToDelete.id);
                    setProductToDelete(null);
                    setShowDeleteDialog(false);
                  }
                }}
                disabled={!hasPermission() || deleteProductMutation.isPending || isMutating}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Products Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Products from CSV
              </DialogTitle>
              <DialogDescription>
                Upload a CSV file to import multiple products at once. Categories and brands will be created automatically if they don&apos;t exist.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertTitle>Import Instructions</AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Download the sample CSV template to see the required format</li>
                    <li>Required columns: <strong>name</strong>, <strong>price</strong></li>
                    <li>Optional columns: sku, barcode, description, cost, stock_quantity, min_stock_level, reorder_level, category, brand, supplier, is_active, is_public, public_description</li>
                    <li>Categories and brands will be automatically created if they don&apos;t exist</li>
                    <li>Products with duplicate SKU or barcode in the same store will be skipped</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="import-file">Select CSV File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImportFile(file);
                      setImportResult(null);
                    }
                  }}
                  className="mt-1"
                />
                {importFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {importResult && (
                <div className="space-y-3">
                  <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                    <AlertTitle className={importResult.success ? 'text-green-800' : 'text-yellow-800'}>
                      Import Results
                    </AlertTitle>
                    <AlertDescription className={importResult.success ? 'text-green-700' : 'text-yellow-700'}>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between">
                          <span>Total Rows:</span>
                          <strong>{importResult.totalRows}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Successfully Imported:</span>
                          <strong className="text-green-600">{importResult.imported}</strong>
                        </div>
                        {importResult.failed > 0 && (
                          <div className="flex justify-between">
                            <span>Failed:</span>
                            <strong className="text-red-600">{importResult.failed}</strong>
                          </div>
                        )}
                        {importResult.createdCategories.length > 0 && (
                          <div className="mt-2">
                            <span className="font-semibold">Created Categories:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {importResult.createdCategories.map((cat, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {importResult.createdBrands.length > 0 && (
                          <div className="mt-2">
                            <span className="font-semibold">Created Brands:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {importResult.createdBrands.map((brand, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {brand}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>

                  {importResult.errors.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                      <Label className="text-sm font-semibold mb-2 block">Errors:</Label>
                      <div className="space-y-1">
                        {importResult.errors.map((error, idx) => (
                          <div key={idx} className="text-sm text-red-600">
                            Row {error.row}: {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportDialog(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                  disabled={importing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importFile || importing || !currentStore?.id}
                  className="flex-1"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Products
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </DashboardLayout>
  );
};