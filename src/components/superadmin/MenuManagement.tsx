import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ShoppingCart, 
  Users,
  Settings,
  Building2,
  FolderOpen,
  Tag,
  Truck,
  UserPlus,
  UserCheck,
  Shield,
  FileText,
  Activity,
  Menu,
  ChefHat,
  Calendar,
  FlaskConical,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  color: string;
  bg_color: string;
  business_type: string;
  requires_feature?: string;
  user_roles: string[];
  sort_order: number;
  is_active?: boolean;
  category_id?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg_color: string;
  sort_order: number;
}

interface BusinessTypeMenu {
  id: string;
  business_type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg_color: string;
}

export const MenuManagement: React.FC = () => {
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('retail');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    title: '',
    description: '',
    action: '',
    icon: 'Package',
    color: 'text-blue-600',
    bg_color: 'bg-blue-50',
    business_type: 'retail',
    requires_feature: 'none',
    user_roles: ['business_admin'],
    sort_order: 0,
    is_active: true
  });

  // Mock data for now - replace with actual API calls
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [businessTypeMenu, setBusinessTypeMenu] = useState<BusinessTypeMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load categories from API
      const categoriesResponse = await fetch('/api/menu/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

      // Load menu items from API
      const menuItemsResponse = await fetch('/api/menu/items');
      if (menuItemsResponse.ok) {
        const menuItemsData = await menuItemsResponse.json();
        setAllMenuItems(menuItemsData.items || []);
      }

      // Load business type menu from API
      const businessTypeResponse = await fetch(`/api/menu/business-type/${selectedBusinessType}`);
      if (businessTypeResponse.ok) {
        const businessTypeData = await businessTypeResponse.json();
        setBusinessTypeMenu(businessTypeData.menu || null);
      }

    } catch (err: unknown) {
      console.error('Failed to load menu data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusinessType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading menu data: {error}</p>
          <Button onClick={loadData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Icon mapping for the icon selector
  const iconOptions = [
    { value: 'Package', label: 'Package', icon: Package },
    { value: 'ShoppingCart', label: 'Shopping Cart', icon: ShoppingCart },
    { value: 'Users', label: 'Users', icon: Users },
    { value: 'Settings', label: 'Settings', icon: Settings },
    { value: 'Building2', label: 'Building', icon: Building2 },
    { value: 'FolderOpen', label: 'Folder', icon: FolderOpen },
    { value: 'Tag', label: 'Tag', icon: Tag },
    { value: 'Truck', label: 'Truck', icon: Truck },
    { value: 'UserPlus', label: 'User Plus', icon: UserPlus },
    { value: 'UserCheck', label: 'User Check', icon: UserCheck },
    { value: 'Shield', label: 'Shield', icon: Shield },
    { value: 'FileText', label: 'File Text', icon: FileText },
    { value: 'Activity', label: 'Activity', icon: Activity },
    { value: 'Menu', label: 'Menu', icon: Menu },
    { value: 'ChefHat', label: 'Chef Hat', icon: ChefHat },
    { value: 'Calendar', label: 'Calendar', icon: Calendar },
    { value: 'FlaskConical', label: 'Flask', icon: FlaskConical },
    { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
    { value: 'BarChart3', label: 'Bar Chart', icon: BarChart3 }
  ];

  // Business type options
  const businessTypes = [
    { value: 'retail', label: 'Retail' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'service', label: 'Service' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'all', label: 'All Business Types' }
  ];

  // Role options
  const roleOptions = [
    { value: 'business_admin', label: 'Business Admin' },
    { value: 'store_admin', label: 'Store Admin' },
    { value: 'cashier', label: 'Cashier' }
  ];

  // Feature options
  const featureOptions = [
    { value: 'stockTracking', label: 'Stock Tracking' },
    { value: 'inventoryAlerts', label: 'Inventory Alerts' },
    { value: 'restockManagement', label: 'Restock Management' },
    { value: 'recipeManagement', label: 'Recipe Management' },
    { value: 'serviceBooking', label: 'Service Booking' },
    { value: 'menuManagement', label: 'Menu Management' },
    { value: 'ingredientTracking', label: 'Ingredient Tracking' }
  ];

  // Filter menu items by selected business type
  const filteredMenuItems = allMenuItems.filter((item: MenuItem) => 
    item.business_type === selectedBusinessType || item.business_type === 'all'
  );

  // Group items by category
  const groupedItems = filteredMenuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
    if (!categories || categories.length === 0) {
      // If no categories available, group all items under "Unknown"
      if (!acc['Unknown']) {
        acc['Unknown'] = [];
      }
      acc['Unknown'].push(item);
      return acc;
    }

    const categoryId = item.category_id;
    const category = categories.find((cat: MenuCategory) => cat.id === categoryId);
    const categoryName = category?.name || 'Unknown';
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  // Handle adding new menu item
  const handleAddItem = async () => {
    try {
      if (!categories || categories.length === 0) {
        alert('No menu categories available. Please ensure the database is properly set up.');
        return;
      }

      const category = categories.find((cat: MenuCategory) => cat.name === 'menu');
      if (!category) {
        alert('Menu category not found. Please ensure the database has the required menu categories.');
        return;
      }

      const response = await fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          category_id: category.id,
          business_type: selectedBusinessType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add menu item');
      }

      setIsAddingItem(false);
      setNewItem({
        title: '',
        description: '',
        action: '',
        icon: 'Package',
        color: 'text-blue-600',
        bg_color: 'bg-blue-50',
        business_type: 'retail',
        requires_feature: 'none',
        user_roles: ['business_admin'],
        sort_order: 0,
        is_active: true
      });
      toast.success('Menu item added successfully!');
      loadData();
    } catch (error: unknown) {
      console.error('Error adding menu item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add menu item');
    }
  };

  // Handle updating menu item
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/menu/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          action: editingItem.action,
          icon: editingItem.icon,
          color: editingItem.color,
          bg_color: editingItem.bg_color,
          requires_feature: editingItem.requires_feature || null,
          user_roles: editingItem.user_roles,
          sort_order: editingItem.sort_order,
          is_active: editingItem.is_active
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update menu item');
      }

      setEditingItem(null);
      toast.success('Menu item updated successfully!');
      loadData();
    } catch (error: unknown) {
      console.error('Error updating menu item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update menu item');
    }
  };

  // Handle deleting menu item
  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/menu/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete menu item');
      }

      setDeleteConfirmItem(null);
      toast.success('Menu item deleted successfully!');
      loadData();
    } catch (error: unknown) {
      console.error('Error deleting menu item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete menu item');
    }
  };

  // Handle role selection
  const handleRoleToggle = (role: string, checked: boolean) => {
    if (!editingItem) return;

    const updatedRoles = checked
      ? [...editingItem.user_roles, role]
      : editingItem.user_roles.filter(r => r !== role);

    setEditingItem({ ...editingItem, user_roles: updatedRoles });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-2">
            Manage menu items for different business types
          </p>
        </div>
        <Button onClick={() => setIsAddingItem(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Business Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Business Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {businessTypeMenu && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{businessTypeMenu.icon}</span>
                <div>
                  <h4 className="font-medium">{businessTypeMenu.name}</h4>
                  <p className="text-sm text-gray-600">{businessTypeMenu.description}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Menu Item */}
      {isAddingItem && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Menu Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Menu item title"
                />
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  value={newItem.action}
                  onChange={(e) => setNewItem({ ...newItem, action: e.target.value })}
                  placeholder="e.g., products, categories"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Menu item description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={newItem.icon} onValueChange={(value) => setNewItem({ ...newItem, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="color">Text Color</Label>
                <Input
                  id="color"
                  value={newItem.color}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  placeholder="e.g., text-blue-600"
                />
              </div>
              
              <div>
                <Label htmlFor="bg_color">Background Color</Label>
                <Input
                  id="bg_color"
                  value={newItem.bg_color}
                  onChange={(e) => setNewItem({ ...newItem, bg_color: e.target.value })}
                  placeholder="e.g., bg-blue-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requires_feature">Requires Feature</Label>
                <Select value={newItem.requires_feature || 'none'} onValueChange={(value) => setNewItem({ ...newItem, requires_feature: value === 'none' ? undefined : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feature (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No feature required</SelectItem>
                    {featureOptions.map(feature => (
                      <SelectItem key={feature.value} value={feature.value}>
                        {feature.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={newItem.sort_order}
                  onChange={(e) => setNewItem({ ...newItem, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label>User Roles</Label>
              <div className="flex gap-2 mt-2">
                {roleOptions.map(role => (
                  <label key={role.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newItem.user_roles?.includes(role.value)}
                      onChange={(e) => {
                        const updatedRoles = e.target.checked
                          ? [...(newItem.user_roles || []), role.value]
                          : (newItem.user_roles || []).filter(r => r !== role.value);
                        setNewItem({ ...newItem, user_roles: updatedRoles });
                      }}
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddItem}>Save</Button>
              <Button variant="outline" onClick={() => setIsAddingItem(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Items by Category */}
      {Object.entries(groupedItems).map(([categoryName, items]) => (
        <Card key={categoryName}>
          <CardHeader>
            <CardTitle className="capitalize">{categoryName} Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No menu items found for this category.</p>
            ) : (
              <div className="space-y-4">
                {items
                  .sort((a: MenuItem, b: MenuItem) => a.sort_order - b.sort_order)
                  .map((item: MenuItem) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${item.bg_color} rounded-lg flex items-center justify-center`}>
                          {(() => {
                            const IconComponent = iconOptions.find(opt => opt.value === item.icon)?.icon || Package;
                            return <IconComponent className={`w-6 h-6 ${item.color}`} />;
                          })()}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{item.action}</Badge>
                            <Badge variant="secondary">{item.business_type}</Badge>
                            {item.requires_feature && item.requires_feature !== 'none' && (
                              <Badge variant="outline">{item.requires_feature}</Badge>
                            )}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {item.user_roles.map((role: string) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmItem(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Edit Menu Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Menu Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-action">Action</Label>
                  <Input
                    id="edit-action"
                    value={editingItem.action}
                    onChange={(e) => setEditingItem({ ...editingItem, action: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-icon">Icon</Label>
                  <Select value={editingItem.icon} onValueChange={(value) => setEditingItem({ ...editingItem, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-color">Text Color</Label>
                  <Input
                    id="edit-color"
                    value={editingItem.color}
                    onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-bg_color">Background Color</Label>
                  <Input
                    id="edit-bg_color"
                    value={editingItem.bg_color}
                    onChange={(e) => setEditingItem({ ...editingItem, bg_color: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-requires_feature">Requires Feature</Label>
                  <Select value={editingItem.requires_feature || 'none'} onValueChange={(value) => setEditingItem({ ...editingItem, requires_feature: value === 'none' ? undefined : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feature (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No feature required</SelectItem>
                      {featureOptions.map(feature => (
                        <SelectItem key={feature.value} value={feature.value}>
                          {feature.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-sort_order">Sort Order</Label>
                  <Input
                    id="edit-sort_order"
                    type="number"
                    value={editingItem.sort_order}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label>User Roles</Label>
                <div className="flex gap-2 mt-2">
                  {roleOptions.map(role => (
                    <label key={role.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingItem.user_roles.includes(role.value)}
                        onChange={(e) => handleRoleToggle(role.value, e.target.checked)}
                      />
                      {role.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-is_active"
                  checked={editingItem.is_active}
                  onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateItem}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Menu Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                <div className={`w-12 h-12 ${deleteConfirmItem.bg_color} rounded-lg flex items-center justify-center`}>
                  {(() => {
                    const IconComponent = iconOptions.find(opt => opt.value === deleteConfirmItem.icon)?.icon || Package;
                    return <IconComponent className={`w-6 h-6 ${deleteConfirmItem.color}`} />;
                  })()}
                </div>
                <div>
                  <h4 className="font-medium">{deleteConfirmItem.title}</h4>
                  <p className="text-sm text-gray-600">{deleteConfirmItem.description}</p>
                </div>
              </div>
              
              <p className="text-gray-700">
                Are you sure you want to delete this menu item? This action cannot be undone.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteItem(deleteConfirmItem.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirmItem(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
