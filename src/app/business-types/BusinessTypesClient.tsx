'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader, 
  BusinessTypeCard, 
  FeatureCard,
  HeroSection
} from '@/components/landing';
import { BUSINESS_TYPES, getBusinessTypeConfig } from '@/components/common/BusinessTypeConstants';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Store, 
  MessageSquare
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function BusinessTypesClient() {
  const businessTypes = [
    BUSINESS_TYPES.RETAIL,
    BUSINESS_TYPES.RESTAURANT,
    BUSINESS_TYPES.PHARMACY,
    BUSINESS_TYPES.SERVICE,
    BUSINESS_TYPES.HYBRID
  ].map(type => getBusinessTypeConfig(type));

  const features = [
    {
      icon: ShoppingCart,
      title: 'Advanced Point of Sale',
      description: 'Lightning-fast POS system with barcode scanning, multiple payment methods, and real-time inventory updates.',
      benefits: ['Barcode Scanning', 'Multiple Payment Methods', 'Real-time Inventory', 'Receipt Printing'],
      category: 'Core Features'
    },
    {
      icon: Package,
      title: 'Smart Inventory Management',
      description: 'Comprehensive inventory tracking with low-stock alerts, supplier management, and expiry date monitoring.',
      benefits: ['Low Stock Alerts', 'Supplier Management', 'Expiry Tracking', 'Batch Management'],
      category: 'Core Features'
    },
    {
      icon: BarChart3,
      title: 'Business Analytics & Reporting',
      description: 'Advanced analytics with sales forecasting, profit analysis, and customizable reports for data-driven decisions.',
      benefits: ['Sales Forecasting', 'Profit Analysis', 'Custom Reports', 'Growth Insights'],
      category: 'Analytics'
    },
    {
      icon: Store,
      title: 'Multi-Store Management',
      description: 'Centralized control for multiple locations with local autonomy and unified reporting across all stores.',
      benefits: ['Multi-Location Control', 'Local Permissions', 'Unified Reporting', 'Regional Management'],
      category: 'Enterprise'
    },
    {
      icon: Users,
      title: 'Customer Relationship Management',
      description: 'Build lasting relationships with customers through comprehensive CRM, loyalty programs, and communication tools.',
      benefits: ['Customer Database', 'Loyalty Programs', 'Purchase History', 'Communication Tools'],
      category: 'CRM'
    },
    {
      icon: MessageSquare,
      title: 'Multi-Channel Communication',
      description: 'Send receipts and notifications via WhatsApp, SMS, and email with automatic delivery and tracking.',
      benefits: ['WhatsApp Integration', 'SMS Notifications', 'Email Receipts', 'Delivery Tracking'],
      category: 'Communication'
    }
  ];

  const handleGetStarted = () => {
    window.location.href = '/auth/register';
  };

  const handleStartDemo = (demoType: string) => {
    window.location.href = `/demo?type=${demoType}`;
  };

  const handleBusinessTypeSelect = (businessType: string) => {
    // Scroll to the business type details section
    const element = document.getElementById(`business-type-${businessType}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

      {/* Business Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🏢 Industry Solutions"
            title="Designed for Your Business Type"
            description="Choose your industry to see specialized features and workflows designed specifically for your type of business."
            maxWidth="3xl"
          />

          {/* Business Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {businessTypes.map((type, index) => (
              <BusinessTypeCard
                key={type.type}
                businessType={type}
                onSelect={handleBusinessTypeSelect}
                onLearnMore={handleBusinessTypeSelect}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Business Type Details */}
          {businessTypes.map((type, index) => (
            <div key={type.type} id={`business-type-${type.type}`} className="mb-16">
              <AnimatedSection animation="fadeUp" delay={index * 0.1}>
                <div className="bg-background rounded-2xl p-8 shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="text-6xl">{type.icon}</div>
                        <div>
                          <h3 className="text-3xl font-bold mb-2">{type.label}</h3>
                          <p className="text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      
                      <div className="relative rounded-lg overflow-hidden h-64 mb-6 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">{type.icon}</div>
                          <h3 className="text-xl font-semibold mb-2">
                            {type.label} Environment
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Optimized workspace for {type.label.toLowerCase()} operations
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-6">Specialized Features</h4>
                      <div className="space-y-3 mb-8">
                        {Object.entries(type.features)
                          .filter(([, value]) => value === true)
                          .map(([key], index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </div>
                          ))}
                      </div>

                      <h4 className="text-xl font-semibold mb-4">POS Features</h4>
                      <div className="space-y-3 mb-8">
                        {type.features.posFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                            <span className="capitalize">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <button 
                          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                          onClick={() => handleStartDemo('store_admin')}
                        >
                          Try {type.label} Demo
                        </button>
                        <button 
                          className="w-full border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors"
                          onClick={handleGetStarted}
                        >
                          Start Free Trial
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎯 Complete Solution"
            title="Everything Your Business Needs"
            description="From cash management to customer communication, SCIMS provides comprehensive tools designed for modern business operations across all industries."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                benefits={feature.benefits}
                category={feature.category}
                onDemoClick={handleStartDemo}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
