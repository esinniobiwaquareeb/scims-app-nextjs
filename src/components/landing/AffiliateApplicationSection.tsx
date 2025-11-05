'use client';

import React from 'react';
import { SectionHeader, AnimatedSection } from '@/components/landing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const AffiliateApplicationSection: React.FC = () => {
  return (
    <>
      <section id="affiliate" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💼 Earn Money"
            title="Become an Affiliate Partner"
            description="Earn commissions by referring businesses to SCIMS. Help businesses grow while you earn."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
            <AnimatedSection animation="fadeUp" delay={0.1}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Earn Commissions</h3>
                  <p className="text-muted-foreground">
                    Get paid when businesses you refer sign up and subscribe to SCIMS plans.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.2}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Track Performance</h3>
                  <p className="text-muted-foreground">
                    Monitor your referrals, conversions, and commissions in real-time through your dashboard.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.3}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Help Businesses</h3>
                  <p className="text-muted-foreground">
                    Share SCIMS with businesses and help them grow while building your income stream.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          <AnimatedSection animation="fadeUp" delay={0.4} className="text-center mt-12">
            <Link href="/affiliate/apply">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Apply to Become an Affiliate
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Quick approval process • Competitive commission rates • Regular payouts
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

