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
  Star,
  Calendar,
  Wrench,
  Clock,
  FileText,
  Utensils,
  ShoppingBag,
  Pill
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function HybridBusinessPage() {
  const businessType = getBusinessTypeConfig(BUSINESS_TYPES.HYBRID);

  const hybridFeatures = [
    {
      icon: Store,
      title: 'Multi-Business Management',
      description: 'Manage multiple business types from a single platform with unified operations and reporting.',
      benefits: ['Unified Dashboard', 'Cross-Business Analytics', 'Shared Resources', 'Integrated Operations'],
      category: 'Core Features'
    },
    {
      icon: ShoppingCart,
      title: 'Flexible POS System',
      description: 'Adaptable point of sale system that works for retail, restaurant, and service businesses.',
      benefits: ['Multi-Mode POS', 'Flexible Payment', 'Custom Receipts', 'Inventory Integration'],
      category: 'Core Features'
    },
    {
      icon: Package,
      title: 'Unified Inventory',
      description: 'Comprehensive inventory management across all business types with real-time tracking.',
      benefits: ['Cross-Business Inventory', 'Real-time Tracking', 'Automated Reordering', 'Multi-Location Support'],
      category: 'Inventory Management'
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Complete customer management with unified profiles across all business operations.',
      benefits: ['Unified Customer Profiles', 'Cross-Business History', 'Loyalty Programs', 'Communication Tools'],
      category: 'Customer Care'
    },
    {
      icon: BarChart3,
      title: 'Integrated Analytics',
      description: 'Comprehensive analytics and reporting across all business types and operations.',
      benefits: ['Cross-Business Reports', 'Performance Analytics', 'Trend Analysis', 'Growth Insights'],
      category: 'Analytics'
    },
    {
      icon: Settings,
      title: 'Customizable Workflows',
      description: 'Flexible workflows and processes that adapt to your unique business model.',
      benefits: ['Custom Workflows', 'Flexible Processes', 'Business Rules', 'Automation Tools'],
      category: 'Core Features'
    }
  ];

  const hybridBenefits = [
    'Manage multiple business types',
    'Unified operations dashboard',
    'Cross-business analytics',
    'Flexible POS system',
    'Shared customer database',
    'Integrated inventory management',
    'Customizable workflows',
    'Scalable business model'
  ];

  const businessTypes = [
    { icon: ShoppingBag, name: 'Retail', description: 'Product sales and inventory management' },
    { icon: Utensils, name: 'Restaurant', description: 'Food service and table management' },
    { icon: Wrench, name: 'Service', description: 'Appointment scheduling and service delivery' },
    { icon: Pill, name: 'Pharmacy', description: 'Healthcare and prescription management' }
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
                {businessType.description}. SCIMS provides the flexibility to manage multiple business types from a single platform with unified operations and reporting.
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
                  onClick={() => handleStartDemo('super_admin')}
                >
                  <Eye className="mr-2 w-5 h-5 inline" />
                  Try Hybrid Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Store className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Hybrid Dashboard</h3>
                    <p className="text-muted-foreground">Unified management for multiple business types</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Hybrid Dashboard</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time management across multiple business types and operations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🏢 Business Types"
            title="Support for Multiple Business Models"
            description="SCIMS supports various business types, allowing you to manage them all from one platform"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessTypes.map((type, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
                <p className="text-muted-foreground text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🔧 Hybrid Features"
            title="Everything You Need for Multi-Business Success"
            description="Specialized tools and features designed for businesses operating multiple models"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hybridFeatures.map((feature, index) => (
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS for Hybrid Businesses?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                SCIMS is designed for businesses that operate multiple models, providing unified management 
                and the flexibility to adapt to your unique business needs.
              </p>
              <div className="space-y-4">
                {hybridBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-6">Hybrid Success Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Operational Efficiency</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cross-Business Integration</span>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Business Growth</span>
                    <span className="text-sm text-muted-foreground">65% Increase</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Unify Your Business Operations?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join businesses already using SCIMS to manage multiple business types and streamline operations.
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
              onClick={() => handleStartDemo('super_admin')}
            >
              <Eye className="mr-2 w-5 h-5 inline" />
              Try Hybrid Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
