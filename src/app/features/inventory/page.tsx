'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
import { 
  Package, 
  Truck,
  CheckCircle2,
  ArrowRight,
  Eye,
  Scan,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  Warehouse
} from 'lucide-react';

export default function InventoryFeaturePage() {
  const inventoryFeatures = [
    {
      icon: Package,
      title: 'Real-Time Inventory Tracking',
      description: 'Track inventory levels in real-time across all locations with automatic updates and synchronization.',
      benefits: ['Real-time Updates', 'Multi-Location Sync', 'Automatic Deduction', 'Live Stock Levels'],
      category: 'Core Features'
    },
    {
      icon: Scan,
      title: 'Barcode Management',
      description: 'Comprehensive barcode system for product identification, tracking, and inventory management.',
      benefits: ['Barcode Generation', 'Product Identification', 'Quick Scanning', 'Batch Operations'],
      category: 'Core Features'
    },
    {
      icon: AlertTriangle,
      title: 'Low Stock Alerts',
      description: 'Automated alerts for low stock levels with customizable thresholds and notification preferences.',
      benefits: ['Custom Thresholds', 'Automated Alerts', 'Notification Preferences', 'Reorder Suggestions'],
      category: 'Automation'
    },
    {
      icon: Truck,
      title: 'Supplier Management',
      description: 'Complete supplier management with purchase orders, delivery tracking, and vendor performance analytics.',
      benefits: ['Supplier Database', 'Purchase Orders', 'Delivery Tracking', 'Performance Analytics'],
      category: 'Supply Chain'
    },
    {
      icon: TrendingDown,
      title: 'Demand Forecasting',
      description: 'AI-powered demand forecasting to optimize inventory levels and reduce stockouts or overstock.',
      benefits: ['AI Forecasting', 'Trend Analysis', 'Seasonal Adjustments', 'Optimization Recommendations'],
      category: 'Analytics'
    },
    {
      icon: RefreshCw,
      title: 'Automated Reordering',
      description: 'Smart reordering system that automatically generates purchase orders based on demand and stock levels.',
      benefits: ['Smart Reordering', 'Purchase Orders', 'Demand-Based Orders', 'Cost Optimization'],
      category: 'Automation'
    }
  ];

  const inventoryBenefits = [
    'Reduce stockouts and overstock',
    'Improve cash flow management',
    'Automate reordering processes',
    'Track inventory across locations',
    'Optimize supplier relationships',
    'Reduce manual errors',
    'Improve customer satisfaction',
    'Increase operational efficiency'
  ];

  const inventoryTypes = [
    { icon: Package, name: 'Product Inventory', description: 'Track physical products and merchandise' },
    { icon: Warehouse, name: 'Warehouse Management', description: 'Manage warehouse operations and storage' },
    { icon: Truck, name: 'Supply Chain', description: 'Track suppliers and delivery processes' }
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
              <div className="text-6xl mb-6">📦</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Inventory
                <span className="text-primary block">
                  Management
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Take control of your inventory with real-time tracking, automated reordering, and intelligent demand forecasting. Reduce costs, prevent stockouts, and optimize your supply chain.
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
                  Try Inventory Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Inventory Dashboard</h3>
                    <p className="text-muted-foreground">Complete inventory management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Inventory Tracking</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time inventory management across all locations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📦 Inventory Types"
            title="Comprehensive Inventory Management"
            description="Manage all types of inventory with specialized tools and features"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {inventoryTypes.map((type, index) => (
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
            badge="🔧 Inventory Features"
            title="Everything You Need for Inventory Control"
            description="Advanced inventory management features designed for efficiency and accuracy"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {inventoryFeatures.map((feature, index) => (
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
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS Inventory Management?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our inventory management system helps you maintain optimal stock levels, reduce costs, and improve 
                customer satisfaction through intelligent automation and real-time tracking.
              </p>
              <div className="space-y-4">
                {inventoryBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-6">Inventory Performance Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stock Accuracy</span>
                    <span className="text-sm text-muted-foreground">99.2%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.2%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cost Reduction</span>
                    <span className="text-sm text-muted-foreground">25%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stockout Reduction</span>
                    <span className="text-sm text-muted-foreground">80%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
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
            Ready to Optimize Your Inventory?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join businesses already using SCIMS to streamline inventory management and reduce costs.
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
              Try Inventory Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
