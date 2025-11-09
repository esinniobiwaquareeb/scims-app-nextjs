/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/common/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  LogOut,
  Building2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useSystem } from '@/contexts/SystemContext';
import { format } from 'date-fns';
import Logo from '@/components/common/Logo';
import { getAffiliateLink } from '@/utils/affiliate/affiliateService';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliate_code: string;
  status: string;
  application_status: string;
  total_referrals: number;
  total_businesses: number;
  total_subscriptions: number;
  total_commission_earned: number;
  total_commission_paid: number;
  total_commission_pending: number;
  signup_commission_type?: 'percentage' | 'fixed';
  signup_commission_rate?: number;
  signup_commission_fixed?: number;
  subscription_commission_rate?: number;
  commission_rate?: number;
  commission_type?: 'percentage' | 'fixed';
}

interface Commission {
  id: string;
  business_id: string;
  amount: number;
  commission_amount: number;
  commission_type: 'signup' | 'subscription';
  status: string;
  created_at: string;
  currency_id?: string;
  currency?: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
  business?: {
    name: string;
    email: string;
  };
  subscription_plan?: {
    name: string;
  };
}

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const { formatCurrency } = useSystem();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    payment_method: '',
    payment_details: {} as Record<string, unknown>
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [currencies, setCurrencies] = useState<Array<{ id: string; code: string; name: string; symbol: string }>>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>('');
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    // Check if affiliate is logged in
    const affiliateData = localStorage.getItem('affiliate');
    if (!affiliateData) {
      router.push('/affiliate/login');
      return;
    }

    const parsed = JSON.parse(affiliateData);
    setAffiliate(parsed);
    loadDashboardData(parsed.id);
  }, [router]);

  const loadDashboardData = async (affiliateId: string) => {
    try {
      // Load stats
      const statsRes = await fetch(`/api/affiliates/${affiliateId}/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Load commissions
      const commissionsRes = await fetch(`/api/affiliates/commissions?affiliate_id=${affiliateId}`);
      const commissionsData = await commissionsRes.json();
      if (commissionsData.success) {
        setCommissions(commissionsData.commissions || []);
      }

      // Load referrals (to show signups)
      const referralsRes = await fetch(`/api/affiliates/referrals?affiliate_id=${affiliateId}`);
      const referralsData = await referralsRes.json();
      if (referralsData.success) {
        setReferrals(referralsData.referrals || []);
      }

      // Load profile data (Issue #6)
      const profileRes = await fetch(`/api/affiliates/profile?affiliate_id=${affiliateId}`);
      const profileDataRes = await profileRes.json();
      if (profileDataRes.success && profileDataRes.affiliate) {
        setProfileData({
          name: profileDataRes.affiliate.name || '',
          phone: profileDataRes.affiliate.phone || '',
          payment_method: profileDataRes.affiliate.payment_method || '',
          payment_details: profileDataRes.affiliate.payment_details || {}
        });
      }

      // Load currencies for commission currency editing (Issue #8)
      const currenciesRes = await fetch('/api/currencies');
      const currenciesData = await currenciesRes.json();
      if (currenciesData.success) {
        setCurrencies(currenciesData.currencies || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfileModal = () => {
    if (affiliate) {
      // Load fresh profile data
      fetch(`/api/affiliates/profile?affiliate_id=${affiliate.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.affiliate) {
            setProfileData({
              name: data.affiliate.name || '',
              phone: data.affiliate.phone || '',
              payment_method: data.affiliate.payment_method || '',
              payment_details: data.affiliate.payment_details || {}
            });
            setShowProfileModal(true);
          }
        });
    }
  };

  const handleUpdateProfile = async () => {
    if (!affiliate) return;
    setProfileLoading(true);
    try {
      const response = await fetch('/api/affiliates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: affiliate.id,
          ...profileData
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated successfully');
        setShowProfileModal(false);
        // Update local affiliate data
        const updatedAffiliate = { ...affiliate, ...data.affiliate };
        setAffiliate(updatedAffiliate);
        localStorage.setItem('affiliate', JSON.stringify(updatedAffiliate));
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenCurrencyModal = (commission: Commission) => {
    setSelectedCommission(commission);
    setSelectedCurrencyId(commission.currency_id || '');
    setShowCurrencyModal(true);
  };

  const handleUpdateCommissionCurrency = async () => {
    if (!selectedCommission) return;
    setCurrencyLoading(true);
    try {
      const response = await fetch(`/api/affiliates/commissions/${selectedCommission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency_id: selectedCurrencyId || null
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Commission currency updated successfully');
        setShowCurrencyModal(false);
        // Reload commissions
        loadDashboardData(affiliate!.id);
      } else {
        toast.error(data.error || 'Failed to update currency');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error('Failed to update currency');
    } finally {
      setCurrencyLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!affiliate) return;

    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('All fields are required');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/affiliates/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: affiliate.id,
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully');
        setShowChangePasswordModal(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('affiliate');
    router.push('/affiliate/login');
  };

  const copyAffiliateLink = () => {
    if (!affiliate) return;
    const baseUrl = window.location.origin;
    const link = getAffiliateLink(baseUrl, affiliate.affiliate_code);
    navigator.clipboard.writeText(link);
    toast.success('Affiliate link copied to clipboard!');
  };

  const commissionColumns = [
    {
      key: 'business',
      label: 'Business',
      render: (commission: Commission) => (
        <div>
          <div className="font-medium">{commission.business?.name || 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">{commission.business?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'commission_type',
      label: 'Type',
      render: (commission: Commission) => {
        const type = commission.commission_type;
        return (
          <Badge variant={type === 'signup' ? 'default' : 'secondary'}>
            {type === 'signup' ? 'Signup' : 'Subscription'}
          </Badge>
        );
      }
    },
    {
      key: 'subscription_plan',
      label: 'Plan',
      render: (commission: Commission) => commission.subscription_plan?.name || (commission.commission_type === 'signup' ? 'N/A' : 'N/A')
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (commission: Commission) => formatCurrency(commission.amount)
    },
    {
      key: 'commission_amount',
      label: 'Commission',
      render: (commission: Commission) => (
        <div>
          <div className="font-semibold text-primary">
            {formatCurrency(commission.commission_amount)}
          </div>
          {commission.currency && (
            <div className="text-xs text-muted-foreground">
              {commission.currency.code} {commission.currency.symbol}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'currency',
      label: 'Currency',
      render: (commission: Commission) => (
        <div className="flex items-center gap-2">
          {commission.currency ? (
            <>
              <Badge variant="outline">{commission.currency.code}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenCurrencyModal(commission)}
                className="h-6 text-xs"
              >
                Change
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenCurrencyModal(commission)}
              className="h-6 text-xs"
            >
              Set Currency
            </Button>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (commission: Commission) => {
        const status = commission.status;
        const variant = status === 'paid' ? 'default' : status === 'approved' ? 'default' : 'secondary';
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (commission: Commission) => format(new Date(commission.created_at), 'MMM dd, yyyy')
    }
  ];

  if (loading || !affiliate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const affiliateLink = typeof window !== 'undefined' 
    ? getAffiliateLink(window.location.origin, affiliate.affiliate_code)
    : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Logo size="sm" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Affiliate Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Welcome back, {affiliate.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handleOpenProfileModal} size="sm" className="flex-1 sm:flex-initial">
                <Settings className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm" className="flex-1 sm:flex-initial">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.referrals?.total || affiliate.total_referrals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.referrals?.converted || affiliate.total_businesses} converted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Commission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.commissions?.total_earned || affiliate.total_commission_earned)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats?.commissions?.pending || affiliate.total_commission_pending)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.commissions?.total_subscriptions || affiliate.total_subscriptions)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {stats?.referrals?.businesses || affiliate.total_businesses} businesses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Commission Rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Signup:</span>
                  <span className="text-sm font-medium">
                    {affiliate.signup_commission_type === 'fixed' 
                      ? formatCurrency(affiliate.signup_commission_fixed || 0)
                      : `${affiliate.signup_commission_rate || 0}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Subscription:</span>
                  <span className="text-sm font-medium">
                    {affiliate.subscription_commission_rate || affiliate.commission_rate || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Affiliate Link</CardTitle>
            <CardDescription>
              Share this link with businesses. When they sign up using this link, you&apos;ll earn commissions on their subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input value={affiliateLink} readOnly className="font-mono text-sm flex-1" />
              <Button onClick={copyAffiliateLink} size="sm" className="w-full sm:w-auto">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Your Affiliate Code:</p>
              <p className="text-lg font-mono font-bold">{affiliate.affiliate_code}</p>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Signups</CardTitle>
            <CardDescription>
              Businesses that signed up using your affiliate link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No referrals yet. Share your affiliate link to get started!</p>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral: any) => (
                  <div key={referral.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{referral.business?.name || 'Pending Signup'}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {referral.business?.email || referral.user_email}
                            {referral.business && (
                              <span className="ml-2">
                                • {referral.business.subscription_status === 'active' ? (
                                  <span className="text-green-600">Subscribed</span>
                                ) : (
                                  <span className="text-yellow-600">Not Subscribed</span>
                                )}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(referral.created_at), 'MMM dd, yyyy')}
                      </p>
                      {referral.converted_at && (
                        <p className="text-xs text-muted-foreground">
                          Converted: {format(new Date(referral.converted_at), 'MMM dd')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
            <CardDescription>
              Track all commissions earned from signups and subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading commissions...</p>
              </div>
            ) : (
              <DataTable
                title="Commissions"
                columns={commissionColumns as any}
                data={commissions as any}
                emptyMessage="No commissions yet. Start referring businesses to earn commissions!"
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Profile Edit Modal (Issue #6) */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and payment gateway details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="profile-payment-method">Payment Method</Label>
              <Select
                value={profileData.payment_method}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, payment_method: value }))}
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
            {profileData.payment_method === 'bank_transfer' && (
              <div className="space-y-2">
                <Label>Bank Details</Label>
                <Input
                  placeholder="Bank Name"
                  value={(profileData.payment_details as any)?.bank_name || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    payment_details: { ...prev.payment_details, bank_name: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Account Number"
                  value={(profileData.payment_details as any)?.account_number || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    payment_details: { ...prev.payment_details, account_number: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Account Name"
                  value={(profileData.payment_details as any)?.account_name || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    payment_details: { ...prev.payment_details, account_name: e.target.value }
                  }))}
                />
              </div>
            )}
            {profileData.payment_method === 'paypal' && (
              <div>
                <Label>PayPal Email</Label>
                <Input
                  type="email"
                  placeholder="paypal@example.com"
                  value={(profileData.payment_details as any)?.paypal_email || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    payment_details: { ...prev.payment_details, paypal_email: e.target.value }
                  }))}
                />
              </div>
            )}
            {profileData.payment_method === 'other' && (
              <div>
                <Label>Payment Details</Label>
                <Textarea
                  placeholder="Enter payment details"
                  value={(profileData.payment_details as any)?.other_details || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    payment_details: { ...prev.payment_details, other_details: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
            )}
            <div className="border-t pt-4 mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowProfileModal(false);
                  setShowChangePasswordModal(true);
                }}
              >
                Change Password
              </Button>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowProfileModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateProfile} disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  placeholder="Enter current password"
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={passwordLoading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="Enter new password (min 8 characters)"
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={passwordLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  placeholder="Confirm new password"
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={passwordLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowChangePasswordModal(false);
                setPasswordData({
                  current_password: '',
                  new_password: '',
                  confirm_password: ''
                });
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleChangePassword} disabled={passwordLoading}>
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Currency Edit Modal (Issue #8) */}
      <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Commission Currency</DialogTitle>
            <DialogDescription>
              Change the currency for this commission. This can only be done for pending or approved commissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCommission && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Commission Details</p>
                <p className="text-sm text-muted-foreground">
                  Business: {selectedCommission.business?.name || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(selectedCommission.commission_amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Type: {selectedCommission.commission_type}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {selectedCommission.status}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="currency-select">Currency</Label>
              <Select
                value={selectedCurrencyId}
                onValueChange={setSelectedCurrencyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Currency</SelectItem>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCurrencyModal(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleUpdateCommissionCurrency} 
                disabled={currencyLoading || (selectedCommission?.status !== 'pending' && selectedCommission?.status !== 'approved')}
              >
                {currencyLoading ? 'Updating...' : 'Update Currency'}
              </Button>
            </div>
            {selectedCommission && selectedCommission.status !== 'pending' && selectedCommission.status !== 'approved' && (
              <p className="text-sm text-destructive">
                Currency can only be changed for pending or approved commissions.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

