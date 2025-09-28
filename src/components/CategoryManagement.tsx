import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Header } from '@/components/common/Header';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useBusinessCategories,
  useCreateBusinessCategory,
  useUpdateBusinessCategory,
  useDeleteBusinessCategory
} from '@/utils/hooks/useStoreData';
import { toast } from 'sonner';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  TrendingUp,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { CategoryFormData } from '@/types';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

interface CategoryManagementProps {
  onBack: () => void;
}

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ onBack }) => {
  const { user, currentBusiness } = useAuth();
  const { translate } = useSystem();
  
  // Simple permission check - replace with proper permission system later
  const hasPermission = (permission: string) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'business_admin') return true;
    if (user?.role === 'store_admin') return true;
    return false;
  };
  
  // Check if user is store admin
  const isStoreAdmin = user?.role === 'store_admin';
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    color: '#3B82F6',
    is_active: true
  });

  // React Query hooks
  const {
    data: dbCategories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories
  } = useBusinessCategories(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });

  // React Query mutations
  const createCategoryMutation = useCreateBusinessCategory(currentBusiness?.id || '');
  const updateCategoryMutation = useUpdateBusinessCategory(currentBusiness?.id || '');
  const deleteCategoryMutation = useDeleteBusinessCategory(currentBusiness?.id || '');

  // Loading states
  const isLoading = isLoadingCategories;
  const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending;

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    return dbCategories.filter((category: Category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dbCategories, searchTerm]);

  // Statistics
  const totalProducts = useMemo(() => 
    dbCategories.reduce((sum: number, cat: Category) => sum + (cat.product_count || 0), 0), 
    [dbCategories]
  );
  
  const activeCategories = useMemo(() => 
    dbCategories.filter((cat: Category) => cat.is_active).length, 
    [dbCategories]
  );

  // Handlers
  const handleAddCategory = useCallback(async () => {
    if (!currentBusiness?.id || !newCategory.name) return;

    try {
      const categoryData = {
        name: newCategory.name,
        description: newCategory.description || '',
        color: newCategory.color || '#3B82F6',
        is_active: newCategory.is_active !== false,
        business_id: currentBusiness?.id || ''
      };
      
      await createCategoryMutation.mutateAsync(categoryData);
      
      // Reset form and close dialog
      setNewCategory({
        name: '',
        description: '',
        color: '#3B82F6',
        is_active: true
      });
      setIsAddDialogOpen(false);
      
    } catch (error: unknown) {
      console.error('Error adding category:', error);
      // Error handling is done in the mutation
    }
  }, [newCategory, currentBusiness, createCategoryMutation]);

  const handleEditCategory = useCallback(async () => {
    if (!editingCategory || !currentBusiness?.id) return;

    try {
      const updateData = {
        name: editingCategory.name,
        description: editingCategory.description,
        color: editingCategory.color,
        is_active: editingCategory.is_active,
        business_id: currentBusiness?.id || ''
      };
      
      await updateCategoryMutation.mutateAsync({
        categoryId: editingCategory.id,
        categoryData: updateData
      });
      
      // Close dialog and reset editing state
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      
    } catch (error: unknown) {
      console.error('Error updating category:', error);
      // Error handling is done in the mutation
    }
  }, [editingCategory, currentBusiness, updateCategoryMutation]);

  const handleDeleteCategory = useCallback(async (category: Category) => {
    if (!currentBusiness?.id) return;

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      // Success handling is done in the mutation
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      // Error handling is done in the mutation
    }
  }, [currentBusiness, deleteCategoryMutation]);

  // Refresh function for manual data refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refetchCategories();
      toast.success('Categories refreshed successfully');
    } catch (error) {
      console.error('Error refreshing categories:', error);
      toast.error('Failed to refresh categories');
    }
  }, [refetchCategories]);

  const toggleCategoryStatus = useCallback(async (id: string) => {
    const category = dbCategories.find((c: Category) => c.id === id);
    if (!category || !currentBusiness?.id) return;

    try {
      // Only update the fields that exist in the database schema
      const categoryData = {
        name: category.name,
        description: category.description,
        color: category.color,
        is_active: !category.is_active,
        business_id: currentBusiness?.id || ''
      };
      
      await updateCategoryMutation.mutateAsync({
        categoryId: id,
        categoryData: categoryData as unknown as CategoryFormData
      });
      
      // The categories will be automatically refreshed via React Query
    } catch (error: unknown) {
      console.error('Error toggling category status:', error);
      // Error handling is done in the mutation
    }
  }, [dbCategories, currentBusiness, updateCategoryMutation]);

  const openEditDialog = useCallback((category: Category) => {
    setEditingCategory({ ...category });
    setIsEditDialogOpen(true);
  }, []);

  const openAddDialog = useCallback(() => {
    setNewCategory({
      name: '',
      description: '',
      color: '#3B82F6',
      is_active: true
    });
    setIsAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setNewCategory({
      name: '',
      description: '',
      color: '#3B82F6',
      is_active: true
    });
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingCategory(null);
  }, []);

  // DataTable columns configuration
  const columns = [
    {
      key: 'category',
      header: 'Category',
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-lg"
            style={{ backgroundColor: category.color }}
          />
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="text-sm text-muted-foreground">ID: {category.id}</p>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (category: Category) => (
        <p className="max-w-xs truncate">{category.description}</p>
      )
    },
    {
      key: 'products',
      header: 'Products',
      render: (category: Category) => (
        <Badge variant="secondary">
          {category.product_count || 0} products
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={category.is_active}
            onCheckedChange={() => toggleCategoryStatus(category.id)}
            disabled={isSaving || !hasPermission('categories_edit')}
          />
          <Badge variant={category.is_active ? "default" : "secondary"}>
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (category: Category) => (
        <div>
          <p className="text-sm">
            {new Date(category.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated: {new Date(category.updated_at).toLocaleDateString()}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (category: Category) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => openEditDialog(category)}
            disabled={isSaving || !hasPermission('categories_edit')}
          >
            <Edit className="w-3 h-3" />
          </Button>
          {/* Only show delete button for non-store-admin users */}
          {!isStoreAdmin && (
            <AlertDialog>
              <Button 
                size="sm" 
                variant="destructive"
                disabled={(category.product_count || 0) > 0 || isSaving || !hasPermission('categories_delete')}
                onClick={() => {
                  // Handle delete action directly
                  if (category.product_count && category.product_count > 0) {
                    alert(`Cannot delete category with ${category.product_count} products`);
                    return;
                  }
                  handleDeleteCategory(category);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                    {(category.product_count || 0) > 0 && (
                      <span className="block mt-2 text-red-600 font-medium">
                        Warning: This category contains {category.product_count || 0} products and cannot be deleted.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteCategory(category)}
                    disabled={(category.product_count || 0) > 0 || !hasPermission('categories_delete')}
                  >
                    Delete Category
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Category Management"
        subtitle="Manage product categories for your business"
        showBackButton
        onBack={onBack}
        showLogout={false}
      >
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {categoriesError && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">
                {categoriesError.message || 'Failed to load categories'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Categories</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dbCategories.length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Categories</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : activeCategories}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dbCategories.length - activeCategories} inactive
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalProducts}
                  </p>
                  <p className="text-sm text-muted-foreground">Across all categories</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories DataTable */}
        <Card>
            <DataTable
              title="Categories"
              columns={[
                {
                  key: 'name',
                  label: 'Category',
                  render: (category: Category) => (
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'products',
                  label: 'Products',
                  render: (category: Category) => (
                    <div className="text-center">
                      <p className="font-semibold">{category.product_count || 0}</p>
                      <p className="text-xs text-muted-foreground">products</p>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (category: Category) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => toggleCategoryStatus(category.id)}
                        disabled={isSaving || !hasPermission('categories_edit')}
                      />
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (category: Category) => (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(category)}
                        disabled={!hasPermission('categories_edit')}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {/* Only show delete button for non-store-admin users */}
                      {!isStoreAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={isSaving || !hasPermission('categories_delete')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {category.name}? This action cannot be undone.
                                {category.product_count && category.product_count > 0 && (
                                  <span className="block mt-2 text-red-600">
                                    Warning: This category has {category.product_count} products. 
                                    Deleting it may affect your inventory organization.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category)}
                                disabled={isSaving}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete Category'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )
                }
              ]}
              data={filteredCategories}
              searchable={true}
              searchPlaceholder="Search categories..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              emptyMessage={
                searchTerm 
                  ? `No categories match your search for "${searchTerm}"` 
                  : 'Start by adding your first category to organize your products'
              }
              tableName="categories"
              userRole={user?.role}
              actions={
                <Button size="sm" onClick={openAddDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              }
            />
        </Card>
      </main>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category to organize your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Category Name</Label>
              <Input
                id="add-name"
                value={newCategory.name || ''}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="add-description">Description</Label>
              <Input
                id="add-description"
                value={newCategory.description || ''}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Enter category description"
              />
            </div>

            <div>
              <Label>Category Color</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 ${
                      newCategory.color === color ? 'border-gray-900' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="add-active"
                checked={newCategory.is_active}
                onCheckedChange={(checked) => setNewCategory({ ...newCategory, is_active: checked })}
              />
              <Label htmlFor="add-active">Active Category</Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeAddDialog} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={isSaving || !newCategory.name}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Category'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <Label>Category Color</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-lg border-2 ${
                        editingCategory.color === color ? 'border-gray-900' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingCategory.is_active}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, is_active: checked })}
                />
                <Label htmlFor="edit-active">Active Category</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={closeEditDialog} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleEditCategory} disabled={isSaving || !editingCategory.name}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};