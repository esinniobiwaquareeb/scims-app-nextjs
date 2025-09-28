import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { Header } from '@/components/common/Header';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Percent,
  DollarSign,
  Tag,
  Gift,
  TrendingUp,
  Package
} from 'lucide-react';
import { 
  Promotion, 
  Coupon, 
  DiscountType, 
  CreatePromotionData, 
  CreateCouponData 
} from '@/types/discount';

interface DiscountManagementProps {
  onBack: () => void;
}

export const DiscountManagement: React.FC<DiscountManagementProps> = ({ onBack }) => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { logActivity } = useActivityLogger();
  // Dialog and form state
  const [activeTab, setActiveTab] = useState('promotions');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Promotion | Coupon | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Promotion | Coupon | null>(null);
  
  // Data states
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<CreatePromotionData | CreateCouponData>({
    business_id: currentBusiness?.id || '',
    name: '',
    description: '',
    discount_type_id: '',
    discount_value: 0,
    minimum_purchase_amount: 0,
    maximum_discount_amount: undefined,
    minimum_quantity: 1,
    maximum_quantity: undefined,
    applicable_products: [],
    applicable_categories: [],
    applicable_brands: [],
    customer_restrictions: {},
    usage_limit: undefined,
    usage_limit_per_customer: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    store_id: currentStore?.id
  });

  // Reset form function
  const resetForm = useCallback(() => {
    const baseFormData = {
      business_id: currentBusiness?.id || '',
      name: '',
      description: '',
      discount_type_id: '',
      discount_value: 0,
      minimum_purchase_amount: 0,
      maximum_discount_amount: undefined,
      minimum_quantity: 1,
      maximum_quantity: undefined,
      applicable_products: [],
      applicable_categories: [],
      applicable_brands: [],
      customer_restrictions: {},
      usage_limit: undefined,
      usage_limit_per_customer: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      store_id: currentStore?.id
    };

    // Add code field for coupons
    if (activeTab === 'coupons') {
      setFormData({ ...baseFormData, code: '' });
    } else {
      setFormData(baseFormData);
    }
    
    setEditingItem(null);
    setItemToDelete(null);
  }, [currentStore?.id, activeTab]);

  const fetchDiscountTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/discounts/types');
      const data = await response.json();
      setDiscountTypes(data.discountTypes || []);
    } catch (error) {
      console.error('Error fetching discount types:', error);
      toast.error('Failed to fetch discount types');
    }
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await fetch(`/api/discounts/promotions?business_id=${currentBusiness?.id}&store_id=${currentStore?.id || ''}`);
      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id, currentStore?.id]);

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await fetch(`/api/discounts/coupons?business_id=${currentBusiness?.id}&store_id=${currentStore?.id || ''}`);
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    }
  }, [currentBusiness?.id, currentStore?.id]);

  // Fetch data
  useEffect(() => {
    if (currentBusiness?.id) {
      fetchDiscountTypes();
      fetchPromotions();
      fetchCoupons();
    }
  }, [currentBusiness?.id, fetchDiscountTypes, fetchPromotions, fetchCoupons]);

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.discount_type_id || !formData.discount_value) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate coupon code for coupons
      if (activeTab === 'coupons' && (!('code' in formData) || !formData.code)) {
        toast.error('Coupon code is required');
        return;
      }

      if (activeTab === 'promotions') {
        const response = await fetch('/api/discounts/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, business_id: currentBusiness?.id })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create promotion');
        }

        toast.success('Promotion created successfully');
        fetchPromotions();
      } else {
        const response = await fetch('/api/discounts/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, business_id: currentBusiness?.id })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create coupon');
        }

        toast.success('Coupon created successfully');
        fetchCoupons();
      }

      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create item');
    }
  };

  const handleEdit = (item: Promotion | Coupon) => {
    setEditingItem(item);
    setFormData({
      business_id: item.business_id,
      name: item.name,
      description: item.description || '',
      discount_type_id: item.discount_type_id,
      discount_value: item.discount_value,
      minimum_purchase_amount: item.minimum_purchase_amount || 0,
      maximum_discount_amount: item.maximum_discount_amount,
      minimum_quantity: 'minimum_quantity' in item ? item.minimum_quantity || 1 : 1,
      maximum_quantity: 'maximum_quantity' in item ? item.maximum_quantity : undefined,
      applicable_products: item.applicable_products || [],
      applicable_categories: item.applicable_categories || [],
      applicable_brands: item.applicable_brands || [],
      customer_restrictions: item.customer_restrictions || {},
      usage_limit: item.usage_limit,
      usage_limit_per_customer: item.usage_limit_per_customer,
      start_date: item.start_date.split('T')[0],
      end_date: item.end_date.split('T')[0],
      store_id: item.store_id,
      code: 'code' in item ? item.code : '' // Add code field for coupons
    });
    setShowCreateDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingItem || !currentBusiness?.id || !user?.id) return;

    setIsMutating(true);
    try {
      const endpoint = activeTab === 'promotions' 
        ? `/api/discounts/promotions/${editingItem.id}`
        : `/api/discounts/coupons/${editingItem.id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      
      // Log activity
      logActivity(
        activeTab === 'promotions' ? 'promotion_update' : 'coupon_update',
        'Discount Management',
        `Updated ${activeTab === 'promotions' ? 'promotion' : 'coupon'}: ${updatedItem.name}`,
        { itemId: updatedItem.id }
      );

      toast.success(`${activeTab === 'promotions' ? 'Promotion' : 'Coupon'} updated successfully`);
      
      // Refresh data
      if (activeTab === 'promotions') {
        fetchPromotions();
      } else {
        fetchCoupons();
      }

      setShowCreateDialog(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete || !currentBusiness?.id || !user?.id) return;

    setIsMutating(true);
    try {
      const endpoint = activeTab === 'promotions' 
        ? `/api/discounts/promotions/${itemToDelete.id}`
        : `/api/discounts/coupons/${itemToDelete.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Log activity
      logActivity(
        activeTab === 'promotions' ? 'promotion_delete' : 'coupon_delete',
        'Discount Management',
        `Deleted ${activeTab === 'promotions' ? 'promotion' : 'coupon'}: ${itemToDelete.name}`,
        { itemId: itemToDelete.id }
      );

      toast.success(`${activeTab === 'promotions' ? 'Promotion' : 'Coupon'} deleted successfully`);
      
      // Refresh data
      if (activeTab === 'promotions') {
        fetchPromotions();
      } else {
        fetchCoupons();
      }

      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteClick = (item: Promotion | Coupon) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (item: Promotion | Coupon) => {
    const now = new Date();
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);

    if (!item.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed_amount':
        return <DollarSign className="h-4 w-4" />;
      case 'buy_x_get_y':
        return <Gift className="h-4 w-4" />;
      case 'bulk_discount':
        return <Package className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const promotionColumns = [
    {
      key: 'name',
      header: 'Promotion',
      render: (promotion: Promotion) => (
        <div>
          <p className="font-medium">{promotion.name}</p>
          <p className="text-sm text-muted-foreground">{promotion.description}</p>
        </div>
      )
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (promotion: Promotion) => (
        <div className="flex items-center gap-2">
          {getDiscountTypeIcon(promotion.discount_type?.name || '')}
          <span className="font-medium">
            {promotion.discount_type?.name === 'percentage' 
              ? `${promotion.discount_value}%`
              : formatCurrency(promotion.discount_value)
            }
          </span>
        </div>
      )
    },
    {
      key: 'period',
      header: 'Period',
      render: (promotion: Promotion) => (
        <div className="text-sm">
          <p>{formatDate(promotion.start_date)}</p>
          <p className="text-muted-foreground">to {formatDate(promotion.end_date)}</p>
        </div>
      )
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (promotion: Promotion) => (
        <div className="text-sm">
          <p className="font-medium">{promotion.current_usage_count || 0} used</p>
          {promotion.usage_limit ? (
            <p className="text-muted-foreground">of {promotion.usage_limit}</p>
          ) : (
            <p className="text-muted-foreground">unlimited</p>
          )}
          {promotion.usage_limit && promotion.current_usage_count >= promotion.usage_limit && (
            <p className="text-red-500 text-xs">Limit reached</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (promotion: Promotion) => getStatusBadge(promotion)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (promotion: Promotion) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(promotion)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(promotion)}
            disabled={isMutating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const couponColumns = [
    {
      key: 'code',
      header: 'Code',
      render: (coupon: Coupon) => (
        <div>
          <p className="font-mono font-medium">{coupon.code}</p>
          <p className="text-sm text-muted-foreground">{coupon.name}</p>
        </div>
      )
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          {getDiscountTypeIcon(coupon.discount_type?.name || '')}
          <span className="font-medium">
            {coupon.discount_type?.name === 'percentage' 
              ? `${coupon.discount_value}%`
              : formatCurrency(coupon.discount_value)
            }
          </span>
        </div>
      )
    },
    {
      key: 'period',
      header: 'Period',
      render: (coupon: Coupon) => (
        <div className="text-sm">
          <p>{formatDate(coupon.start_date)}</p>
          <p className="text-muted-foreground">to {formatDate(coupon.end_date)}</p>
        </div>
      )
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (coupon: Coupon) => (
        <div className="text-sm">
          <p className="font-medium">{coupon.current_usage_count || 0} used</p>
          {coupon.usage_limit ? (
            <p className="text-muted-foreground">of {coupon.usage_limit}</p>
          ) : (
            <p className="text-muted-foreground">unlimited</p>
          )}
          {coupon.usage_limit && coupon.current_usage_count >= coupon.usage_limit && (
            <p className="text-red-500 text-xs">Limit reached</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (coupon: Coupon) => getStatusBadge(coupon)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (coupon: Coupon) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(coupon.code)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(coupon)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(coupon)}
            disabled={isMutating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Calculate stats
  const stats = {
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.is_active && new Date(p.end_date) > new Date()).length,
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter(c => c.is_active && new Date(c.end_date) > new Date()).length,
    totalPromotionUsage: promotions.reduce((sum, p) => sum + (p.current_usage_count || 0), 0),
    totalCouponUsage: coupons.reduce((sum, c) => sum + (c.current_usage_count || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Discount Management" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
              <p className="text-gray-600 mt-2">Manage promotions and coupons for your business</p>
            </div>
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              ← Back
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Promotions</p>
                  <p className="text-2xl font-semibold text-blue-600">{stats.totalPromotions}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-blue-600 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Promotions</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.activePromotions}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Coupons</p>
                  <p className="text-2xl font-semibold text-purple-600">{stats.totalCoupons}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Tag className="text-purple-600 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Coupons</p>
                  <p className="text-2xl font-semibold text-orange-600">{stats.activeCoupons}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Gift className="text-orange-600 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-semibold text-blue-600">{stats.totalPromotionUsage + stats.totalCouponUsage}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalPromotionUsage} promotions, {stats.totalCouponUsage} coupons
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="text-blue-600 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Promotions
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Coupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Promotions</CardTitle>
                    <CardDescription>
                      Manage promotional campaigns for your business
                    </CardDescription>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🌐 Business-wide view
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setActiveTab('promotions');
                      setShowCreateDialog(true);
                    }} 
                    disabled={isMutating}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Promotion
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={promotions}
                  columns={promotionColumns}
                  searchable={true}
                  title="Promotions"
                  emptyMessage="No promotions found. Create your first promotion to get started."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Coupons</CardTitle>
                    <CardDescription>
                      Manage coupon codes for your customers
                    </CardDescription>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🎫 Code-based discounts
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setActiveTab('coupons');
                      setShowCreateDialog(true);
                    }} 
                    disabled={isMutating}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={coupons}
                  columns={couponColumns}
                  searchable={true}
                  title="Coupons"
                  emptyMessage="No coupons found. Create your first coupon to get started."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? `Edit ${activeTab === 'promotions' ? 'Promotion' : 'Coupon'}` : `Create New ${activeTab === 'promotions' ? 'Promotion' : 'Coupon'}`}
              </DialogTitle>
              <DialogDescription>
                {editingItem 
                  ? `Update ${activeTab === 'promotions' ? 'promotion' : 'coupon'} details`
                  : `Set up a new ${activeTab === 'promotions' ? 'promotion for your customers' : 'coupon code for your customers'}`
                }
              </DialogDescription>
            </DialogHeader>
            <DiscountForm
              formData={formData}
              setFormData={setFormData}
              discountTypes={discountTypes}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              isEditing={!!editingItem}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {activeTab === 'promotions' ? 'promotion' : 'coupon'} and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

// Discount Form Component
const DiscountForm: React.FC<{
  formData: CreatePromotionData | CreateCouponData;
  setFormData: (data: CreatePromotionData | CreateCouponData) => void;
  discountTypes: DiscountType[];
  onSubmit: () => void;
  isEditing: boolean;
}> = ({ formData, setFormData, discountTypes, onSubmit, isEditing }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter promotion name"
          />
        </div>
        <div>
          <Label htmlFor="discount_type_id">Discount Type *</Label>
          <Select
            value={formData.discount_type_id}
            onValueChange={(value) => setFormData({ ...formData, discount_type_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent>
              {discountTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Coupon Code Field - Only show for coupons */}
      {'code' in formData && (
        <div>
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Enter a unique code that customers will use to apply this discount
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount_value">Discount Value *</Label>
          <Input
            id="discount_value"
            type="number"
            step="0.01"
            value={formData.discount_value}
            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
            placeholder="Enter discount value"
          />
        </div>
        <div>
          <Label htmlFor="minimum_purchase_amount">Minimum Purchase Amount</Label>
          <Input
            id="minimum_purchase_amount"
            type="number"
            step="0.01"
            value={formData.minimum_purchase_amount || 0}
            onChange={(e) => setFormData({ ...formData, minimum_purchase_amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="usage_limit">Usage Limit</Label>
          <Input
            id="usage_limit"
            type="number"
            value={formData.usage_limit || ''}
            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Unlimited"
          />
        </div>
        <div>
          <Label htmlFor="usage_limit_per_customer">Per Customer Limit</Label>
          <Input
            id="usage_limit_per_customer"
            type="number"
            value={formData.usage_limit_per_customer || 1}
            onChange={(e) => setFormData({ ...formData, usage_limit_per_customer: parseInt(e.target.value) || 1 })}
            placeholder="1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
};

