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
      title: 'Lightning-Fast POS System',
      description: 'Process sales 3x faster with barcode scanning, multiple payment methods, and instant receipt delivery. Increase daily sales by 45%.',
      demo: 'pos',
      benefits: ['3x Faster Checkout', 'Barcode Scanning', 'Multiple Payments', 'Instant Receipts'],
      category: 'Revenue Boost'
    },
    {
      icon: Globe,
      title: 'FREE Professional Website',
      description: 'Get a stunning online store worth ₦500,000 absolutely FREE! Your customers can shop 24/7, even when you\'re closed.',
      demo: 'website',
      benefits: ['Worth ₦500,000', '24/7 Online Sales', 'Mobile Optimized', 'SEO Ready'],
      category: 'FREE Bonus'
    },
    {
      icon: Package,
      title: 'Smart Inventory Control',
      description: 'Never run out of stock again! Get low-stock alerts, track expiry dates, and manage suppliers automatically. Reduce waste by 60%.',
      demo: 'inventory',
      benefits: ['60% Less Waste', 'Auto Stock Alerts', 'Expiry Tracking', 'Supplier Management'],
      category: 'Cost Savings'
    },
    {
      icon: BarChart3,
      title: 'Profit-Boosting Analytics',
      description: 'See exactly what\'s making you money with real-time reports, sales forecasting, and profit analysis. Make data-driven decisions.',
      demo: 'analytics',
      benefits: ['Real-time Reports', 'Sales Forecasting', 'Profit Analysis', 'Growth Insights'],
      category: 'Smart Decisions'
    },
    {
      icon: Store,
      title: 'Multi-Store Management',
      description: 'Manage unlimited stores from one dashboard. Perfect for growing businesses with multiple locations.',
      demo: 'stores',
      benefits: ['Unlimited Stores', 'Centralized Control', 'Unified Reporting', 'Local Autonomy'],
      category: 'Scale Up'
    },
    {
      icon: Users,
      title: 'Customer Loyalty System',
      description: 'Build lasting relationships with automated loyalty programs, purchase history, and personalized communication.',
      demo: 'customers',
      benefits: ['Loyalty Programs', 'Customer Database', 'Purchase History', 'Personalized Offers'],
      category: 'Customer Retention'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Business Integration',
      description: 'Send receipts, promotions, and updates via WhatsApp automatically. Keep customers engaged and coming back.',
      demo: 'communication',
      benefits: ['WhatsApp Receipts', 'Auto Notifications', 'Customer Engagement', 'Marketing Tools'],
      category: 'Customer Engagement'
    },
    {
      icon: TabletSmartphone,
      title: 'Works Everywhere',
      description: 'Use on any device - POS terminals, tablets, phones, computers. Works offline and syncs when online.',
      demo: 'devices',
      benefits: ['Any Device', 'Offline Mode', 'Cloud Sync', 'Always Available'],
      category: 'Flexibility'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is protected with enterprise-grade security. Sleep peacefully knowing your business is secure.',
      demo: 'security',
      benefits: ['Data Encryption', 'User Permissions', 'Audit Logs', 'Compliance Ready'],
      category: 'Peace of Mind'
    },
    {
      icon: Settings,
      title: 'Industry-Specific Setup',
      description: 'Choose your business type and get pre-configured templates for retail, restaurant, pharmacy, or service businesses.',
      demo: 'workflows',
      benefits: ['Business Templates', 'Quick Setup', 'Industry Features', 'Easy Customization'],
      category: 'Quick Start'
    },
    {
      icon: Cloud,
      title: 'Always Available',
      description: 'Your business never stops. Works offline and syncs automatically when internet returns. Never lose a sale.',
      demo: 'sync',
      benefits: ['Offline Mode', 'Auto Sync', 'Data Backup', 'Never Lose Sales'],
      category: 'Reliability'
    },
    {
      icon: Truck,
      title: 'Supply Chain Control',
      description: 'Manage suppliers, track deliveries, and control costs with complete supply chain visibility.',
      demo: 'supply',
      benefits: ['Supplier Management', 'Delivery Tracking', 'Cost Control', 'Purchase Orders'],
      category: 'Supply Management'
    }
  ];

  const featureCategories = [
    'All',
    'FREE Bonus',
    'Revenue Boost',
    'Cost Savings',
    'Smart Decisions',
    'Scale Up',
    'Customer Retention',
    'Customer Engagement',
    'Flexibility',
    'Peace of Mind',
    'Quick Start',
    'Reliability',
    'Supply Management'
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
            Everything Your Business Needs
            <span className="text-primary block">
              + FREE ₦500,000 Website
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            <strong>Stop paying for separate systems!</strong> Get complete business management (POS, inventory, analytics) 
            PLUS a professional online store that works 24/7. Everything you need to grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg shadow-lg hover:shadow-xl"
              onClick={handleGetStarted}
            >
              Get FREE Website + Start Trial
            </button>
            <button 
              className="border border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-lg"
              onClick={() => handleStartDemo('store_admin')}
            >
              See Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎁 FREE Website Included"
            title="Complete Business Solution + FREE ₦500,000 Website"
            description="Get everything your business needs in one platform - POS, inventory, analytics, CRM, AND a professional online store worth ₦500,000 absolutely FREE!"
            maxWidth="4xl"
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
