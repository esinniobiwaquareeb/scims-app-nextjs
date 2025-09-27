import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { toast } from 'sonner';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { Header } from '@/components/common/Header';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Edit,
  Trash2,
  Package,
  RefreshCw,
  Plus
} from 'lucide-react';

// Import types from centralized location
import { 
  SupplierProps,
  Supplier,
  SupplierFormData
} from '@/types';

// Import stores from centralized location
import { 
  useBusinessSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier
} from '@/stores';

export const SupplierManagement: React.FC<SupplierProps> = ({ onBack }) => {
  const { user, currentBusiness } = useAuth();
  const { translate, formatCurrency } = useSystem();
  const { logActivity } = useActivityLogger();
  
  // Check if user is store admin
  const isStoreAdmin = user?.role === 'store_admin';
  
  // State for delete confirmation
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // React Query hooks
  const {
    data: suppliers = [],
    isLoading: isLoadingSuppliers,
    refetch: refetchSuppliers
  } = useBusinessSuppliers(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });

  // React Query mutations
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  // Loading states
  const isSaving = createSupplierMutation.isPending || updateSupplierMutation.isPending || deleteSupplierMutation.isPending;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newSupplier, setNewSupplier] = useState<SupplierFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });

  // Suppliers are already filtered by business from the hook
  const filteredSuppliers = suppliers.filter((supplier: Supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  const handleAddSupplier = (updatedSupplier: SupplierFormData) => {
    try {
      if (!updatedSupplier.name.trim()) {
        toast.error(translate('validation.requiredFields'));
        return;
      }

      const supplierData = {
        ...updatedSupplier,
        business_id: currentBusiness?.id || ''
      };

      createSupplierMutation.mutate(supplierData, {
        onSuccess: () => {
          refetchSuppliers();
          logActivity(
            'supplier_create', 
            'Supplier Management', 
            `Added new supplier: ${supplierData.name}`,
            { supplierName: supplierData.name }
          );
        },
        onError: (error: unknown) => {
          console.error('Error adding supplier:', error);
          toast.error('Error adding supplier. Please try again.');
        }
      });

      // Reset form
      setNewSupplier({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        is_active: true
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Error adding supplier. Please try again.');
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSupplier = (updatedSupplier: SupplierFormData) => {
    try {
      if (!editingSupplier) {
        console.error('No editing supplier found');
        toast.error('No supplier selected for editing');
        return;
      }

      updateSupplierMutation.mutate({
        id: editingSupplier.id,
        business_id: currentBusiness?.id || '',
        ...updatedSupplier
      }, {
        onSuccess: () => {
          refetchSuppliers();
          logActivity(
            'supplier_update', 
            'Supplier Management', 
            `Updated supplier: ${updatedSupplier.name}`,
            { supplierId: editingSupplier.id, supplierName: updatedSupplier.name }
          );
          setIsEditDialogOpen(false);
          setEditingSupplier(null);
        },
        onError: (error) => {
          console.error('Error updating supplier:', error);
          toast.error('Error updating supplier. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Error updating supplier. Please try again.');
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    const supplier = suppliers.find((s: Supplier) => s.id === supplierId);
    if (!supplier) return;

    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const toggleSupplierStatus = (supplierId: string) => {
    const supplier = suppliers.find((s: Supplier) => s.id === supplierId);
    if (!supplier) return;

    const updatedSupplier = {
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      is_active: !supplier.is_active
    };

    updateSupplierMutation.mutate({
      id: supplier.id,
      business_id: currentBusiness?.id || '',
      ...updatedSupplier
    }, {
      onSuccess: () => {
        refetchSuppliers();
        logActivity(
          'supplier_update', 
          'Supplier Management', 
          `${supplier.is_active ? 'Deactivated' : 'Activated'} supplier: ${supplier.name}`,
          { supplierId: supplier.id, supplierName: supplier.name }
        );
      },
      onError: (error: unknown) => {
        console.error('Error updating supplier status:', error);
        toast.error('Error updating supplier status. Please try again.');
      }
    });
  };

  const exportSuppliers = useCallback(() => {
    if (filteredSuppliers.length === 0) {
      toast.error('No suppliers to export');
      return;
    }

    import('../utils/export-utils').then(({ exportSuppliers: exportSuppliersUtil }) => {
      try {
        exportSuppliersUtil(filteredSuppliers, {
          businessName: currentBusiness?.name
        });
        
        logActivity('data_export', 'Supplier Management', 'Exported suppliers list to CSV');
      } catch (error: unknown) {
        console.error('Export error:', error);
        toast.error('Failed to export suppliers');
      }
    }).catch((error: unknown) => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [filteredSuppliers, currentBusiness?.name, logActivity]);

  const columns = [
    {
      key: 'name',
      label: translate('common.name'),
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{supplier.name}</p>
            <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (supplier: Supplier) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3 h-3" />
            <span>{supplier.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3" />
            <span>{supplier.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{supplier.address}</span>
        </div>
      )
    },
    {
      key: 'business',
      label: 'Business Info',
      render: () => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm">Active</span>
          </div>
        </div>
      )
    },
    {
      key: 'performance',
      label: 'Performance',
      render: () => (
        <div className="text-right">
          <p className="font-medium">N/A</p>
          <p className="text-sm text-muted-foreground">N/A</p>
        </div>
      )
    },
    {
      key: 'status',
      label: translate('common.status'),
      render: (supplier: Supplier) => (
        <Badge 
          variant={supplier.is_active ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => toggleSupplierStatus(supplier.id)}
        >
          {supplier.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: translate('common.actions'),
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSupplier(supplier)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {/* Only show delete button for non-store-admin users */}
          {!isStoreAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSupplier(supplier.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s: Supplier) => s.is_active).length,
    inactive: suppliers.filter((s: Supplier) => !s.is_active).length,
    totalValue: suppliers.reduce((sum: number, s: Supplier) => sum + (Number((s as Supplier & { total_value?: number }).total_value) || 0), 0)
  };

  const SupplierForm = ({ 
    supplier, 
    onSubmit, 
    submitLabel,
    isLoading = false
  }: { 
    supplier: SupplierFormData; 
    onSubmit: (updatedSupplier: SupplierFormData) => void;
    submitLabel: string;
    isLoading?: boolean;
  }) => {
    const [localSupplier, setLocalSupplier] = useState(supplier);

    // Update local state when supplier prop changes
    React.useEffect(() => {
      setLocalSupplier(supplier);
    }, [supplier]);

    const handleLocalChange = (field: string, value: string | boolean) => {
      setLocalSupplier((prev: SupplierFormData) => ({ ...prev, [field]: value }));
    };

    return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{translate('common.name')} *</Label>
          <Input
            id="name"
            value={localSupplier.name}
            onChange={(e) => handleLocalChange('name', e.target.value)}
            placeholder="Enter supplier name"
            required
          />
        </div>
        <div>
          <Label htmlFor="contactPerson">Contact Person *</Label>
          <Input
            id="contactPerson"
            value={localSupplier.contact_person || ''}
            onChange={(e) => handleLocalChange('contact_person', e.target.value)}
            placeholder="Enter contact person"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">{translate('common.email')} *</Label>
          <Input
            id="email"
            type="email"
            value={localSupplier.email || ''}
            onChange={(e) => handleLocalChange('email', e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">{translate('common.phone')}</Label>
          <Input
            id="phone"
            value={localSupplier.phone || ''}
            onChange={(e) => handleLocalChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">{translate('common.address')}</Label>
        <Input
          id="address"
          value={localSupplier.address || ''}
          onChange={(e) => handleLocalChange('address', e.target.value)}
          placeholder="Enter address"
        />
      </div>





      <div className="flex justify-end gap-2 pt-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingSupplier(null);
          }}
        >
          {translate('common.cancel')}
        </Button>
        <Button onClick={() => onSubmit(localSupplier)} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={translate('management.suppliers')}
        subtitle="Manage suppliers for your business"
        showBackButton
        onBack={onBack}
      >
        <Button
          variant="outline"
          onClick={() => refetchSuppliers()}
          disabled={isLoadingSuppliers}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingSuppliers ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button 
          disabled={isSaving}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {translate('common.add')} Supplier
        </Button>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Suppliers</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-semibold text-orange-600">{stats.inactive}</p>
                </div>
                <Badge variant="secondary">Inactive</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-semibold">{formatCurrency(stats.totalValue)}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Table */}
        <DataTable
          title="Suppliers"
          data={filteredSuppliers}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search suppliers..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onExport={exportSuppliers}
          emptyMessage="No suppliers found"
          tableName="suppliers"
          userRole={user?.role}
        />
      </main>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{translate('common.add')} New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your business directory
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            supplier={newSupplier}
            onSubmit={handleAddSupplier}
            submitLabel={translate('common.add')}
            isLoading={createSupplierMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{translate('common.edit')} Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
            </DialogDescription>
          </DialogHeader>
          {editingSupplier && (
            <SupplierForm
              supplier={{
                name: editingSupplier.name,
                contact_person: editingSupplier.contact_person || '',
                email: editingSupplier.email || '',
                phone: editingSupplier.phone || '',
                address: editingSupplier.address || '',
                is_active: editingSupplier.is_active
              }}
              onSubmit={handleUpdateSupplier}
              submitLabel={translate('common.save')}
              isLoading={updateSupplierMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Only show for non-store-admin users */}
      {!isStoreAdmin && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your supplier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (supplierToDelete) {
                  deleteSupplierMutation.mutate({
                    supplierId: supplierToDelete.id,
                    businessId: currentBusiness?.id || ''
                  }, {
                    onSuccess: () => {
                      refetchSuppliers();
                      logActivity(
                        'supplier_delete', 
                        'Supplier Management', 
                        `Deleted supplier: ${supplierToDelete.name}`,
                        { supplierId: supplierToDelete.id, supplierName: supplierToDelete.name }
                      );
                      setIsDeleteDialogOpen(false);
                      setSupplierToDelete(null);
                    },
                    onError: (error: unknown) => {
                      console.error('Error deleting supplier:', error);
                      toast.error('Error deleting supplier. Please try again.');
                      setIsDeleteDialogOpen(false);
                      setSupplierToDelete(null);
                    }
                  });
                }
              }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};