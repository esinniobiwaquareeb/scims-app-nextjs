import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { Header } from '@/components/common/Header';
import { DataTable } from '@/components/common/DataTable';
import { PasswordResetDialog } from '@/components/common/PasswordResetDialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  useBusinessCashiers, 
  useBusinessStores, 
  useCashierSales,
  useCreateCashier,
  useUpdateCashier,
  useUpdateCashierStore,
  useDeleteCashier,
  useResetUserPassword
} from '@/stores/cashier-management';
import { toast } from 'sonner';
import { 
  Users, 
  Edit, 
  Trash2,
  UserPlus,
  Shield,
  Clock,
  Loader2,
  Search,
  Eye,
  Download,
  Key
} from 'lucide-react';

import { 
  CashierManagementProps, 
  CashierManagement as CashierManagementType, 
  CashierManagementSale,
  CashierFormProps
} from '@/types/cashier-management';

// Move CashierForm outside to prevent recreation on every render
const CashierForm: React.FC<CashierFormProps> = ({ 
  cashier, 
  onChange, 
  onSave, 
  onCancel,
  stores,
  isSaving
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={cashier.name || ''}
          onChange={(e) => onChange({ ...cashier, name: e.target.value })}
          placeholder="Enter full name"
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={cashier.username || ''}
          onChange={(e) => onChange({ ...cashier, username: e.target.value })}
          placeholder="Enter username"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={cashier.email || ''}
          onChange={(e) => onChange({ ...cashier, email: e.target.value })}
          placeholder="Enter email address (optional)"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          value={cashier.phone || ''}
          onChange={(e) => onChange({ ...cashier, phone: e.target.value })}
          placeholder="Enter phone number (optional)"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="store">Assigned Store</Label>
      <Select 
        value={cashier.store_id || ''} 
        onValueChange={(value) => onChange({ ...cashier, store_id: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select store" />
        </SelectTrigger>
        <SelectContent>
          {stores.filter(s => s.is_active).map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label>Permissions</Label>
      <div className="space-y-2 mt-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="pos"
            checked={cashier.permissions?.includes('pos') || false}
            onChange={(e) => {
              const permissions = e.target.checked 
                ? [...(cashier.permissions || []), 'pos']
                : (cashier.permissions || []).filter(p => p !== 'pos');
              onChange({ ...cashier, permissions });
            }}
          />
          <Label htmlFor="pos">Point of Sale Access</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="reports_view"
            checked={cashier.permissions?.includes('reports_view') || false}
            onChange={(e) => {
              const permissions = e.target.checked 
                ? [...(cashier.permissions || []), 'reports_view']
                : (cashier.permissions || []).filter(p => p !== 'reports_view');
              onChange({ ...cashier, permissions });
            }}
          />
          <Label htmlFor="reports_view">View Reports</Label>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Switch
        id="active"
        checked={cashier.is_active}
        onCheckedChange={(checked) => onChange({ ...cashier, is_active: checked })}
      />
      <Label htmlFor="active">Active Cashier</Label>
    </div>

    <div className="flex gap-2 justify-end pt-4 border-t">
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isSaving || !cashier.name || !cashier.username}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Cashier'
        )}
      </Button>
    </div>
  </div>
);

export const CashierManagement: React.FC<CashierManagementProps> = ({ onBack }) => {
  const router = useRouter();
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();
  const { hasPermission } = usePermissions();
  const { logActivity } = useActivityLogger();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);
  const [isSalesViewOpen, setIsSalesViewOpen] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<CashierManagementType | null>(null);
  const [originalCashier, setOriginalCashier] = useState<CashierManagementType | null>(null);
  const [selectedCashierForSales] = useState<CashierManagementType | null>(null);
  const [cashierToDelete, setCashierToDelete] = useState<CashierManagementType | null>(null);
  
  // Password reset state
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [cashierForPasswordReset, setCashierForPasswordReset] = useState<CashierManagementType | null>(null);
  
  // Sales filtering
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [salesDateFilter, setSalesDateFilter] = useState('all');
  const [salesStatusFilter, setSalesStatusFilter] = useState('all');
  const [salesPaymentFilter, setSalesPaymentFilter] = useState('all');

  const [newCashier, setNewCashier] = useState<Partial<CashierManagementType>>({
    name: '',
    username: '',
    email: '',
    phone: '',
    store_id: currentStore?.id || '',
    is_active: true,
    role: 'cashier',
    permissions: ['pos']
  });

  // React Query hooks
  const { 
    data: cashiers = [], 
    isLoading: isLoadingCashiers, 
    error: cashiersError,
    refetch: refetchCashiers
  } = useBusinessCashiers(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });

  const { 
    data: storesResponse, 
    isLoading: isLoadingStores,
    refetch: refetchStores
  } = useBusinessStores(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });

  const stores = storesResponse?.stores || [];

  // React Query mutations
  const createCashierMutation = useCreateCashier(currentBusiness?.id || '');
  const updateCashierMutation = useUpdateCashier(currentBusiness?.id || '');
  const updateCashierStoreMutation = useUpdateCashierStore(currentBusiness?.id || '');
  const deleteCashierMutation = useDeleteCashier(currentBusiness?.id || '');
  const resetUserPasswordMutation = useResetUserPassword();

  // Loading states
  const isSaving = createCashierMutation.isPending || updateCashierMutation.isPending || updateCashierStoreMutation.isPending || deleteCashierMutation.isPending || resetUserPasswordMutation.isPending;

  // Cashier sales query (only when needed)
  const { 
    data: cashierSales = [], 
    isLoading: isLoadingSales
  } = useCashierSales(
    selectedCashierForSales?.id || '', 
    selectedCashierForSales?.store_id || '', 
    {
      enabled: !!selectedCashierForSales?.id && !!selectedCashierForSales?.store_id
    }
  );

  // Reset newCashier when store changes
  useEffect(() => {
    setNewCashier(prev => ({
      ...prev,
      store_id: currentStore?.id || ''
    }));
  }, [currentStore?.id]);

  // Filter cashiers based on user role
  const accessibleCashiers = cashiers.filter((cashier: CashierManagementType) => {
    if (user?.role === 'business_admin') {
      return true; // Business admin can see all cashiers
    }
    if (user?.role === 'store_admin') {
      return cashier.store_id === currentStore?.id; // Store admin only sees their store's cashiers
    }
    return false;
  });

  const filteredCashiers = accessibleCashiers.filter((cashier: CashierManagementType) => {
    const matchesSearch = cashier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cashier.email && cashier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (cashier.username && cashier.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStore = selectedStoreFilter === 'All' || cashier.store_id === selectedStoreFilter;
    return matchesSearch && matchesStore;
  });


  // Transform sales data for display (since React Query returns raw data)
  const transformedCashierSales = cashierSales.map((sale: CashierManagementSale) => ({
    id: sale.id,
    receipt_number: sale.receipt_number,
    total_amount: sale.total_amount,
    payment_method: sale.payment_method,
    status: sale.status,
    transaction_date: sale.transaction_date,
    created_at: sale.created_at,
    customer_id: sale.customer_id,
    customer_name: sale.customer_name || 'Walk-in Customer',
    items_count: sale.items_count || 0
  }));

  // Filter cashier sales
  const filteredCashierSales = transformedCashierSales.filter((sale: CashierManagementSale) => {
    const matchesSearch = sale.receipt_number.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                         (sale.customer_name && sale.customer_name.toLowerCase().includes(salesSearchTerm.toLowerCase()));
    
    const matchesDate = salesDateFilter === 'all' || 
                       (salesDateFilter === 'today' && new Date(sale.transaction_date).toDateString() === new Date().toDateString()) ||
                       (salesDateFilter === 'week' && new Date(sale.transaction_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                       (salesDateFilter === 'month' && new Date(sale.transaction_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const matchesStatus = salesStatusFilter === 'all' || sale.status === salesStatusFilter;
    const matchesPayment = salesPaymentFilter === 'all' || sale.payment_method === salesPaymentFilter;
    
    return matchesSearch && matchesDate && matchesStatus && matchesPayment;
  });

  // Statistics
  const totalCashiers = filteredCashiers.length;
  const activeCashiers = filteredCashiers.filter((c: CashierManagementType) => c.is_active).length;
  const totalSales = filteredCashiers.reduce((sum: number, c: CashierManagementType) => sum + (c.totalSales || 0), 0);
  const avgPerformance = totalCashiers > 0 ? totalSales / totalCashiers : 0;

  // Sales statistics
  const totalSalesAmount = filteredCashierSales.reduce((sum: number, sale: CashierManagementSale) => sum + sale.total_amount, 0);
  const totalTransactions = filteredCashierSales.length;
  const avgTransactionValue = totalTransactions > 0 ? totalSalesAmount / totalTransactions : 0;

  const handleAddCashier = useCallback(async () => {
    if (!currentBusiness?.id || !newCashier.username) return;

    try {
      const result = await createCashierMutation.mutateAsync({
        name: newCashier.name || '',
        username: newCashier.username || '',
        email: newCashier.email || '',
        phone: newCashier.phone,
        store_id: newCashier.store_id,
        is_active: newCashier.is_active || true,
        role: 'cashier' as const,
        permissions: newCashier.permissions || ['pos']
      });
      
      console.log('Cashier creation result:', result);
      
      // Show credentials modal with the returned default password
      setGeneratedCredentials({
        username: newCashier.username || '',
        password: result.data?.credentials?.password || 'Password not generated' // Fallback if not returned
      });
      setIsCredentialsModalOpen(true);
      
      // Reset form
      setNewCashier({
        name: '',
        username: '',
        email: '',
        phone: '',
        store_id: currentStore?.id || '',
        is_active: true,
        role: 'cashier',
        permissions: ['pos']
      });
      setIsAddDialogOpen(false);
      await refetchCashiers(); // Refresh cashiers list
      await refetchStores(); // Refresh stores list
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Error adding cashier:', error);
    }
  }, [newCashier, currentBusiness, currentStore, createCashierMutation, refetchCashiers, refetchStores]);

  const handleEditCashier = useCallback((cashier: CashierManagementType) => {
    setSelectedCashier({ ...cashier }); // Create a copy to avoid reference issues
    setOriginalCashier({ ...cashier }); // Store original data for comparison
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateCashier = useCallback(async () => {
    if (!selectedCashier || !currentBusiness?.id || !originalCashier) return;

    try {
      // First update the cashier basic info
      await updateCashierMutation.mutateAsync({
        id: selectedCashier.id,
        cashierData: {
          name: selectedCashier.name,
          username: selectedCashier.username,
          email: selectedCashier.email,
          phone: selectedCashier.phone,
          is_active: selectedCashier.is_active,
          role: selectedCashier.role,
          permissions: selectedCashier.permissions
        }
      });

      // Check if store assignment has changed
      if (selectedCashier.store_id !== originalCashier.store_id) {
        await updateCashierStoreMutation.mutateAsync({
          id: selectedCashier.id,
          storeId: selectedCashier.store_id || ''
        });
      }
      
      setIsEditDialogOpen(false);
      setSelectedCashier(null);
      setOriginalCashier(null); // Clear original data after update
      await refetchCashiers(); // Refresh cashiers list
      await refetchStores(); // Refresh stores list
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Error updating cashier:', error);
    }
  }, [selectedCashier, originalCashier, currentBusiness, updateCashierMutation, updateCashierStoreMutation, refetchCashiers, refetchStores]);

  const handleDeleteCashier = useCallback(async (cashier: CashierManagementType) => {
    if (!currentBusiness?.id) return;

    try {
      await deleteCashierMutation.mutateAsync(cashier.id);
      await refetchCashiers(); // Refresh cashiers list
      await refetchStores(); // Refresh stores list
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Error deleting cashier:', error);
    }
  }, [currentBusiness, deleteCashierMutation, refetchCashiers, refetchStores]);

  // Password reset functions
  const handlePasswordReset = useCallback((cashier: CashierManagementType) => {
    setCashierForPasswordReset(cashier);
    setIsPasswordResetDialogOpen(true);
  }, []);

  const resetCashierPassword = useCallback(async () => {
    if (!cashierForPasswordReset) {
      throw new Error('No cashier selected for password reset');
    }

    try {
      // Use the password reset mutation hook
      await resetUserPasswordMutation.mutateAsync(cashierForPasswordReset.id);
      
      // Log the activity
      logActivity('user_update', 'cashiers', `Password reset for cashier "${cashierForPasswordReset.name}"`, {
        cashier_id: cashierForPasswordReset.id,
        cashier_name: cashierForPasswordReset.name,
        business_id: currentBusiness?.id || '',
        user_id: user?.id || ''
      });
      
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      throw error; // Re-throw to let the component handle it
    }
  }, [cashierForPasswordReset, resetUserPasswordMutation, currentBusiness, user, logActivity]);

  const closePasswordResetDialog = useCallback(() => {
    setIsPasswordResetDialogOpen(false);
    setCashierForPasswordReset(null);
  }, []);

  const toggleCashierStatus = useCallback(async (id: string) => {
    const cashier = cashiers.find((c: CashierManagementType) => c.id === id);
    if (!cashier || !currentBusiness?.id) return;

    try {
      const updatedCashier = { ...cashier, is_active: !cashier.is_active };
      
      await updateCashierMutation.mutateAsync({
        id: id,
        cashierData: {
          name: updatedCashier.name,
          username: updatedCashier.username,
          email: updatedCashier.email,
          phone: updatedCashier.phone,
          is_active: updatedCashier.is_active,
          role: updatedCashier.role,
          permissions: updatedCashier.permissions
        }
      });
      await refetchCashiers(); // Refresh cashiers list
      await refetchStores(); // Refresh stores list
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Error toggling cashier status:', error);
    }
  }, [cashiers, currentBusiness, updateCashierMutation, refetchCashiers, refetchStores]);

  const exportCashierSales = useCallback(() => {
    if (!selectedCashierForSales || filteredCashierSales.length === 0) {
      toast.error('No sales data to export');
      return;
    }

    import('../utils/export-utils').then(({ exportStaffSales }) => {
      try {
        exportStaffSales(filteredCashierSales, selectedCashierForSales.name, {
          storeName: currentStore?.name,
          businessName: currentBusiness?.name
        });
        
        toast.success('Sales data exported successfully');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export sales data');
      }
    }).catch(error => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [selectedCashierForSales, filteredCashierSales, currentStore?.name, currentBusiness?.name]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Memoized change handlers to prevent unnecessary re-renders
  const handleNewCashierChange = useCallback((updatedCashier: Partial<CashierManagementType>) => {
    setNewCashier(updatedCashier);
  }, []);

  const handleSelectedCashierChange = useCallback((updatedCashier: CashierManagementType) => {
    setSelectedCashier(updatedCashier);
  }, []);

  // Refresh function for manual data refresh
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchCashiers(),
        refetchStores()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  }, [refetchCashiers, refetchStores]);

  if (isLoadingCashiers || isLoadingStores) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cashiers...</p>
        </div>
      </div>
    );
  }

  // DataTable columns configuration
  const columns = [
    {
      key: 'cashier',
      header: 'Cashier',
      render: (cashier: CashierManagementType) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(cashier.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{cashier.name}</p>
            <p className="text-sm text-muted-foreground">{cashier.email}</p>
            <p className="text-xs text-muted-foreground">@{cashier.username}</p>
          </div>
        </div>
      )
    },
    {
      key: 'store',
      header: 'Store',
      render: (cashier: CashierManagementType) => (
        <div>
          <p className="font-medium">{cashier.storeName || 'Not assigned'}</p>
          <p className="text-sm text-muted-foreground">{cashier.phone || 'No phone'}</p>
        </div>
      )
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (cashier: CashierManagementType) => (
        <div className="text-sm">
          <p className="font-medium">{formatCurrency(cashier.totalSales || 0)}</p>
          <p className="text-muted-foreground">{cashier.transactionCount || 0} transactions</p>
        </div>
      )
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (cashier: CashierManagementType) => (
        <div className="flex flex-wrap gap-1">
          {(cashier.permissions || ['pos']).map(permission => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {permission.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (cashier: CashierManagementType) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={cashier.is_active}
            onCheckedChange={() => toggleCashierStatus(cashier.id)}
            disabled={isSaving || !hasPermission('cashiers_edit')}
          />
          <Badge variant={cashier.is_active ? "default" : "secondary"}>
            {cashier.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (cashier: CashierManagementType) => (
        <div>
          <p className="text-sm">
            {new Date(cashier.created_at).toLocaleDateString()}
          </p>
          {cashier.last_login && (
            <p className="text-xs text-muted-foreground mt-1">
              Last login: {new Date(cashier.last_login).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (cashier: CashierManagementType) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => router.push(`/cashiers/${cashier.id}`)}
            disabled={!cashier.store_id}
            title={!cashier.store_id ? "Cashier not assigned to store" : "View details"}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEditCashier(cashier)} disabled={!hasPermission('cashiers_edit')}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handlePasswordReset(cashier)}
            disabled={!hasPermission('cashiers_edit')}
            title="Reset Password"
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <Key className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            disabled={isSaving || !hasPermission('cashiers_delete')}
            onClick={() => {
              setCashierToDelete(cashier);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Cashier Management"
        subtitle={`Manage cashiers${currentStore ? ` for ${currentStore.name}` : ''}`}
        showBackButton
        onBack={onBack}
      >
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoadingCashiers || isLoadingStores}
          >
            <Loader2 className={`w-4 h-4 mr-2 ${isLoadingCashiers || isLoadingStores ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            disabled={!hasPermission('cashiers_create')}
            onClick={() => setIsAddDialogOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Cashier
          </Button>
        </div>
      </Header>

      {/* Cashier Credentials Modal */}
      <Dialog open={isCredentialsModalOpen} onOpenChange={setIsCredentialsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cashier Account Created Successfully!</DialogTitle>
            <DialogDescription>
              Please save these credentials securely. The cashier should change their password on first login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Username:</span>
                  <span className="font-mono text-sm">{generatedCredentials?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Generated Password:</span>
                  <span className="font-mono text-sm bg-background px-2 py-1 rounded border">{generatedCredentials?.password}</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>🔐 <strong>Security Note:</strong> This is a randomly generated password.</p>
              <p>⚠️ <strong>Important:</strong> Share these credentials securely with the cashier.</p>
              <p>🔄 <strong>First Login:</strong> They will be prompted to change their password.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCredentialsModalOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cashiersError && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{cashiersError.message || 'Failed to load cashier data'}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cashiers</p>
                  <p className="text-2xl font-semibold">{totalCashiers}</p>
                  <p className="text-sm text-muted-foreground">{totalCashiers - activeCashiers} inactive</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Cashiers</p>
                  <p className="text-2xl font-semibold">{activeCashiers}</p>
                  <p className="text-sm text-green-600">Currently active</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-semibold">{formatCurrency(totalSales)}</p>
                  <p className="text-sm text-blue-600">Across all cashiers</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Performance</p>
                  <p className="text-2xl font-semibold">{formatCurrency(avgPerformance)}</p>
                  <p className="text-sm text-orange-600">Per cashier</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search cashiers by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {user?.role === 'business_admin' && stores.length > 1 && (
                <Select value={selectedStoreFilter} onValueChange={setSelectedStoreFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Stores</SelectItem>
                    {stores.filter((s: { is_active?: boolean }) => s.is_active).map((store: { id: string; name: string }) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cashiers DataTable */}
        <DataTable
          title={`Cashiers (${filteredCashiers.length})`}
          data={filteredCashiers}
          columns={columns}
          searchable={false}
          tableName="cashiers"
          userRole={user?.role}
          pagination={{
            enabled: true,
            pageSize: 20,
            showPageSizeSelector: true,
            showPageInfo: true
          }}
          emptyMessage={
            <div className="text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No cashiers found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          }
        />

        {/* Add Cashier Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Cashier</DialogTitle>
              <DialogDescription>
                Create a new cashier account and assign to a store.
              </DialogDescription>
            </DialogHeader>
            <CashierForm
              cashier={newCashier}
              onChange={handleNewCashierChange}
              onSave={handleAddCashier}
              onCancel={() => setIsAddDialogOpen(false)}
              stores={stores}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Cashier Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Cashier</DialogTitle>
              <DialogDescription>
                Update cashier information and permissions.
              </DialogDescription>
            </DialogHeader>
            {selectedCashier && (
              <CashierForm
                cashier={selectedCashier}
                onChange={handleSelectedCashierChange as (cashier: Partial<CashierManagementType>) => void}
                onSave={handleUpdateCashier}
                onCancel={() => setIsEditDialogOpen(false)}
                stores={stores}
                isSaving={isSaving}
            />
            )}
          </DialogContent>
        </Dialog>

        {/* Cashier Sales View Dialog */}
        <Dialog open={isSalesViewOpen} onOpenChange={setIsSalesViewOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Sales by {selectedCashierForSales?.name}
              </DialogTitle>
              <DialogDescription>
                View and filter all sales made by this cashier
              </DialogDescription>
            </DialogHeader>
            
            {selectedCashierForSales && (
              <div className="space-y-6">
                {/* Sales Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-semibold">{formatCurrency(totalSalesAmount)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-2xl font-semibold">{totalTransactions}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Avg Transaction</p>
                        <p className="text-2xl font-semibold">{formatCurrency(avgTransactionValue)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-center flex-wrap">
                      <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search by receipt or customer..."
                          value={salesSearchTerm}
                          onChange={(e) => setSalesSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={salesDateFilter} onValueChange={setSalesDateFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={salesStatusFilter} onValueChange={setSalesStatusFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={salesPaymentFilter} onValueChange={setSalesPaymentFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payment</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={exportCashierSales} disabled={filteredCashierSales.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales DataTable */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sales ({filteredCashierSales.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSales ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading sales data...</span>
                      </div>
                    ) : (
                      <DataTable
                        title=""
                        data={filteredCashierSales}
                        columns={[
                          {
                            key: 'receipt',
                            header: 'Receipt',
                            render: (sale: CashierManagementSale) => (
                              <div className="font-mono text-sm">{sale.receipt_number}</div>
                            )
                          },
                          {
                            key: 'date',
                            header: 'Date',
                            render: (sale: CashierManagementSale) => (
                              <div>
                                <p className="text-sm">
                                  {new Date(sale.transaction_date).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(sale.transaction_date).toLocaleTimeString()}
                                </p>
                              </div>
                            )
                          },
                          {
                            key: 'customer',
                            header: 'Customer',
                            render: (sale: CashierManagementSale) => (
                              <p className="text-sm">{sale.customer_name}</p>
                            )
                          },
                          {
                            key: 'amount',
                            header: 'Amount',
                            render: (sale: CashierManagementSale) => (
                              <p className="font-medium">{formatCurrency(sale.total_amount)}</p>
                            )
                          },
                          {
                            key: 'payment',
                            header: 'Payment',
                            render: (sale: CashierManagementSale) => (
                              <Badge variant="secondary" className="text-xs">
                                {sale.payment_method}
                              </Badge>
                            )
                          },
                          {
                            key: 'status',
                            header: 'Status',
                            render: (sale: CashierManagementSale) => (
                              <Badge 
                                variant={sale.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {sale.status}
                              </Badge>
                            )
                          },
                          {
                            key: 'items',
                            header: 'Items',
                            render: (sale: CashierManagementSale) => (
                              <Badge variant="outline" className="text-xs">
                                {sale.items_count} items
                              </Badge>
                            )
                          }
                        ]}
                        searchable={false}
                        pagination={{
                          enabled: true,
                          pageSize: 10,
                          showPageSizeSelector: false,
                          showPageInfo: true
                        }}
                        emptyMessage={
                          <div className="text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No sales found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                          </div>
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Cashier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {cashierToDelete?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (cashierToDelete) {
                    handleDeleteCashier(cashierToDelete);
                    setIsDeleteDialogOpen(false);
                    setCashierToDelete(null);
                  }
                }}
                disabled={isSaving || !hasPermission('cashiers_delete')}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Cashier'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Password Reset Dialog */}
        <PasswordResetDialog
          isOpen={isPasswordResetDialogOpen}
          onClose={closePasswordResetDialog}
          userName={cashierForPasswordReset?.name || ''}
          onResetPassword={resetCashierPassword}
          title="Reset Cashier Password"
          description={`Reset password for ${cashierForPasswordReset?.name}`}
          buttonText="Reset Password"
        />
      </main>
    </div>
  );
};