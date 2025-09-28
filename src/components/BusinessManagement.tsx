import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './common/Header';
import { DataTable } from './common/DataTable';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Eye, 
  Store, 
  Users, 
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  usePlatformBusinesses, 
  useSubscriptionPlans,
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
  useCountries,
  useCurrencies,
  useLanguages
} from '../utils/hooks/useStoreData';
import { BusinessDetail } from './BusinessDetail';
import { 
  BUSINESS_TYPES, 
  BUSINESS_TYPE_LABELS, 
  BUSINESS_TYPE_DESCRIPTIONS,
  BUSINESS_TYPE_ICONS 
} from './common/BusinessTypeConstants';

interface BusinessManagementProps {
  onBack: () => void;
}

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  business_type?: string;
  country_id?: string;
  currency_id?: string;
  language_id?: string;
  timezone: string;
  subscription_plan_id?: string;
  subscription_status: string;
  is_active: boolean;
  country?: {
    id: string;
    name: string;
    code: string;
  };
  currency?: {
    id: string;
    name: string;
    symbol: string;
  };
  language?: {
    id: string;
    name: string;
    code: string;
  };
  subscription_plans?: {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    max_stores: number;
    max_products: number;
    max_users: number;
  };
  stores: Array<{
    id: string;
    name: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    manager_name?: string;
    is_active: boolean;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export const BusinessManagement: React.FC<BusinessManagementProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showBusinessDetail, setShowBusinessDetail] = useState(false);

  const [newBusiness, setNewBusiness] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    business_type: 'retail',
    country_id: '',
    currency_id: '',
    language_id: '',
    timezone: 'UTC',
    subscription_plan_id: '',
    subscription_status: 'active',
    is_active: true
  });

  // Use React Query hooks for data fetching
  const {
    data: businesses = [],
    isLoading: businessesLoading,
    error: businessesError,
    refetch: refetchBusinesses
  } = usePlatformBusinesses({ enabled: user?.role === 'superadmin' });

  const {
    data: subscriptionPlans = [],
    isLoading: plansLoading,
    error: plansError
  } = useSubscriptionPlans();

  // Reference data hooks
  const {
    data: countries = [],
    isLoading: countriesLoading,
    error: countriesError
  } = useCountries();

  const {
    data: currencies = [],
    isLoading: currenciesLoading,
    error: currenciesError
  } = useCurrencies();

  const {
    data: languages = [],
    isLoading: languagesLoading,
    error: languagesError
  } = useLanguages();

  // Business creation and update mutations
  const createBusinessMutation = useCreateBusiness();
  const updateBusinessMutation = useUpdateBusiness();
  const deleteBusinessMutation = useDeleteBusiness();

  // Calculate stats from loaded data
  const stats = {
    totalBusinesses: businesses.length,
    activeSubscriptions: businesses.filter((b: Business) => b.subscription_status === 'active').length,
    totalStores: businesses.reduce((sum: number, b: Business) => sum + (b.stores?.length || 0), 0),
    platformUsers: businesses.reduce((sum: number, b: Business) => sum + (b.stores?.length || 0), 0) // Use stores count as proxy for users
  };

  // Combined loading state
  const isLoading = businessesLoading || plansLoading || countriesLoading || currenciesLoading || languagesLoading;

  // Combined error state
  const hasError = businessesError || plansError || countriesError || currenciesError || languagesError;

  const filteredBusinesses = businesses.filter((business: Business) =>
    (business.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export businesses to CSV
  const exportBusinesses = useCallback(() => {
    if (filteredBusinesses.length === 0) {
      toast.error('No businesses to export');
      return;
    }

    import('../utils/export-utils').then(({ exportBusinesses: exportBusinessesUtil }) => {
      try {
        exportBusinessesUtil(filteredBusinesses, {
          businessName: 'SCIMS Platform'
        });
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export businesses');
      }
    }).catch(error => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [filteredBusinesses]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSubscriptionColor = (subscription: string, status: string) => {
    if (status === 'expired' || status === 'cancelled') return 'destructive';
    switch (subscription) {
      case 'trial': return 'secondary';
      case 'basic': return 'default';
      case 'premium': return 'default';
      case 'enterprise': return 'default';
      default: return 'secondary';
    }
  };

  const resetNewBusinessForm = () => {
    setNewBusiness({
      name: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      website: '',
      description: '',
      business_type: 'retail',
      country_id: '',
      currency_id: '',
      language_id: '',
      timezone: 'UTC',
      subscription_plan_id: '',
      subscription_status: 'active',
      is_active: true
    });
  };

  const handleAddBusiness = async () => {
    if (!newBusiness.name || !newBusiness.email || !newBusiness.username) {
      toast.error('Please fill in all required fields (Business Name, Email, and Admin Username)');
      return;
    }

    // Validate username format
    if (newBusiness.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(newBusiness.username)) {
      toast.error('Username can only contain letters, numbers, dots, underscores, and hyphens');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create the business using the mutation hook
      const result = await createBusinessMutation.mutateAsync(newBusiness);
      
      // Reset form and close dialog on success
      resetNewBusinessForm();
      setIsAddDialogOpen(false);
      
      // Show success message with admin credentials
      if (result?.admin_user) {
        toast.success(
          `Business created successfully! Welcome email sent to ${result.admin_user.email}. Admin username: ${result.admin_user.username}, Default password: ${result.admin_user.default_password}`,
          { duration: 8000 }
        );
      } else {
        toast.success('Business created successfully! Welcome email sent.');
      }
      
      // Refresh the businesses list immediately
      refetchBusinesses();
    } catch (error) {
      console.error('Error creating business:', error);
      // Don't close dialog on error - let user fix and retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBusiness = async () => {
    if (!selectedBusiness) return;

    try {
      setSubmitting(true);
      
      // Update the business using the mutation hook
      await updateBusinessMutation.mutateAsync({
        id: selectedBusiness.id,
        businessData: {
          name: selectedBusiness.name,
          email: selectedBusiness.email,
          phone: selectedBusiness.phone,
          address: selectedBusiness.address,
          website: selectedBusiness.website,
          description: selectedBusiness.description,
          business_type: selectedBusiness.business_type,
          country_id: selectedBusiness.country_id,
          currency_id: selectedBusiness.currency_id,
          language_id: selectedBusiness.language_id,
          timezone: selectedBusiness.timezone,
          subscription_plan_id: selectedBusiness.subscription_plan_id,
          subscription_status: selectedBusiness.subscription_status,
          is_active: selectedBusiness.is_active
        }
      });
      
      // Close dialog on success
      setIsEditDialogOpen(false);
      
      // Refresh the businesses list immediately
      refetchBusinesses();
    } catch (error) {
      console.error('Error updating business:', error);
      // Don't close dialog on error - let user fix and retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return;

    try {
      setSubmitting(true);
      
      // Delete the business using the API
      const result = await deleteBusinessMutation.mutateAsync(selectedBusiness.id);
      
      // Close dialog on success
      setIsDeleteDialogOpen(false);
      setSelectedBusiness(null);
      
      // Show detailed success message
      if (result.deletedUsers > 0) {
        toast.success(
          `Business deleted successfully! Deleted ${result.deletedUsers} users, ${result.remainingUsers} users remain in other businesses.`
        );
      } else {
        toast.success('Business deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewBusiness = useCallback((business: Business) => {
    setSelectedBusiness(business);
    setShowBusinessDetail(true);
  }, []);

  const handleEditBusiness = useCallback((business: Business) => {
    setSelectedBusiness(business);
    setIsEditDialogOpen(true);
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Business',
      render: (business: Business) => (
        <div>
          <p className="font-medium">{business.name}</p>
          <p className="text-sm text-muted-foreground">{business.email}</p>
        </div>
      )
    },
    {
      key: 'subscription',
      label: 'Subscription',
      render: (business: Business) => (
        <Badge variant={getSubscriptionColor(business.subscription_plans?.name || 'Unknown', business.subscription_status)}>
          {business.subscription_plans?.name || 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'business_type',
      label: 'Business Type',
      render: (business: Business) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{BUSINESS_TYPE_ICONS[business.business_type as keyof typeof BUSINESS_TYPE_ICONS] || '🏢'}</span>
          <Badge variant="outline" className="font-medium">
            {BUSINESS_TYPE_LABELS[business.business_type as keyof typeof BUSINESS_TYPE_LABELS] || 'Retail Store'}
          </Badge>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (business: Business) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(business.subscription_status)}
          <span className="capitalize">{business.subscription_status}</span>
        </div>
      )
    },
    {
      key: 'stores',
      label: 'Stores',
      render: (business: Business) => (
        <div>
          <span className="font-medium">{business.stores?.length || 0}</span>
          <span className="text-sm text-muted-foreground ml-1">
            ({business.stores?.filter(s => s.is_active).length || 0} active)
          </span>
        </div>
      )
    },
    {
      key: 'created',
      label: 'Created',
      render: (business: Business) => {
        if (!business.created_at) return 'N/A';
        const date = new Date(business.created_at);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (business: Business) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleViewBusiness(business)}>
            <Eye className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEditBusiness(business)}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => {
              setSelectedBusiness(business);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading businesses...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Error loading businesses. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Business Detail Page */}
      {showBusinessDetail && selectedBusiness ? (
        <BusinessDetail
          business={selectedBusiness}
          onBack={() => {
            setShowBusinessDetail(false);
            setSelectedBusiness(null);
          }}
        />
      ) : (
        <>
          <Header 
            title="Business Management"
            subtitle="Manage all registered businesses on SCIMS"
            showBackButton
            onBack={onBack}
            showLogout={false}
          >
      </Header>

      {/* Success Message Display */}
      {createBusinessMutation.isSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-green-800 text-sm font-medium">
                  Business created successfully! Welcome email sent with login credentials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Businesses</p>
                  <p className="text-2xl font-semibold">{stats.totalBusinesses}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-semibold">{stats.activeSubscriptions}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stores</p>
                  <p className="text-2xl font-semibold">{stats.totalStores}</p>
                </div>
                <Store className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Users</p>
                  <p className="text-2xl font-semibold">{stats.platformUsers}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Businesses Table */}
        <DataTable
          title="Businesses"
          data={filteredBusinesses}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search businesses..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onExport={exportBusinesses}
          emptyMessage="No businesses found"
          tableName="businesses"
          userRole={user?.role}
          actions={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Button>
          }
        />

        {/* Add Business Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetNewBusinessForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Add New Business</DialogTitle>
              <DialogDescription>
                Create a new business account on SCIMS platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-name">Business Name *</Label>
                  <Input
                    id="add-name"
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                    placeholder="Enter business name"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="add-email">Email *</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={newBusiness.email}
                    onChange={(e) => setNewBusiness({ ...newBusiness, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="add-username">Admin Username *</Label>
                <Input
                  id="add-username"
                  value={newBusiness.username}
                  onChange={(e) => setNewBusiness({ ...newBusiness, username: e.target.value })}
                  placeholder="Enter admin username"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be the username for the business administrator account
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    value={newBusiness.phone}
                    onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="add-website">Website</Label>
                  <Input
                    id="add-website"
                    value={newBusiness.website}
                    onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="add-address">Address</Label>
                <Input
                  id="add-address"
                  value={newBusiness.address}
                  onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                  placeholder="Enter business address"
                />
              </div>

              <div>
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={newBusiness.description}
                  onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                  placeholder="Enter business description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-business-type">Business Type</Label>
                  <Select
                    value={newBusiness.business_type || 'retail'}
                    onValueChange={(value) => setNewBusiness({ ...newBusiness, business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">
                              {BUSINESS_TYPE_DESCRIPTIONS[value as keyof typeof BUSINESS_TYPE_DESCRIPTIONS]}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-country">Country</Label>
                  <Select
                    value={newBusiness.country_id}
                    onValueChange={(value) => setNewBusiness({ ...newBusiness, country_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country: { id: string; name: string }) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-currency">Currency</Label>
                  <Select
                    value={newBusiness.currency_id}
                    onValueChange={(value) => setNewBusiness({ ...newBusiness, currency_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency: { id: string; name: string }) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="add-language">Language</Label>
                  <Select
                    value={newBusiness.language_id}
                    onValueChange={(value) => setNewBusiness({ ...newBusiness, language_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language: { id: string; name: string }) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="add-timezone">Timezone</Label>
                <Select
                  value={newBusiness.timezone}
                  onValueChange={(value) => setNewBusiness({ ...newBusiness, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-subscription">Subscription Plan</Label>
                  <Select
                    value={newBusiness.subscription_plan_id}
                    onValueChange={(value) => setNewBusiness({ ...newBusiness, subscription_plan_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan: { id: string; name: string; price: number }) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="add-status">Subscription Status</Label>
                  <Select 
                    value={newBusiness.subscription_status} 
                    onValueChange={(value) => setNewBusiness({ ...newBusiness, subscription_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetNewBusinessForm();
                }} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleAddBusiness} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Business
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Business Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Business</DialogTitle>
              <DialogDescription>
                Update business information and settings.
              </DialogDescription>
            </DialogHeader>
            {selectedBusiness && (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Business Name</Label>
                    <Input
                      id="edit-name"
                      value={selectedBusiness.name}
                      onChange={(e) => setSelectedBusiness({ ...selectedBusiness, name: e.target.value })}
                      placeholder="Enter business name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedBusiness.email}
                      onChange={(e) => setSelectedBusiness({ ...selectedBusiness, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={selectedBusiness.phone || ''}
                      onChange={(e) => setSelectedBusiness({ ...selectedBusiness, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-website">Website</Label>
                    <Input
                      id="edit-website"
                      value={selectedBusiness.website || ''}
                      onChange={(e) => setSelectedBusiness({ ...selectedBusiness, website: e.target.value })}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    value={selectedBusiness.address || ''}
                    onChange={(e) => setSelectedBusiness({ ...selectedBusiness, address: e.target.value })}
                    placeholder="Enter business address"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedBusiness.description || ''}
                    onChange={(e) => setSelectedBusiness({ ...selectedBusiness, description: e.target.value })}
                    placeholder="Enter business description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-business-type">Business Type</Label>
                    <Select
                      value={selectedBusiness.business_type || 'retail'}
                      onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, business_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">
                                {BUSINESS_TYPE_DESCRIPTIONS[value as keyof typeof BUSINESS_TYPE_DESCRIPTIONS]}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-country">Country</Label>
                    <Select
                      value={selectedBusiness.country_id || ''}
                      onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, country_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country: { id: string; name: string }) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select
                      value={selectedBusiness.currency_id || ''}
                      onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, currency_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency: { id: string; name: string; symbol: string }) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-language">Language</Label>
                    <Select
                      value={selectedBusiness.language_id || ''}
                      onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, language_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language: { id: string; name: string }) => (
                          <SelectItem key={language.id} value={language.id}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-timezone">Timezone</Label>
                  <Select
                    value={selectedBusiness.timezone || 'UTC'}
                    onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-subscription">Subscription Plan</Label>
                    <Select
                      value={selectedBusiness.subscription_plan_id}
                      onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, subscription_plan_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subscription" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map((plan: { id: string; name: string; price: number }) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - {plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Subscription Status</Label>
                    <Select 
                      value={selectedBusiness.subscription_status} 
                      onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, subscription_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBusiness} disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Business Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Business</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedBusiness?.name}&quot;? This action cannot be undone and will permanently remove:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• All business data and settings</p>
                <p>• All stores and their configurations</p>
                <p>• All products and inventory</p>
                <p>• All categories and brands</p>
                <p>• All suppliers and restock orders</p>
                <p>• All sales and transaction history</p>
                <p>• All customer data and saved carts</p>
                <p>• All user accounts (if not associated with other businesses)</p>
                <p>• All user roles and permissions</p>
                <p>• All activity logs and audit trails</p>
              </div>
              <div className="text-sm font-medium text-red-600">
                This action is irreversible!
              </div>
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                <p className="font-medium">Note about users:</p>
                <p>• Users associated with multiple businesses will be preserved</p>
                <p>• Only users exclusively associated with this business will be deleted</p>
                <p>• This prevents accidental deletion of shared platform users</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)} 
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteBusiness} 
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete Business
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          </main>
        </>
      )}
    </div>
  );
};