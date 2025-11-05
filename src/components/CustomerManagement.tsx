/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useStoreSales } from '@/utils/hooks/sales';
import {
  useStoreCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerSales
} from '@/utils/hooks/customers';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  Receipt,
  User,
  Download,
  Activity,
  Eye,
  Loader2,
  Users,
  Building2
} from 'lucide-react';
import { Store } from '@/types/auth';
import { Customer as DBCustomer } from '@/types/index';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase?: Date;
  createdAt: Date;
  storeId: string;
  storeName?: string;
}


interface DBSale {
  id: string;
  customer_id: string;
  total_amount: number;
  transaction_date: string;
  created_at: string;
  [key: string]: unknown;
}

interface CustomerSale {
  id: string;
  customer_id: string;
  total_amount: number;
  transaction_date: string;
  created_at: string;
  receipt_number: string;
  payment_method: string;
  status: string;
  sale_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  [key: string]: unknown;
}

interface CustomerManagementProps {
  onBack?: () => void; // Optional for backward compatibility
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ onBack }) => {
  const { user, currentStore, currentBusiness } = useAuth();
  const { 
    formatCurrency, 
    formatDate,
    formatDateTime,
    formatRelativeTime
  } = useSystem();
  const { logActivity } = useActivityLogger();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterStore, setFilterStore] = useState<string>(currentStore?.id || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // React Query hooks
  const {
    data: dbCustomers = [],
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers
  } = useStoreCustomers(currentStore?.id || '', {
    enabled: !!currentStore?.id
  });

  // Get stores from currentBusiness (same pattern as Header component)
  const businessStores = currentBusiness?.stores || [];

  const {
    data: storeSales = [],
    isLoading: isLoadingSales,
  } = useStoreSales(currentStore?.id || '', {
    enabled: !!currentStore?.id
  });

  // React Query mutations
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer(currentStore?.id || '');
  const deleteCustomerMutation = useDeleteCustomer(currentStore?.id || '');

  // Customer sales query (only when needed)
  const {
    data: customerSales = [],
    isLoading: isLoadingCustomerSales
  } = useCustomerSales(selectedCustomer?.id || '');

  // Loading states
  const isLoading = isLoadingCustomers || isLoadingSales || isLoadingCustomerSales;

  // Transform database customers to match our interface with calculated stats
  const customers = useMemo(() => {
    if (!dbCustomers || !storeSales) return [];
    
    return dbCustomers.map((customer: DBCustomer) => {
      // Calculate customer statistics from sales data
      const customerSales = storeSales.filter((sale: DBSale) => sale.customer_id === customer.id);
      const totalPurchases = customerSales.length;
      const totalSpent = customerSales.reduce((sum: number, sale: DBSale) => sum + (sale.total_amount || 0), 0);
      const lastPurchase = customerSales.length > 0 
        ? new Date(Math.max(...customerSales.map((s: DBSale) => new Date(s.transaction_date || s.created_at).getTime())))
        : undefined;
      
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        notes: '', // Notes field not available in database schema
        totalPurchases,
        totalSpent,
        createdAt: new Date(customer.created_at || ''),
        lastPurchase,
        storeId: currentStore?.id || '',
        storeName: currentStore?.name || ''
      };
    });
  }, [dbCustomers, storeSales, currentStore?.id, currentStore?.name]);

  // Check if phone number already exists (for validation)
  const isPhoneNumberExists = useCallback((phone: string, excludeCustomerId?: string) => {
    return customers.some((customer: Customer) => 
      customer.phone === phone && customer.id !== excludeCustomerId
    );
  }, [customers]);

  // Filter customers
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && customer.totalPurchases > 0) ||
                         (filterStatus === 'inactive' && customer.totalPurchases === 0);
    
    const matchesStore = filterStore === 'all' || customer.storeId === filterStore;
    
    return matchesFilter && matchesStore;
  });

  // Customer stats
  const customerStats = {
    total: customers.length,
    active: customers.filter((c: Customer) => c.totalPurchases > 0).length,
    totalSpent: customers.reduce((sum: number, c: Customer) => sum + c.totalSpent, 0),
    averageSpent: customers.length > 0 ? customers.reduce((sum: number, c: Customer) => sum + c.totalSpent, 0) / customers.length : 0
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
  };

  const handleAddCustomer = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Check if phone number already exists
    if (isPhoneNumberExists(formData.phone.trim())) {
      toast.error('A customer with this phone number already exists. Please use a different phone number or edit the existing customer.');
      return;
    }

    if (!currentStore?.id) {
      toast.error('No store selected');
      return;
    }

    try {
      // Create customer in database
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        store_id: currentStore.id,
      };

      const newCustomer = await createCustomerMutation.mutateAsync(customerData);
      
      if (newCustomer.success) {
        // Refresh customers from database
        await refetchCustomers();

        logActivity('customer_create', 'CustomerManagement', `Created customer: ${customerData.name}`, {
          customerId: newCustomer.customer.id,
          customerName: customerData.name,
          customerPhone: customerData.phone
        });

        resetForm();
        setShowAddDialog(false);
        toast.success('Customer created successfully');
      } else {
        throw new Error('Failed to create customer');
      }
    } catch (error: unknown) {
      console.error('Error adding customer:', error);
      toast.error('Failed to create customer');
    }
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) {
      toast.error('No customer selected');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Check if phone number already exists (excluding current customer)
    if (isPhoneNumberExists(formData.phone.trim(), selectedCustomer.id)) {
      toast.error('A customer with this phone number already exists. Please use a different phone number.');
      return;
    }

    try {
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined
      };

      // Update customer in database
      await updateCustomerMutation.mutateAsync({
        customerId: selectedCustomer.id,
        customerData: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          store_id: currentStore?.id || ''
        }
      });
      
      // Refresh customers from database
      await refetchCustomers();

      logActivity('customer_update', 'CustomerManagement', `Updated customer: ${updatedCustomer.name}`, {
        customerId: updatedCustomer.id,
        customerName: updatedCustomer.name
      });

      resetForm();
      setSelectedCustomer(null);
      setShowEditDialog(false);
      toast.success('Customer updated successfully');
    } catch (error: unknown) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!currentStore?.id) return;
    
    // Prevent deletion if customer has purchase history
    if (customer.totalPurchases > 0) {
      toast.error('Cannot delete customer with purchase history. Customers with purchases cannot be deleted.');
      setIsDeleteDialogOpen(false);
      return;
    }
    
    // setIsLoading(true); // This line is removed
    try {
      // Delete customer from database
      await deleteCustomerMutation.mutateAsync(customer.id);
      
      // Refresh customers from database
      await refetchCustomers();

      logActivity('customer_delete', 'CustomerManagement', `Deleted customer: ${customer.name}`, {
        customerId: customer.id,
        customerName: customer.name
      });

      toast.success('Customer deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      // setIsLoading(false); // This line is removed
    }
  };


  // Handle view customer
  const handleViewCustomer = useCallback((customer: Customer) => {
    if (!currentStore?.id) return;
    
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
    
    // The customer sales will be automatically fetched by the useCustomerSales hook
  }, [currentStore?.id]);

  // Sync filterStore with currentStore from header
  useEffect(() => {
    if (currentStore?.id) {
      setFilterStore(currentStore.id);
    } else {
      // When "All Stores" is selected, customers query is disabled, so filterStore can stay as 'all'
      setFilterStore('all');
    }
  }, [currentStore?.id]);

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setShowEditDialog(true);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const exportCustomers = useCallback(() => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    import('../utils/export-utils').then(({ exportCustomers: exportCustomersUtil }) => {
      try {
        exportCustomersUtil(filteredCustomers, {
          storeName: currentStore?.name
        });
        
        logActivity('data_export', 'CustomerManagement', `Exported ${filteredCustomers.length} customers`, {
          count: filteredCustomers.length
        });
      } catch (error: unknown) {
        console.error('Export error:', error);
        toast.error('Failed to export customers');
      }
    }).catch(error => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [filteredCustomers, currentStore?.name, logActivity]);



  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (customer: Customer) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium break-words">{customer.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 break-words">
              <Phone className="w-3 h-3 flex-shrink-0" />
              {customer.phone}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (customer: Customer) => (
        <div className="space-y-1 min-w-0">
          {customer.email && (
            <p className="text-sm flex items-center gap-1 break-words">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="break-words">{customer.email}</span>
            </p>
          )}
          {customer.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 break-words line-clamp-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="break-words">{customer.address}</span>
            </p>
          )}
        </div>
      )
    },
    {
      key: 'store',
      label: 'Store',
      render: (customer: Customer) => (
        <div className="text-sm">
          <div className="font-medium">
            {customer.storeName || currentStore?.name || 'Unknown Store'}
          </div>
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Purchase History',
      render: (customer: Customer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={customer.totalPurchases > 0 ? 'default' : 'secondary'}>
              {customer.totalPurchases} purchase{customer.totalPurchases !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
          {customer.lastPurchase && (
            <p className="text-xs text-muted-foreground">
              Last: {formatDate(customer.lastPurchase)}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'created',
      label: 'Member Since',
      render: (customer: Customer) => (
        <div className="text-sm">
          <p>{formatDate(customer.createdAt)}</p>
          <p className="text-muted-foreground">
            {formatRelativeTime(customer.createdAt)}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (customer: Customer) => (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(customer)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            disabled={customer.totalPurchases > 0}
            onClick={() => {
              if (customer.totalPurchases > 0) {
                toast.error('Cannot delete customer with purchase history');
                return;
              }
              setSelectedCustomer(customer);
              setIsDeleteDialogOpen(true);
            }}
            title={customer.totalPurchases > 0 ? 'Cannot delete customer with purchase history' : 'Delete customer'}
            className={customer.totalPurchases > 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Trash2 className={`w-4 h-4 ${customer.totalPurchases > 0 ? 'text-gray-400' : 'text-red-600'}`} />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
        title="Customer Management"
        subtitle={`Manage customers for ${currentStore?.name}`}
      >

        {/* Customer Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : customerStats.total}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : customerStats.active}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customerStats.total > 0 ? Math.round((customerStats.active / customerStats.total) * 100) : 0}% active
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(customerStats.totalSpent)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. per Customer</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(customerStats.averageSpent)}
                  </p>
                </div>
                <Receipt className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Status:</span>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Store:</span>
                <Select value={filterStore} onValueChange={(value: string) => setFilterStore(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">All Stores</p>
                          <p className="text-sm text-muted-foreground">Combined view</p>
                        </div>
                      </div>
                    </SelectItem>
                    {businessStores.map((store: Store) => (
                      <SelectItem key={store.id} value={store.id}>
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-60">
                            {store.address || 'No address'}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground ml-auto">
                {filterStatus === 'all' && filterStore === 'all' && `Showing all ${customers.length} customers`}
                {filterStatus === 'active' && filterStore === 'all' && `Showing ${customers.filter((c: any) => c.totalPurchases > 0).length} active customers`}
                {filterStatus === 'inactive' && filterStore === 'all' && `Showing ${customers.filter((c: any) => c.totalPurchases === 0).length} inactive customers`}
                {filterStore !== 'all' && `Showing customers from selected store`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers DataTable */}
        <DataTable
          title="Customers"
          columns={columns}
          data={filteredCustomers}
          searchable={true}
          searchPlaceholder="Search customers by name, phone, or email..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          emptyMessage="Start by adding your first customer to the system"
          tableName="customers"
          userRole={user?.role}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCustomers}>
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Customer</span>
              </Button>
            </div>
          }
        />

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer profile for your store. Phone number must be unique to avoid duplicate customer records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className={formData.phone && isPhoneNumberExists(formData.phone) ? 'border-red-500' : ''}
                />
                {formData.phone && isPhoneNumberExists(formData.phone) && (
                  <p className="text-sm text-red-600 mt-1">
                    A customer with this phone number already exists
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Customer address"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the customer"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleAddCustomer}
                disabled={isLoading || !formData.name.trim() || !formData.phone.trim() || isPhoneNumberExists(formData.phone.trim())}
              >
                {isLoading ? 'Adding...' : 'Add Customer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information. Phone number must be unique to avoid duplicate customer records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className={formData.phone && isPhoneNumberExists(formData.phone, selectedCustomer?.id) ? 'border-red-500' : ''}
                />
                {formData.phone && isPhoneNumberExists(formData.phone, selectedCustomer?.id) && (
                  <p className="text-sm text-red-600 mt-1">
                    A customer with this phone number already exists
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Customer address"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the customer"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleEditCustomer}
                disabled={isLoading || !formData.name.trim() || !formData.phone.trim() || isPhoneNumberExists(formData.phone.trim(), selectedCustomer?.id)}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={showCustomerDetail} onOpenChange={setShowCustomerDetail}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              Customer profile and purchase history
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedCustomer.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Member since {formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Purchase Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Total Purchases</Label>
                      <p className="text-2xl font-semibold">{selectedCustomer.totalPurchases}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Spent</Label>
                      <p className="text-2xl font-semibold">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    </div>
                    {selectedCustomer.lastPurchase && (
                      <div>
                        <Label className="text-muted-foreground">Last Purchase</Label>
                        <p>{formatDate(selectedCustomer.lastPurchase)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.notes || 'No notes available'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCustomerSales ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p>Loading purchase history...</p>
                    </div>
                  ) : customerSales.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No purchase history available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerSales.map((sale: CustomerSale) => (
                        <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {sale.receipt_number ? `Receipt #${sale.receipt_number}` : `Sale #${sale.id.slice(-6)}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(new Date(sale.transaction_date || sale.created_at))} - {sale.sale_items?.length || 0} items
                            </p>
                            {sale.status && (
                              <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'} className="text-xs mt-1">
                                {sale.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(sale.total_amount)}</p>
                            <Badge variant="outline" className="text-xs">
                              {sale.payment_method}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
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
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCustomer && selectedCustomer.totalPurchases > 0 ? (
                <div className="space-y-2">
                  <p className="text-destructive font-medium">
                    Cannot delete customer with purchase history
                  </p>
                  <p>
                    {selectedCustomer.name} has {selectedCustomer.totalPurchases} purchase{selectedCustomer.totalPurchases !== 1 ? 's' : ''} and cannot be deleted to maintain data integrity.
                  </p>
                </div>
              ) : (
                <p>Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            {selectedCustomer && selectedCustomer.totalPurchases === 0 && (
              <AlertDialogAction 
                onClick={() => {
                  if (selectedCustomer && selectedCustomer.totalPurchases === 0) {
                    handleDeleteCustomer(selectedCustomer);
                    setIsDeleteDialogOpen(false);
                    setSelectedCustomer(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};