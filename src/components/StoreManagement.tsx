import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoRestrictions } from '@/hooks/useDemoRestrictions';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Store as StoreIcon, 
  Phone, 
  Mail, 
  MapPin,
  Building,
  Users,
  Plus,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useBusinessStores,
  useCreateStore,
  useUpdateStore,
  useDeleteStore
} from '@/utils/hooks/stores';

interface StoreManagementProps {
  onBack?: () => void; // Optional for backward compatibility
}

interface Store {
  id: string;
  business_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  country_id?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  currency_id?: string;
  language_id?: string;
  is_active: boolean;
  created_at: string;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({ onBack }) => {
  const router = useRouter();
  const { user, currentBusiness, currentStore } = useAuth();
  const { isDemoUser, canPerformAction, getRestrictionMessage, showDemoWarning } = useDemoRestrictions();

  // Check if user is store admin
  const isStoreAdmin = user?.role === 'store_admin';

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    country_id: '',
    postal_code: '',
    phone: '',
    email: '',
    manager_name: '',
    currency_id: '',
    language_id: '',
    is_active: true
  });

  // React Query hooks
  const {
    data: storesResponse,
    isLoading: isLoadingStores,
    error: storesError,
    refetch: refetchStores
  } = useBusinessStores(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });

  const stores = useMemo(() => storesResponse ?? [], [storesResponse]);

  // Filter stores based on user role
  const accessibleStores = useMemo(() => {
    if (isStoreAdmin && currentStore) {
      // Store admin can only see their assigned store
      return stores.filter((store: Store) => store.id === currentStore.id);
    }
    // Business admin can see all stores
    return stores;
  }, [stores, isStoreAdmin, currentStore]);


  // Mutations
  const createStoreMutation = useCreateStore(currentBusiness?.id || '');
  const updateStoreMutation = useUpdateStore(currentBusiness?.id || '');
  const deleteStoreMutation = useDeleteStore(currentBusiness?.id || '');

  // Loading states
  const isLoading = isLoadingStores;
  const hasError = storesError;

  const filteredStores = accessibleStores.filter((store: Store) =>
    (store.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetNewStoreForm = useCallback(() => {
    setNewStore({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      country_id: '',
      postal_code: '',
      phone: '',
      email: '',
      manager_name: '',
      currency_id: '',
      language_id: '',
      is_active: true
    });
  }, []);

  const handleAddStore = async () => {
    // Validate required fields
    if (!newStore.name || !newStore.name.trim()) {
      toast.error('Store name is required');
      return;
    }

    if (newStore.name.trim().length < 2) {
      toast.error('Store name must be at least 2 characters long');
      return;
    }

    // Validate email format if provided
    if (newStore.email && newStore.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStore.email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Validate phone format if provided
    if (newStore.phone && newStore.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(newStore.phone.trim())) {
        toast.error('Please enter a valid phone number');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Clean up the data - convert empty strings to undefined for optional UUID fields
      const cleanStoreData = {
        ...newStore,
        business_id: currentBusiness?.id || '',
        // Convert empty strings to undefined for optional UUID fields
        country_id: newStore.country_id || undefined,
        currency_id: newStore.currency_id || undefined,
        language_id: newStore.language_id || undefined,
        // Clean up other optional fields
        address: newStore.address || undefined,
        city: newStore.city || undefined,
        state: newStore.state || undefined,
        postal_code: newStore.postal_code || undefined,
        phone: newStore.phone || undefined,
        email: newStore.email || undefined,
        manager_name: newStore.manager_name || undefined
      };
      
      await createStoreMutation.mutateAsync(cleanStoreData);
      
      resetNewStoreForm();
      setIsAddDialogOpen(false);
      toast.success('Store created successfully!');
      refetchStores();
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStore = useCallback((store: Store) => {
    setSelectedStore(store);
    setNewStore({
      name: store.name || '',
      address: store.address || '',
      city: store.city || '',
      state: store.state || '',
      country: store.country || '',
      country_id: store.country_id || '',
      postal_code: store.postal_code || '',
      phone: store.phone || '',
      email: store.email || '',
      manager_name: store.manager_name || '',
      currency_id: store.currency_id || '',
      language_id: store.language_id || '',
      is_active: store.is_active
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateStore = async () => {
    if (!selectedStore) return;

    // Validate required fields
    if (!newStore.name || !newStore.name.trim()) {
      toast.error('Store name is required');
      return;
    }

    if (newStore.name.trim().length < 2) {
      toast.error('Store name must be at least 2 characters long');
      return;
    }

    // Validate email format if provided
    if (newStore.email && newStore.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStore.email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Validate phone format if provided
    if (newStore.phone && newStore.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(newStore.phone.trim())) {
        toast.error('Please enter a valid phone number');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Clean up the data - convert empty strings to undefined for optional UUID fields
      const cleanStoreData = {
        ...newStore,
        // Convert empty strings to undefined for optional UUID fields
        country_id: newStore.country_id || undefined,
        currency_id: newStore.currency_id || undefined,
        language_id: newStore.language_id || undefined,
        // Clean up other optional fields
        address: newStore.address || undefined,
        city: newStore.city || undefined,
        state: newStore.state || undefined,
        postal_code: newStore.postal_code || undefined,
        phone: newStore.phone || undefined,
        email: newStore.email || undefined,
        manager_name: newStore.manager_name || undefined
      };
      
      await updateStoreMutation.mutateAsync({
        id: selectedStore.id,
        storeData: cleanStoreData
      });
      
      setIsEditDialogOpen(false);
      setSelectedStore(null);
      toast.success('Store updated successfully!');
      refetchStores();
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error('Failed to update store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStore = useCallback(async (store: Store) => {
    // Check demo restrictions
    if (!canPerformAction('delete')) {
      toast.error(getRestrictionMessage('delete'));
      return;
    }

    if (!confirm(`Are you sure you want to delete "${store.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setSubmitting(true);
      
      await deleteStoreMutation.mutateAsync(store.id);
      
      toast.success('Store deleted successfully!');
      refetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Failed to delete store');
    } finally {
      setSubmitting(false);
    }
  }, [canPerformAction, getRestrictionMessage, deleteStoreMutation, refetchStores]);

  const handleViewStoreDetails = useCallback((store: Store) => {
    router.push(`/stores/${store.id}`);
  }, [router]);

  const getManagerName = (managerName: string) => {
    return managerName || 'No manager assigned';
  };

  const columns = [
    {
      key: 'store',
      label: 'Store',
      render: (store: Store) => (
        <div className="flex items-center gap-3 min-w-0">
          <StoreIcon className="w-8 h-8 text-brand-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium break-words">{store.name}</p>
            <div className="text-sm text-muted-foreground space-y-1">
              {store.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="break-words line-clamp-1">{store.address}, {store.city}, {store.state}</span>
                </div>
              )}
              {store.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="break-words">{store.phone}</span>
                </div>
              )}
              {store.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="break-words">{store.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span className="break-words">{getManagerName(store.manager_name || '')}</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (store: Store) => (
        <Badge variant={store.is_active ? "default" : "secondary"}>
          {store.is_active ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: 'created',
      label: 'Created',
      render: (store: Store) => {
        if (!store.created_at) return 'N/A';
        const date = new Date(store.created_at);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (store: Store) => {
        const isStoreAdmin = user?.role === 'store_admin';
        const currentStore = selectedStore; // Assuming selectedStore is the one being edited

        return (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewStoreDetails(store)}
            >
              <Eye className="w-3 h-3" />
            </Button>
            {/* Only show edit/delete for business admins or if store admin is editing their own store */}
            {!isStoreAdmin && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditStore(store)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteStore(store)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
            {/* Store admin can only edit their assigned store */}
            {isStoreAdmin && currentStore?.id === store.id && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditStore(store)}
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stores...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading stores. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
        title="Store Management"
        subtitle={`Manage stores for ${currentBusiness?.name || 'your business'}`}
      >
      {/* Add Store Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Store</DialogTitle>
            <DialogDescription className="text-sm">
              Create a new store for your business. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="store-name" className="text-sm">Store Name *</Label>
                <Input
                  id="store-name"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="Enter store name"
                  autoFocus
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="store-phone" className="text-sm">Phone</Label>
                <Input
                  id="store-phone"
                  value={newStore.phone}
                  onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="store-address" className="text-sm">Address</Label>
              <Input
                id="store-address"
                value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                placeholder="Enter street address"
                className="mt-1 text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="store-city" className="text-sm">City</Label>
                <Input
                  id="store-city"
                  value={newStore.city}
                  onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                  placeholder="Enter city"
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="store-state" className="text-sm">State/Province</Label>
                <Input
                  id="store-state"
                  value={newStore.state}
                  onChange={(e) => setNewStore({ ...newStore, state: e.target.value })}
                  placeholder="Enter state"
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <Label htmlFor="store-postal" className="text-sm">Postal Code</Label>
                <Input
                  id="store-postal"
                  value={newStore.postal_code}
                  onChange={(e) => setNewStore({ ...newStore, postal_code: e.target.value })}
                  placeholder="Enter postal code"
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="store-email" className="text-sm">Email</Label>
              <Input
                id="store-email"
                type="email"
                value={newStore.email}
                onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1 text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Switch
                id="store-active"
                checked={newStore.is_active}
                onCheckedChange={(checked) => setNewStore({ ...newStore, is_active: checked })}
                className="touch-manipulation"
              />
              <Label htmlFor="store-active" className="text-sm cursor-pointer">Store is active</Label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-3 sm:pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)} 
                disabled={submitting}
                className="w-full sm:w-auto touch-manipulation"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStore} 
                disabled={submitting}
                className="w-full sm:w-auto touch-manipulation"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Store
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stores</p>
                  <p className="text-2xl font-semibold">{stores.length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Stores</p>
                  <p className="text-2xl font-semibold">{stores.filter((s: Store) => s.is_active).length}</p>
                </div>
                <StoreIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive Stores</p>
                  <p className="text-2xl font-semibold">{stores.filter((s: Store) => !s.is_active).length}</p>
                </div>
                <StoreIcon className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stores Table */}
        <DataTable
          title="Stores"
          data={filteredStores}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search stores..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          emptyMessage="No stores found"
          tableName="stores"
          userRole={user?.role}
          actions={
            !isStoreAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            )
          }
        />

        {/* Edit Store Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Edit Store</DialogTitle>
              <DialogDescription className="text-sm">
                Update store information and settings.
              </DialogDescription>
            </DialogHeader>
            {selectedStore && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="edit-store-name" className="text-sm">Store Name</Label>
                    <Input
                      id="edit-store-name"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      placeholder="Enter store name"
                      autoFocus
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-store-phone" className="text-sm">Phone</Label>
                    <Input
                      id="edit-store-phone"
                      value={newStore.phone}
                      onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-store-address" className="text-sm">Address</Label>
                  <Input
                    id="edit-store-address"
                    value={newStore.address}
                    onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                    placeholder="Enter street address"
                    className="mt-1 text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="edit-store-city" className="text-sm">City</Label>
                    <Input
                      id="edit-store-city"
                      value={newStore.city}
                      onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                      placeholder="Enter city"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-store-state" className="text-sm">State/Province</Label>
                    <Input
                      id="edit-store-state"
                      value={newStore.state}
                      onChange={(e) => setNewStore({ ...newStore, state: e.target.value })}
                      placeholder="Enter state"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="edit-store-postal" className="text-sm">Postal Code</Label>
                    <Input
                      id="edit-store-postal"
                      value={newStore.postal_code}
                      onChange={(e) => setNewStore({ ...newStore, postal_code: e.target.value })}
                      placeholder="Enter postal code"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-store-email" className="text-sm">Email</Label>
                  <Input
                    id="edit-store-email"
                    type="email"
                    value={newStore.email}
                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                    placeholder="Enter email address"
                    className="mt-1 text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Switch
                    id="edit-store-active"
                    checked={newStore.is_active}
                    onCheckedChange={(checked) => setNewStore({ ...newStore, is_active: checked })}
                    className="touch-manipulation"
                  />
                  <Label htmlFor="edit-store-active" className="text-sm cursor-pointer">Store is active</Label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-3 sm:pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)} 
                    disabled={submitting}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateStore} 
                    disabled={submitting}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Store
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </DashboardLayout>
  );
};
