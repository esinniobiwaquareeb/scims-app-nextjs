/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable';
import { 
  Copy, 
  LogOut,
  Building2
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
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <div className="font-semibold text-primary">
          {formatCurrency(commission.commission_amount)}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold">Affiliate Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {affiliate.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
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
            <div className="flex items-center gap-2">
              <Input value={affiliateLink} readOnly className="font-mono text-sm" />
              <Button onClick={copyAffiliateLink} size="sm">
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
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{referral.business?.name || 'Pending Signup'}</p>
                          <p className="text-sm text-muted-foreground">
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
                    <div className="text-right">
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
    </div>
  );
}

