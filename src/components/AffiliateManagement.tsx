'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Copy, 
  Check, 
  TrendingUp, 
  Search,
  Share2,
  CheckCircle,
  XCircle,
  Trash2,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { getAffiliateLink } from '@/utils/affiliate/affiliateService';

interface Affiliate {
  id: string;
  affiliate_code: string;
  name: string;
  email?: string;
  phone?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  fixed_commission_amount?: number;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'inactive';
  application_status: 'pending' | 'approved' | 'rejected';
  payment_method?: string;
  application_data?: Record<string, unknown>;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  total_referrals: number;
  total_businesses: number;
  total_subscriptions: number;
  total_commission_earned: number;
  total_commission_paid: number;
  total_commission_pending: number;
  notes?: string;
  created_at: string;
}

interface AffiliateManagementProps {
  onBack?: () => void;
}

interface ApplicationData {
  why_affiliate?: string;
  [key: string]: unknown;
}

export const AffiliateManagement: React.FC<AffiliateManagementProps> = ({ onBack }) => {
  const { formatCurrency } = useSystem();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [affiliateToDelete, setAffiliateToDelete] = useState<{ id: string; name: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [approveFormData, setApproveFormData] = useState({
    signup_commission_type: 'percentage' as 'percentage' | 'fixed',
    signup_commission_rate: 10,
    signup_commission_fixed: 0,
    subscription_commission_rate: 10,
    set_password: false,
    password: ''
  });
  const [rejectReason, setRejectReason] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission_rate: 10,
    commission_type: 'percentage' as 'percentage' | 'fixed',
    fixed_commission_amount: 0,
    payment_method: '',
    notes: ''
  });

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(applicationFilter !== 'all' && { application_status: applicationFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/affiliates?${params}`);
      const data = await response.json();

      if (data.success) {
        setAffiliates(data.affiliates || []);
      } else {
        toast.error(data.error || 'Failed to fetch affiliates');
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast.error('Failed to fetch affiliates');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, applicationFilter, searchTerm]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const handleAddAffiliate = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    try {
      const response = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Affiliate created successfully');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          commission_rate: 10,
          commission_type: 'percentage',
          fixed_commission_amount: 0,
          payment_method: '',
          notes: ''
        });
        fetchAffiliates();
      } else {
        toast.error(data.error || 'Failed to create affiliate');
      }
    } catch (error) {
      console.error('Error creating affiliate:', error);
      toast.error('Failed to create affiliate');
    }
  };

  const handleUpdateAffiliate = async () => {
    if (!selectedAffiliate) return;

    try {
      const response = await fetch(`/api/affiliates/${selectedAffiliate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          commission_rate: formData.commission_rate,
          commission_type: formData.commission_type,
          fixed_commission_amount: formData.commission_type === 'fixed' ? formData.fixed_commission_amount : null,
          payment_method: formData.payment_method,
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Affiliate updated successfully');
        setShowEditModal(false);
        setSelectedAffiliate(null);
        fetchAffiliates();
      } else {
        toast.error(data.error || 'Failed to update affiliate');
      }
    } catch (error) {
      console.error('Error updating affiliate:', error);
      toast.error('Failed to update affiliate');
    }
  };

  const handleStatusChange = async (affiliateId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/affiliates/${affiliateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Affiliate status updated');
        fetchAffiliates();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteClick = (affiliate: Affiliate) => {
    setAffiliateToDelete({ id: affiliate.id, name: affiliate.name });
    setShowDeleteDialog(true);
  };

  const handleDeleteAffiliate = async () => {
    if (!affiliateToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/affiliates/${affiliateToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Affiliate and all associated data deleted successfully');
        fetchAffiliates();
        setShowDeleteDialog(false);
        setAffiliateToDelete(null);
      } else {
        toast.error(data.error || 'Failed to delete affiliate');
      }
    } catch (error) {
      console.error('Error deleting affiliate:', error);
      toast.error('Failed to delete affiliate');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!selectedAffiliate) return;

    if (!passwordData.password) {
      toast.error('Password is required');
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(`/api/affiliates/${selectedAffiliate.id}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordData.password })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password has been set successfully');
        setShowPasswordModal(false);
        setPasswordData({ password: '', confirmPassword: '' });
        fetchAffiliates();
      } else {
        toast.error(data.error || 'Failed to set password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Failed to set password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const openPasswordModal = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const copyAffiliateLink = (affiliate: Affiliate) => {
    const baseUrl = window.location.origin;
    const link = getAffiliateLink(baseUrl, affiliate.affiliate_code);
    
    navigator.clipboard.writeText(link);
    setCopiedCode(affiliate.affiliate_code);
    toast.success('Affiliate link copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAffiliateCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Affiliate code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openEditModal = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setFormData({
      name: affiliate.name,
      email: affiliate.email || '',
      phone: affiliate.phone || '',
      commission_rate: affiliate.commission_rate,
      commission_type: affiliate.commission_type,
      fixed_commission_amount: affiliate.fixed_commission_amount || 0,
      payment_method: affiliate.payment_method || '',
      notes: affiliate.notes || ''
    });
    setShowEditModal(true);
  };

  const openStatsModal = async (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowStatsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (affiliate: Affiliate) => (
        <div className="min-w-0">
          <p className="font-medium truncate">{affiliate.name}</p>
          {affiliate.email && (
            <p className="text-sm text-muted-foreground truncate">{affiliate.email}</p>
          )}
        </div>
      )
    },
    {
      key: 'code',
      label: 'Affiliate Code',
      render: (affiliate: Affiliate) => (
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{affiliate.affiliate_code}</code>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyAffiliateCode(affiliate.affiliate_code)}
            className="h-6 w-6 p-0"
          >
            {copiedCode === affiliate.affiliate_code ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      )
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (affiliate: Affiliate) => (
        <div>
          {affiliate.commission_type === 'percentage' ? (
            <span className="font-medium">{affiliate.commission_rate}%</span>
          ) : (
            <span className="font-medium">{formatCurrency(affiliate.fixed_commission_amount || 0)}</span>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Performance',
      render: (affiliate: Affiliate) => (
        <div className="text-sm">
          <p className="text-muted-foreground">Referrals: <span className="font-medium">{affiliate.total_referrals}</span></p>
          <p className="text-muted-foreground">Businesses: <span className="font-medium">{affiliate.total_businesses}</span></p>
          <p className="text-muted-foreground">Subscriptions: <span className="font-medium">{formatCurrency(affiliate.total_subscriptions)}</span></p>
        </div>
      )
    },
    {
      key: 'commission_earned',
      label: 'Commission',
      render: (affiliate: Affiliate) => (
        <div className="text-sm">
          <p className="font-medium text-green-600 dark:text-green-400">
            {formatCurrency(affiliate.total_commission_earned)}
          </p>
          <p className="text-xs text-muted-foreground">
            Pending: {formatCurrency(affiliate.total_commission_pending)}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (affiliate: Affiliate) => (
        <Badge className={getStatusColor(affiliate.status)}>
          {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (affiliate: Affiliate) => (
        <div className="flex items-center gap-2 min-w-[200px]">
          {affiliate.application_status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setSelectedAffiliate(affiliate);
                  setApproveFormData({
                    signup_commission_type: ((affiliate as Affiliate & { signup_commission_type?: string }).signup_commission_type || 'percentage') as 'percentage' | 'fixed',
                    signup_commission_rate: (affiliate as Affiliate & { signup_commission_rate?: number }).signup_commission_rate || 10,
                    signup_commission_fixed: (affiliate as Affiliate & { signup_commission_fixed?: number }).signup_commission_fixed || 0,
                    subscription_commission_rate: (affiliate as Affiliate & { subscription_commission_rate?: number }).subscription_commission_rate || affiliate.commission_rate || 10,
                    set_password: false,
                    password: ''
                  });
                  setShowApproveModal(true);
                }}
                className="h-8 text-xs"
                title="Approve Application"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedAffiliate(affiliate);
                  setRejectReason('');
                  setShowRejectModal(true);
                }}
                className="h-8 text-xs"
                title="Reject Application"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </>
          )}
          {affiliate.application_status === 'rejected' && (
            <div className="flex flex-col gap-1">
              <Badge variant="destructive" className="text-xs">
                Rejected
              </Badge>
              {affiliate.rejection_reason && (
                <p className="text-xs text-muted-foreground max-w-[150px] truncate" title={affiliate.rejection_reason}>
                  {affiliate.rejection_reason}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Can reapply via application form
              </p>
            </div>
          )}
          {affiliate.application_status === 'approved' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openStatsModal(affiliate)}
                className="h-8 w-8 p-0"
                title="View Stats"
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyAffiliateLink(affiliate)}
                className="h-8 w-8 p-0"
                title="Copy Affiliate Link"
              >
                {copiedCode === affiliate.affiliate_code ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openPasswordModal(affiliate)}
                className="h-8 w-8 p-0"
                title="Set Password"
              >
                <Key className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditModal(affiliate)}
                className="h-8 w-8 p-0"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteClick(affiliate)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete Affiliate"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout
      title="Affiliate Management"
      subtitle="Manage your affiliate partners and track their performance"
      headerActions={
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Affiliate
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search affiliates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Affiliates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliates ({affiliates.length})</CardTitle>
            <CardDescription>
              Manage your affiliate partners and track their referrals and commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading affiliates...</p>
              </div>
            ) : (
              <DataTable
                data={affiliates}
                columns={columns}
                searchable={false}
                title="Affiliates"
              />
            )}
          </CardContent>
        </Card>

        {/* Add Affiliate Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Affiliate</DialogTitle>
              <DialogDescription>
                Add a new affiliate partner to help promote your business
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commission Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.commission_type}
                    onValueChange={(value: string) => 
                      setFormData({ ...formData, commission_type: value as 'percentage' | 'fixed' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    {formData.commission_type === 'percentage' ? 'Commission Rate (%)' : 'Fixed Amount'} 
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step={formData.commission_type === 'percentage' ? '0.01' : '0.01'}
                    min="0"
                    max={formData.commission_type === 'percentage' ? '100' : undefined}
                    value={formData.commission_type === 'percentage' ? formData.commission_rate : formData.fixed_commission_amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (formData.commission_type === 'percentage') {
                        setFormData({ ...formData, commission_rate: value });
                      } else {
                        setFormData({ ...formData, fixed_commission_amount: value });
                      }
                    }}
                    placeholder={formData.commission_type === 'percentage' ? '10.00' : '0.00'}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this affiliate..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAffiliate}>
                  Create Affiliate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Affiliate Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Affiliate</DialogTitle>
              <DialogDescription>
                Update affiliate information and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commission Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.commission_type}
                    onValueChange={(value: string) => 
                      setFormData({ ...formData, commission_type: value as 'percentage' | 'fixed' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    {formData.commission_type === 'percentage' ? 'Commission Rate (%)' : 'Fixed Amount'} 
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step={formData.commission_type === 'percentage' ? '0.01' : '0.01'}
                    min="0"
                    max={formData.commission_type === 'percentage' ? '100' : undefined}
                    value={formData.commission_type === 'percentage' ? formData.commission_rate : formData.fixed_commission_amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (formData.commission_type === 'percentage') {
                        setFormData({ ...formData, commission_rate: value });
                      } else {
                        setFormData({ ...formData, fixed_commission_amount: value });
                      }
                    }}
                    required
                  />
                </div>
              </div>
              {selectedAffiliate && (
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedAffiliate.status}
                    onValueChange={(value) => handleStatusChange(selectedAffiliate.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAffiliate}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Modal */}
        {selectedAffiliate && (
          <AffiliateStatsModal
            open={showStatsModal}
            onOpenChange={setShowStatsModal}
            affiliate={selectedAffiliate}
          />
        )}

        {/* Approve Modal */}
        <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Approve Affiliate Application</DialogTitle>
              <DialogDescription>
                Set commission rate and optionally set a password for the affiliate to login.
              </DialogDescription>
            </DialogHeader>
            {selectedAffiliate && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedAffiliate.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAffiliate.email}</p>
                  {selectedAffiliate.application_data && typeof selectedAffiliate.application_data === 'object' && 'why_affiliate' in selectedAffiliate.application_data && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Application Reason:</p>
                      <p className="text-xs text-muted-foreground">{(selectedAffiliate.application_data as ApplicationData).why_affiliate}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Signup Commission</Label>
                    <div className="space-y-2">
                      <Label>Commission Type</Label>
                      <Select
                        value={approveFormData.signup_commission_type}
                        onValueChange={(value: string) =>
                          setApproveFormData({ ...approveFormData, signup_commission_type: value as 'percentage' | 'fixed' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {approveFormData.signup_commission_type === 'percentage' ? (
                      <div className="space-y-2 mt-2">
                        <Label>Commission Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={approveFormData.signup_commission_rate}
                          onChange={(e) =>
                            setApproveFormData({ ...approveFormData, signup_commission_rate: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <Label>Fixed Commission Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          value={approveFormData.signup_commission_fixed}
                          onChange={(e) =>
                            setApproveFormData({ ...approveFormData, signup_commission_fixed: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">Subscription Commission</Label>
                    <div className="space-y-2">
                      <Label>Commission Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={approveFormData.subscription_commission_rate}
                        onChange={(e) =>
                          setApproveFormData({ ...approveFormData, subscription_commission_rate: parseFloat(e.target.value) || 0 })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage commission on all subscription payments from referred businesses
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="set_password"
                      checked={approveFormData.set_password}
                      onChange={(e) =>
                        setApproveFormData({ ...approveFormData, set_password: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="set_password" className="cursor-pointer">
                      Set password for affiliate login
                    </Label>
                  </div>
                  {approveFormData.set_password && (
                    <Input
                      type="password"
                      placeholder="Enter password (min 8 characters)"
                      value={approveFormData.password}
                      onChange={(e) =>
                        setApproveFormData({ ...approveFormData, password: e.target.value })
                      }
                      minLength={8}
                    />
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (approveFormData.set_password && approveFormData.password.length < 8) {
                        toast.error('Password must be at least 8 characters');
                        return;
                      }
                      try {
                        const response = await fetch(`/api/affiliates/${selectedAffiliate.id}/approve`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...approveFormData
                          })
                        });
                        const data = await response.json();
                        if (data.success) {
                          toast.success('Affiliate approved successfully');
                          setShowApproveModal(false);
                          fetchAffiliates();
                        } else {
                          toast.error(data.error || 'Failed to approve affiliate');
                        }
                      } catch (error) {
                        console.error('Error approving affiliate:', error);
                        toast.error('Failed to approve affiliate');
                      }
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reject Affiliate Application</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this application (optional).
              </DialogDescription>
            </DialogHeader>
            {selectedAffiliate && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedAffiliate.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAffiliate.email}</p>
                </div>

                <div className="space-y-2">
                  <Label>Rejection Reason (Optional)</Label>
                  <Textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/affiliates/${selectedAffiliate.id}/approve`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            rejection_reason: rejectReason
                          })
                        });
                        const data = await response.json();
                        if (data.success) {
                          toast.success('Affiliate application rejected');
                          setShowRejectModal(false);
                          setRejectReason('');
                          fetchAffiliates();
                        } else {
                          toast.error(data.error || 'Failed to reject affiliate');
                        }
                      } catch (error) {
                        console.error('Error rejecting affiliate:', error);
                        toast.error('Failed to reject affiliate');
                      }
                    }}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Delete Affiliate</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Are you sure you want to permanently delete <strong>&quot;{affiliateToDelete?.name}&quot;</strong>?
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-sm text-destructive">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>The affiliate account</li>
                    <li>All referrals</li>
                    <li>All commissions</li>
                    <li>All payouts</li>
                  </ul>
                </div>
                <p className="font-semibold text-destructive">
                  ⚠️ This action cannot be undone!
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setAffiliateToDelete(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAffiliate}
                disabled={deleteLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Permanently'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Set Password Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Set Affiliate Password</DialogTitle>
              <DialogDescription>
                Set or reset the password for {selectedAffiliate?.name || 'this affiliate'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">New Password <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    placeholder="Enter new password (min 8 characters)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ password: '', confirmPassword: '' });
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  disabled={passwordLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSetPassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Setting...
                    </div>
                  ) : (
                    'Set Password'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Affiliate Stats Modal Component
interface AffiliateStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliate: Affiliate;
}

