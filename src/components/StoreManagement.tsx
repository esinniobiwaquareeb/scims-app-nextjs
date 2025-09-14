import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoRestrictions } from '@/hooks/useDemoRestrictions';
import { Header } from '@/components/common/Header';
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
} from '@/utils/hooks/useStoreData';

interface StoreManagementProps {
  onBack: () => void;
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
    if (!newStore.name.trim()) {
      toast.error('Please fill in required fields');
      return;
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
        <div className="flex items-center gap-3">
          <StoreIcon className="w-8 h-8 text-brand-primary" />
          <div>
            <p className="font-medium">{store.name}</p>
            <div className="text-sm text-muted-foreground space-y-1">
              {store.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{store.address}, {store.city}, {store.state}</span>
                </div>
              )}
              {store.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{store.phone}</span>
                </div>
              )}
              {store.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{store.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{getManagerName(store.manager_name || '')}</span>
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
          <div className="flex gap-2">
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
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Store Management"
        subtitle={`Manage stores for ${currentBusiness?.name || 'your business'}`}
        showBackButton
        onBack={onBack}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchStores()} disabled={isLoadingStores}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStores ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {/* Only show Add Store button for business admins */}
          {!isStoreAdmin && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </Button>
          )}
        </div>
      </Header>

      {/* Demo Warning Banner */}
      {isDemoUser && (
        <div className="px-6 py-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Demo Mode:</strong> You are currently viewing the system in demo mode. 
              Some actions like deleting stores are restricted to prevent data loss. 
              This allows you to explore the system safely.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Add Store Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>
              Create a new store for your business. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store-name">Store Name *</Label>
                <Input
                  id="store-name"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="Enter store name"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="store-phone">Phone</Label>
                <Input
                  id="store-phone"
                  value={newStore.phone}
                  onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="store-address">Address</Label>
              <Input
                id="store-address"
                value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="store-city">City</Label>
                <Input
                  id="store-city"
                  value={newStore.city}
                  onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="store-state">State/Province</Label>
                <Input
                  id="store-state"
                  value={newStore.state}
                  onChange={(e) => setNewStore({ ...newStore, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <Label htmlFor="store-postal">Postal Code</Label>
                <Input
                  id="store-postal"
                  value={newStore.postal_code}
                  onChange={(e) => setNewStore({ ...newStore, postal_code: e.target.value })}
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="store-email">Email</Label>
              <Input
                id="store-email"
                type="email"
                value={newStore.email}
                onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="store-active"
                checked={newStore.is_active}
                onCheckedChange={(checked) => setNewStore({ ...newStore, is_active: checked })}
              />
              <Label htmlFor="store-active">Store is active</Label>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleAddStore} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Store
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        />

        {/* Edit Store Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Store</DialogTitle>
              <DialogDescription>
                Update store information and settings.
              </DialogDescription>
            </DialogHeader>
            {selectedStore && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-store-name">Store Name</Label>
                    <Input
                      id="edit-store-name"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      placeholder="Enter store name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-store-phone">Phone</Label>
                    <Input
                      id="edit-store-phone"
                      value={newStore.phone}
                      onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-store-address">Address</Label>
                  <Input
                    id="edit-store-address"
                    value={newStore.address}
                    onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-store-city">City</Label>
                    <Input
                      id="edit-store-city"
                      value={newStore.city}
                      onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-store-state">State/Province</Label>
                    <Input
                      id="edit-store-state"
                      value={newStore.state}
                      onChange={(e) => setNewStore({ ...newStore, state: e.target.value })}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-store-postal">Postal Code</Label>
                    <Input
                      id="edit-store-postal"
                      value={newStore.postal_code}
                      onChange={(e) => setNewStore({ ...newStore, postal_code: e.target.value })}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-store-email">Email</Label>
                  <Input
                    id="edit-store-email"
                    type="email"
                    value={newStore.email}
                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-store-active"
                    checked={newStore.is_active}
                    onCheckedChange={(checked) => setNewStore({ ...newStore, is_active: checked })}
                  />
                  <Label htmlFor="edit-store-active">Store is active</Label>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateStore} disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Store
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};
