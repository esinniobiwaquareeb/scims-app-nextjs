'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
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
  CreditCard,
  Receipt,
  Scan,
  Smartphone,
  Monitor,
  Printer
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function POSFeaturePage() {
  const posFeatures = [
    {
      icon: ShoppingCart,
      title: 'Intuitive POS Interface',
      description: 'User-friendly point of sale interface designed for speed and efficiency in any business environment.',
      benefits: ['Quick Checkout', 'Touch-Friendly Design', 'Customizable Layout', 'Multi-Language Support'],
      category: 'Core Features'
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Secure payment processing with support for multiple payment methods and currencies.',
      benefits: ['Multiple Payment Methods', 'Secure Processing', 'Currency Support', 'Payment Analytics'],
      category: 'Payment Processing'
    },
    {
      icon: Receipt,
      title: 'Receipt Management',
      description: 'Digital and printed receipt management with customizable templates and automatic generation.',
      benefits: ['Digital Receipts', 'Custom Templates', 'Automatic Generation', 'Receipt History'],
      category: 'Core Features'
    },
    {
      icon: Scan,
      title: 'Barcode Scanning',
      description: 'Fast and accurate barcode scanning for quick product identification and checkout.',
      benefits: ['Fast Scanning', 'Product Identification', 'Inventory Integration', 'Error Prevention'],
      category: 'Core Features'
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Integrated customer management with loyalty programs and purchase history tracking.',
      benefits: ['Customer Profiles', 'Loyalty Programs', 'Purchase History', 'Customer Analytics'],
      category: 'Customer Care'
    },
    {
      icon: Package,
      title: 'Inventory Integration',
      description: 'Real-time inventory integration with automatic stock updates and low-stock alerts.',
      benefits: ['Real-time Updates', 'Stock Alerts', 'Inventory Tracking', 'Automatic Deduction'],
      category: 'Inventory Management'
    }
  ];

  const posBenefits = [
    'Faster checkout process',
    'Reduced human errors',
    'Better inventory tracking',
    'Improved customer experience',
    'Real-time sales analytics',
    'Secure payment processing',
    'Customizable interface',
    'Multi-device support'
  ];

  const deviceTypes = [
    { icon: Smartphone, name: 'Mobile POS', description: 'Use smartphones and tablets for flexible checkout' },
    { icon: Monitor, name: 'Desktop POS', description: 'Traditional desktop setup for fixed locations' },
    { icon: TabletSmartphone, name: 'Hybrid POS', description: 'Switch between mobile and desktop as needed' }
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
              <div className="text-6xl mb-6">🛒</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Point of Sale
                <span className="text-primary block">
                  (POS) System
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamline your checkout process with our intuitive POS system. Fast, secure, and designed for any business type with real-time inventory integration and comprehensive sales analytics.
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
                  onClick={() => handleStartDemo('cashier')}
                >
                  <Eye className="mr-2 w-5 h-5 inline" />
                  Try POS Demo
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
                    <h3 className="text-xl font-semibold mb-2">POS Dashboard</h3>
                    <p className="text-muted-foreground">Complete point of sale management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live POS System</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time sales processing and inventory management
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Device Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📱 Device Support"
            title="POS on Any Device"
            description="Use SCIMS POS on any device - mobile, tablet, or desktop"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deviceTypes.map((device, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <device.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{device.name}</h3>
                <p className="text-muted-foreground text-sm">{device.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🔧 POS Features"
            title="Everything You Need for Efficient Sales"
            description="Comprehensive POS features designed for speed, accuracy, and customer satisfaction"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posFeatures.map((feature, index) => (
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
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS POS?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our POS system is designed for modern businesses, providing the speed, security, and flexibility 
                you need to serve customers efficiently and grow your business.
              </p>
              <div className="space-y-4">
                {posBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-6">POS Performance Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Checkout Speed</span>
                    <span className="text-sm text-muted-foreground">3.2s avg</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Payment Success Rate</span>
                    <span className="text-sm text-muted-foreground">99.8%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.8%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-muted-foreground">4.9/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '98%' }}></div>
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
            Ready to Upgrade Your POS System?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of businesses already using SCIMS POS to streamline checkout and improve customer experience.
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
              onClick={() => handleStartDemo('cashier')}
            >
              <Eye className="mr-2 w-5 h-5 inline" />
              Try POS Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
