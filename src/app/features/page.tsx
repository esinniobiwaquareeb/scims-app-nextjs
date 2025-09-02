'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader, 
  FeatureCard,
  HeroSection
} from '@/components/landing';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Store, 
  CreditCard, 
  Shield, 
  Globe, 
  TrendingUp,
  MessageSquare,
  Settings,
  Zap,
  Lock,
  Cloud,
  Activity,
  Truck,
  UserCheck,
  TabletSmartphone,
  Database
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: 'Advanced Point of Sale',
      description: 'Lightning-fast POS system with barcode scanning, multiple payment methods, and real-time inventory updates.',
      demo: 'pos',
      benefits: ['Barcode Scanning', 'Multiple Payment Methods', 'Real-time Inventory', 'Receipt Printing'],
      category: 'Core Features'
    },
    {
      icon: Package,
      title: 'Smart Inventory Management',
      description: 'Comprehensive inventory tracking with low-stock alerts, supplier management, and expiry date monitoring.',
      demo: 'inventory',
      benefits: ['Low Stock Alerts', 'Supplier Management', 'Expiry Tracking', 'Batch Management'],
      category: 'Core Features'
    },
    {
      icon: BarChart3,
      title: 'Business Analytics & Reporting',
      description: 'Advanced analytics with sales forecasting, profit analysis, and customizable reports for data-driven decisions.',
      demo: 'analytics',
      benefits: ['Sales Forecasting', 'Profit Analysis', 'Custom Reports', 'Growth Insights'],
      category: 'Analytics'
    },
    {
      icon: Store,
      title: 'Multi-Store Management',
      description: 'Centralized control for multiple locations with local autonomy and unified reporting across all stores.',
      demo: 'stores',
      benefits: ['Multi-Location Control', 'Local Permissions', 'Unified Reporting', 'Regional Management'],
      category: 'Enterprise'
    },
    {
      icon: Users,
      title: 'Customer Relationship Management',
      description: 'Build lasting relationships with customers through comprehensive CRM, loyalty programs, and communication tools.',
      demo: 'customers',
      benefits: ['Customer Database', 'Loyalty Programs', 'Purchase History', 'Communication Tools'],
      category: 'CRM'
    },
    {
      icon: MessageSquare,
      title: 'Multi-Channel Communication',
      description: 'Send receipts and notifications via WhatsApp, SMS, and email with automatic delivery and tracking.',
      demo: 'communication',
      benefits: ['WhatsApp Integration', 'SMS Notifications', 'Email Receipts', 'Delivery Tracking'],
      category: 'Communication'
    },
    {
      icon: TabletSmartphone,
      title: 'Universal Device Support',
      description: 'Works seamlessly on POS terminals, tablets, smartphones, and computers with offline capabilities.',
      demo: 'devices',
      benefits: ['POS Terminals', 'Mobile Devices', 'Offline Mode', 'Cloud Sync'],
      category: 'Technology'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with data encryption, user permissions, and compliance with industry standards.',
      demo: 'security',
      benefits: ['Data Encryption', 'User Permissions', 'Audit Logs', 'Compliance'],
      category: 'Security'
    },
    {
      icon: Settings,
      title: 'Customizable Workflows',
      description: 'Tailor SCIMS to your business needs with customizable workflows, fields, and business type configurations.',
      demo: 'workflows',
      benefits: ['Custom Fields', 'Workflow Automation', 'Business Templates', 'Flexible Configuration'],
      category: 'Customization'
    },
    {
      icon: Cloud,
      title: 'Cloud & Offline Sync',
      description: 'Seamless data synchronization between cloud and offline modes, ensuring business continuity.',
      demo: 'sync',
      benefits: ['Cloud Storage', 'Offline Mode', 'Auto Sync', 'Data Backup'],
      category: 'Technology'
    },
    {
      icon: Truck,
      title: 'Supply Chain Management',
      description: 'Complete supply chain visibility with supplier management, purchase orders, and delivery tracking.',
      demo: 'supply',
      benefits: ['Supplier Management', 'Purchase Orders', 'Delivery Tracking', 'Cost Analysis'],
      category: 'Supply Chain'
    },
    {
      icon: UserCheck,
      title: 'Staff & Role Management',
      description: 'Comprehensive staff management with role-based permissions, scheduling, and performance tracking.',
      demo: 'staff',
      benefits: ['Role Management', 'Staff Scheduling', 'Performance Tracking', 'Access Control'],
      category: 'HR Management'
    }
  ];

  const featureCategories = [
    'All',
    'Core Features',
    'Analytics',
    'Enterprise',
    'CRM',
    'Communication',
    'Technology',
    'Security',
    'Customization',
    'Supply Chain',
    'HR Management'
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
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Powerful Features for
            <span className="text-primary block">
              Every Business Need
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover the comprehensive suite of tools that make SCIMS the complete business management platform for modern enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
              onClick={handleGetStarted}
            >
              Start Free Trial
            </button>
            <button 
              className="border border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-lg"
              onClick={() => handleStartDemo('store_admin')}
            >
              Try Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎯 Complete Solution"
            title="Everything Your Business Needs"
            description="From cash management to customer communication, SCIMS provides comprehensive tools designed for modern business operations across all industries."
            maxWidth="3xl"
          />

          {/* Feature Categories */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {featureCategories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    category === 'All' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                benefits={feature.benefits}
                category={feature.category}
                demo={feature.demo}
                onDemoClick={handleStartDemo}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Optimized for speed with instant responses and real-time updates</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">Bank-level security with encryption and compliance standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Ready</h3>
              <p className="text-muted-foreground">Multi-currency, multi-language support for worldwide businesses</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
