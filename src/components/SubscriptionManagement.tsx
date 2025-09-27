import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/common/Header';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2,
  CreditCard,
  Check,
  Loader2
} from 'lucide-react';

// Import types from centralized location
import { 
  SubscriptionProps,
  SubscriptionPlan,
  SubscriptionPlanFormData
} from '@/types';

// Import stores from centralized location
import { 
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useSubscriptionPlanStats
} from '@/stores';

// Separate PlanForm component
const PlanForm = React.memo(({ 
  plan, 
  onChange, 
  onSave, 
  onCancel,
  submitting = false
}: {
  plan: SubscriptionPlanFormData;
  onChange: (plan: SubscriptionPlanFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  submitting?: boolean;
}) => {
  const handleInputChange = useCallback((field: keyof SubscriptionPlanFormData, value: string | number | boolean) => {
    onChange({ ...plan, [field]: value });
  }, [plan, onChange]);

  const handleFeatureChange = useCallback((index: number, value: string) => {
    const newFeatures = [...(plan.features || [])];
    newFeatures[index] = value;
    onChange({ ...plan, features: newFeatures });
  }, [plan, onChange]);

  const addFeature = useCallback(() => {
    onChange({ ...plan, features: [...(plan.features || []), ''] });
  }, [plan, onChange]);

  const removeFeature = useCallback((index: number) => {
    const newFeatures = (plan.features || []).filter((_: string, i: number) => i !== index);
    onChange({ ...plan, features: newFeatures });
  }, [plan, onChange]);

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plan-name">Plan Name *</Label>
          <Input
            id="plan-name"
            value={plan.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter plan name"
          />
        </div>
        <div>
          <Label htmlFor="plan-display-order">Display Order</Label>
          <Input
            id="plan-display-order"
            type="number"
            min="0"
            value={plan.display_order}
            onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plan-price-monthly">Monthly Price ($) *</Label>
          <Input
            id="plan-price-monthly"
            type="number"
            min="0"
            step="0.01"
            value={plan.price_monthly}
            onChange={(e) => handleInputChange('price_monthly', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="plan-price-yearly">Yearly Price ($) *</Label>
          <Input
            id="plan-price-yearly"
            type="number"
            min="0"
            step="0.01"
            value={plan.price_yearly}
            onChange={(e) => handleInputChange('price_yearly', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="plan-description">Description *</Label>
        <Textarea
          id="plan-description"
          value={plan.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter plan description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="plan-max-stores">Max Stores</Label>
          <Input
            id="plan-max-stores"
            type="number"
            min="1"
            value={plan.max_stores}
            onChange={(e) => handleInputChange('max_stores', parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="plan-max-products">Max Products</Label>
          <Input
            id="plan-max-products"
            type="number"
            min="1"
            value={plan.max_products}
            onChange={(e) => handleInputChange('max_products', parseInt(e.target.value) || 100)}
            placeholder="100"
          />
        </div>
        <div>
          <Label htmlFor="plan-max-users">Max Users</Label>
          <Input
            id="plan-max-users"
            type="number"
            min="1"
            value={plan.max_users}
            onChange={(e) => handleInputChange('max_users', parseInt(e.target.value) || 5)}
            placeholder="5"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Features</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFeature}>
            <Plus className="w-3 h-3 mr-1" />
            Add Feature
          </Button>
        </div>
        <div className="space-y-2">
          {(plan.features || []).map((feature: string, index: number) => (
            <div key={`feature-${index}`} className="flex items-center gap-2">
              <Input
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="Enter feature description"
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeFeature(index)}
                disabled={(plan.features || []).length === 1}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="plan-active"
          checked={plan.is_active}
          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
        />
        <Label htmlFor="plan-active">Active Plan</Label>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave} disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Plan
        </Button>
      </div>
    </div>
  );
});

PlanForm.displayName = 'PlanForm';

export const SubscriptionManagement: React.FC<SubscriptionProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newPlan, setNewPlan] = useState<SubscriptionPlanFormData>({
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    features: [''],
    max_stores: 1,
    max_products: 100,
    max_users: 5,
    is_active: true,
    display_order: 0,
    is_popular: false
  });

  // React Query hooks
  const {
    data: plansResponse,
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans
  } = useSubscriptionPlans({
    enabled: user?.role === 'superadmin'
  });

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError
  } = useSubscriptionPlanStats({
    enabled: user?.role === 'superadmin'
  });

  const plans = plansResponse || [];
  const stats = statsResponse?.stats || {
    totalPlans: 0,
    activePlans: 0,
    averageMonthlyPrice: 0,
    averageYearlyPrice: 0,
    highestMonthlyPrice: 0,
    highestYearlyPrice: 0
  };

  const filteredPlans = plans.filter((plan: SubscriptionPlan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutation hooks
  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const deletePlanMutation = useDeleteSubscriptionPlan();

  const handleAddPlan = useCallback(async () => {
    if (!newPlan.name || !newPlan.description) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      await createPlanMutation.mutateAsync({
        ...newPlan,
        features: newPlan.features.filter(f => f.trim() !== '')
      });
      
      setNewPlan({
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        features: [''],
        max_stores: 1,
        max_products: 100,
        max_users: 5,
        is_active: true,
        display_order: 0,
        is_popular: false
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating subscription plan:', error);
    } finally {
      setSubmitting(false);
    }
  }, [newPlan, createPlanMutation]);

  const handleEditPlan = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdatePlan = useCallback(async () => {
    if (!selectedPlan) return;

    try {
      setSubmitting(true);
      const planData = {
        name: selectedPlan.name,
        description: selectedPlan.description,
        price_monthly: selectedPlan.price_monthly,
        price_yearly: selectedPlan.price_yearly,
        features: (selectedPlan.features || []).filter(f => f.trim() !== ''),
        max_stores: selectedPlan.max_stores,
        max_products: selectedPlan.max_products,
        max_users: selectedPlan.max_users,
        is_active: selectedPlan.is_active,
        display_order: selectedPlan.display_order,
        is_popular: selectedPlan.is_popular || false
      };

      await updatePlanMutation.mutateAsync({
        planId: selectedPlan.id,
        planData
      });

      setIsEditDialogOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error updating subscription plan:', error);
    } finally {
      setSubmitting(false);
    }
  }, [selectedPlan, updatePlanMutation]);

  const handleDeletePlan = useCallback(async (planId: string, planName: string) => {
    if (planName.toLowerCase() === 'trial') {
      toast.error('Cannot delete the trial plan');
      return;
    }

    try {
      await deletePlanMutation.mutateAsync(planId);
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
    }
  }, [deletePlanMutation]);

  const columns = [
    {
      key: 'name',
      label: 'Plan',
      render: (plan: SubscriptionPlan) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">{plan.name}</p>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (plan: SubscriptionPlan) => (
        <div>
          <p className="font-semibold">
            ${plan.price_monthly}<span className="text-sm font-normal">/month</span>
          </p>
          <p className="text-sm text-muted-foreground">
            ${plan.price_yearly}<span className="text-sm">/year</span>
          </p>
        </div>
      )
    },
    {
      key: 'limits',
      label: 'Limits',
      render: (plan: SubscriptionPlan) => (
        <div className="text-sm">
          <p>Stores: {plan.max_stores}</p>
          <p>Products: {plan.max_products}</p>
          <p>Users: {plan.max_users}</p>
        </div>
      )
    },
    {
      key: 'features',
      label: 'Features',
      render: (plan: SubscriptionPlan) => (
        <div className="text-sm">
          <p>{(plan.features || []).length} features</p>
          <p className="text-muted-foreground truncate max-w-48">
            {(plan.features || []).slice(0, 2).join(', ')}
            {(plan.features || []).length > 2 && '...'}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (plan: SubscriptionPlan) => (
        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
          {plan.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (plan: SubscriptionPlan) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEditPlan(plan)}>
            <Edit className="w-3 h-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive"
                disabled={plan.name.toLowerCase() === 'trial'}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{plan.name}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeletePlan(plan.id, plan.name)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  const isLoading = isLoadingPlans || isLoadingStats;
  const error = plansError || statsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-red-700 mb-4">Failed to load subscription plans</p>
        <Button onClick={() => refetchPlans()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Subscription Management"
        subtitle="Create and manage SCIMS subscription plans"
        showBackButton
        onBack={onBack}
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
              <DialogDescription>
                Design a new subscription plan with custom features and pricing.
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              plan={newPlan}
              onChange={setNewPlan}
              onSave={handleAddPlan}
              onCancel={() => setIsAddDialogOpen(false)}
              submitting={submitting}
            />
          </DialogContent>
        </Dialog>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Plans</p>
                  <p className="text-2xl font-semibold">{stats.totalPlans}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-semibold">{stats.activePlans}</p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Price</p>
                  <p className="text-2xl font-semibold">
                    ${stats.averageMonthlyPrice.toFixed(0)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <DataTable
          title="Subscription Plans"
          data={filteredPlans}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search plans..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onExport={() => {
            import('../utils/export-utils').then(({ exportSubscriptionPlans }) => {
              exportSubscriptionPlans(filteredPlans as unknown as Record<string, unknown>[], {
                businessName: 'SCIMS'
              });
            });
          }}
          emptyMessage="No subscription plans found"
          tableName="subscriptionPlans"
          userRole={user?.role}
        />

        {/* Edit Plan Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Subscription Plan</DialogTitle>
              <DialogDescription>
                Update the subscription plan details and features.
              </DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <PlanForm
                plan={{
                  name: selectedPlan.name,
                  description: selectedPlan.description || '',
                  price_monthly: selectedPlan.price_monthly || 0,
                  price_yearly: selectedPlan.price_yearly || 0,
                  features: selectedPlan.features || [],
                  max_stores: selectedPlan.max_stores || 1,
                  max_products: selectedPlan.max_products || 100,
                  max_users: selectedPlan.max_users || 5,
                  is_active: selectedPlan.is_active || false,
                  display_order: selectedPlan.display_order || 0,
                  is_popular: selectedPlan.is_popular || false
                }}
                onChange={(planData) => setSelectedPlan({ ...selectedPlan, ...planData } as SubscriptionPlan)}
                onSave={handleUpdatePlan}
                onCancel={() => setIsEditDialogOpen(false)}
                submitting={submitting}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};