interface CommissionData {
  id: string;
  business?: { name?: string };
  subscription_plan?: { name?: string };
  commission_amount: number;
  amount: number;
  subscription_amount?: number;
  status: string;
  created_at: string;
}

interface AffiliateStatsModalData {
  referrals: {
    total: number;
    pending: number;
    converted: number;
    expired: number;
    businesses: number;
    conversion_rate: string;
  };
  commissions: {
    total_earned: number;
    signup_commissions: number;
    subscription_commissions: number;
    total_subscriptions: number;
    pending: number;
    approved: number;
    paid: number;
    cancelled: number;
  };
  subscriptions: {
    total_revenue: number;
    total_payments: number;
    average_subscription_value: string;
  };
}

const AffiliateStatsModal: React.FC<AffiliateStatsModalProps> = ({ open, onOpenChange, affiliate }) => {
  const { formatCurrency } = useSystem();
  const [stats, setStats] = useState<AffiliateStatsModalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, commissionsResponse] = await Promise.all([
        fetch(`/api/affiliates/${affiliate.id}/stats`),
        fetch(`/api/affiliates/commissions?affiliate_id=${affiliate.id}&status=all`)
      ]);

      const statsData = await statsResponse.json();
      const commissionsData = await commissionsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (commissionsData.success) {
        setCommissions(commissionsData.commissions || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [affiliate.id]);

  useEffect(() => {
    if (open && affiliate.id) {
      fetchStats();
    }
  }, [open, affiliate.id, fetchStats]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const affiliateLink = getAffiliateLink(baseUrl, affiliate.affiliate_code);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{affiliate.name} - Performance Stats</DialogTitle>
          <DialogDescription>
            Detailed performance metrics and commission history
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Affiliate Link */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Affiliate Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input value={affiliateLink} readOnly className="font-mono text-sm" />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(affiliateLink);
                      toast.success('Link copied!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Share this link with your affiliate to track referrals
                </p>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{stats.referrals?.total || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Referrals</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.commissions?.total_earned || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Commission</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.commissions?.total_subscriptions || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(stats.commissions?.pending || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {stats.referrals?.conversion_rate || '0.00'}%
                      </p>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Commissions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No commissions yet</p>
                ) : (
                  <div className="space-y-2">
                    {commissions.slice(0, 10).map((commission) => (
                      <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{commission.business?.name || 'Unknown Business'}</p>
                          <p className="text-sm text-muted-foreground">
                            {commission.subscription_plan?.name || 'Subscription'} • {new Date(commission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(commission.commission_amount)}</p>
                          <p className="text-xs text-muted-foreground">From {formatCurrency(commission.amount || commission.subscription_amount || 0)}</p>
                          <Badge variant="outline" className="mt-1">{commission.status}</Badge>
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
  );
};

