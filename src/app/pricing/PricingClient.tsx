'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader, 
  PricingCard,
  HeroSection
} from '@/components/landing';
import { CheckCircle2 } from 'lucide-react';

export default function PricingClient() {
  const pricingTiers = [
    {
      name: 'Starter',
      price: '₦15,000',
      period: '/month',
      description: 'Perfect for single shop owners',
      features: [
        '1 Store Location',
        'Up to 3 Staff Members',
        '500 Products/Services',
        'Basic Reporting',
        'WhatsApp Receipts',
        'SMS Integration',
        'Works Offline'
      ],
      popular: false,
      businessTypes: ['All business types']
    },
    {
      name: 'Business',
      price: '₦35,000',
      period: '/month',
      description: 'Best for growing businesses',
      features: [
        '3 Store Locations',
        'Up to 15 Staff Members',
        '5,000 Products/Services',
        'Advanced Reports',
        'All Communication Channels',
        'Multi-store Management',
        'Priority Support',
        'Email Receipts',
        'Customer Database'
      ],
      popular: true,
      businessTypes: ['All business types', 'Multi-location support']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited Stores',
        'Unlimited Staff',
        'Unlimited Products/Services',
        'Custom Features',
        'White-label Solution',
        'Advanced Integration',
        'Dedicated Support',
        'Custom Training',
        'API Access'
      ],
      popular: false,
      businessTypes: ['All business types', 'Custom integrations']
    }
  ];

  const handleGetStarted = () => {
    window.location.href = '/auth/register';
  };

  const handleStartDemo = (demoType: string) => {
    window.location.href = `/demo?type=${demoType}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onGetStarted={handleGetStarted}
        onStartDemo={handleStartDemo}
      />

      {/* Hero Section */}
      <HeroSection 
        onGetStarted={handleGetStarted}
        onStartDemo={handleStartDemo}
      />

      {/* Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💰 Simple Pricing"
            title="Plans That Grow With Your Business"
            description="Choose the perfect plan for your business type and scale. All plans include receipt delivery and work across all business types."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={index}
                tier={tier}
                onGetStarted={handleGetStarted}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>All business types supported</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>WhatsApp, SMS & Email receipts</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
