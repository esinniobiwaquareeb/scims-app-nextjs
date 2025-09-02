'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
import { BUSINESS_TYPES, getBusinessTypeConfig } from '@/components/common/BusinessTypeConstants';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Store, 
  Shield, 
  Globe, 
  TrendingUp,
  MessageSquare,
  Settings,
  Zap,
  Cloud,
  Truck,
  UserCheck,
  TabletSmartphone,
  Database,
  Target,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Eye,
  Star
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function RetailBusinessPage() {
  const businessType = getBusinessTypeConfig(BUSINESS_TYPES.RETAIL);

  const retailFeatures = [
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
    },
    {
      icon: Store,
      title: 'Multi-Store Management',
      description: 'Centralized control for multiple locations with local autonomy and unified reporting across all stores.',
      benefits: ['Multi-Location Control', 'Local Permissions', 'Unified Reporting', 'Regional Management'],
      category: 'Enterprise'
    }
  ];

  const retailBenefits = [
    'Track inventory in real-time',
    'Automatic low-stock alerts',
    'Fast barcode checkout',
    'Customer purchase history',
    'Multi-location support',
    'Comprehensive reporting',
    'WhatsApp receipt delivery',
    'Offline operation capability'
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
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="text-6xl mb-6">{businessType.icon}</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                {businessType.label}
                <span className="text-primary block">
                  Management Solution
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {businessType.description}. SCIMS provides specialized tools for retail operations including inventory management, customer tracking, and multi-location support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button 
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
                  onClick={handleGetStarted}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 inline" />
                </button>
                <button 
                  className="border border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-lg"
                  onClick={() => handleStartDemo('store_admin')}
                >
                  <Eye className="mr-2 w-5 h-5 inline" />
                  Try Retail Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Retail Dashboard</h3>
                    <p className="text-muted-foreground">Complete retail management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Retail Dashboard</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time inventory and sales insights for retail operations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🛍️ Retail Features"
            title="Everything You Need for Retail Success"
            description="Specialized tools and features designed specifically for retail store operations"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {retailFeatures.map((feature, index) => (
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

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS for Retail?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                SCIMS is specifically designed for retail businesses, providing all the tools you need to manage inventory, 
                process sales, and grow your customer base effectively.
              </p>
              <div className="space-y-4">
                {retailBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Retail Success Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Inventory Accuracy</span>
                    <span className="text-sm text-muted-foreground">99.5%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Checkout Speed</span>
                    <span className="text-sm text-muted-foreground">3x Faster</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-muted-foreground">4.8/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Retail Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of retail businesses already using SCIMS to streamline operations and grow their revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-10 py-6 rounded-lg hover:bg-primary/90 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
              onClick={handleGetStarted}
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5 inline" />
            </button>
            <button 
              className="border-2 border-primary text-primary px-10 py-6 rounded-lg hover:bg-primary/10 transition-all duration-300 text-lg"
              onClick={() => handleStartDemo('store_admin')}
            >
              <Eye className="mr-2 w-5 h-5 inline" />
              Try Retail Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
