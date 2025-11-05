'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, DollarSign, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AffiliateApplyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferred_code: '',
    why_affiliate: '',
    social_media: '',
    payment_method: '',
    payment_details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferred_code: formData.preferred_code || undefined,
          application_data: {
            why_affiliate: formData.why_affiliate,
            social_media: formData.social_media
          },
          payment_method: formData.payment_method,
          payment_details: formData.payment_details ? JSON.parse(formData.payment_details) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Application submitted successfully! We will review and get back to you soon.');
        router.push('/');
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center mb-8">
            <div className="mx-auto mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Become an Affiliate Partner</h1>
            <p className="text-muted-foreground">
              Earn commissions by referring businesses to SCIMS. Help businesses grow while you earn.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Earn Commissions</h3>
              <p className="text-sm text-muted-foreground text-center">
                Get paid when businesses you refer sign up and subscribe to SCIMS plans.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Track Performance</h3>
              <p className="text-sm text-muted-foreground text-center">
                Monitor your referrals, conversions, and commissions in real-time through your dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Help Businesses</h3>
              <p className="text-sm text-muted-foreground text-center">
                Share SCIMS with businesses and help them grow while building your income stream.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Fill out the form below to apply as an affiliate partner. We&apos;ll review your application and get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_code">Preferred Affiliate Code (Optional)</Label>
                  <Input
                    id="preferred_code"
                    value={formData.preferred_code}
                    onChange={(e) => setFormData({ ...formData, preferred_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    placeholder="MYCODE123"
                    maxLength={20}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank for auto-generation. Must be 3-20 characters, alphanumeric only.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="why_affiliate">Why do you want to become an affiliate? *</Label>
                <Textarea
                  id="why_affiliate"
                  value={formData.why_affiliate}
                  onChange={(e) => setFormData({ ...formData, why_affiliate: e.target.value })}
                  required
                  placeholder="Tell us about yourself and why you&apos;d be a great affiliate partner..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_media">Social Media Handles / Website</Label>
                <Input
                  id="social_media"
                  value={formData.social_media}
                  onChange={(e) => setFormData({ ...formData, social_media: e.target.value })}
                  placeholder="Instagram: @yourhandle, Website: yoursite.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Preferred Payment Method</Label>
                  <Input
                    id="payment_method"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    placeholder="e.g., Bank Transfer, PayPal, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_details">Payment Details (JSON)</Label>
                  <Textarea
                    id="payment_details"
                    value={formData.payment_details}
                    onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
                    placeholder='{"bank_name": "...", "account_number": "..."}'
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

