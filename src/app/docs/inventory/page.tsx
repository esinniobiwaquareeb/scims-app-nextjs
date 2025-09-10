'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  Truck, 
  ShoppingCart, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Download,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

export default function InventoryPage() {
  const inventoryFeatures = [
    {
      title: 'Smart Stock Tracking',
      description: 'Track inventory levels in real-time with automatic updates',
      icon: Package,
      benefits: [
        'Real-time stock levels',
        'Automatic stock updates on sales',
        'Multi-location inventory tracking',
        'Barcode scanning support'
      ]
    },
    {
      title: 'Low Stock Alerts',
      description: 'Never run out of stock with intelligent alert system',
      icon: AlertTriangle,
      benefits: [
        'Customizable reorder levels',
        'Email and SMS notifications',
        'Dashboard alerts',
        'Automated reorder suggestions'
      ]
    },
    {
      title: 'Supplier Management',
      description: 'Manage suppliers and purchase orders efficiently',
      icon: Truck,
      benefits: [
        'Supplier database',
        'Purchase order creation',
        'Delivery tracking',
        'Supplier performance analytics'
      ]
    },
    {
      title: 'Inventory Analytics',
      description: 'Make data-driven decisions with comprehensive reports',
      icon: BarChart3,
      benefits: [
        'Stock movement reports',
        'Fast and slow-moving items',
        'Inventory valuation',
        'Profit margin analysis'
      ]
    }
  ];

  const inventorySteps = [
    {
      step: 1,
      title: 'Set Up Product Catalog',
      description: 'Add your products with detailed information',
      details: [
        'Go to Products section',
        'Click "Add New Product"',
        'Enter product name, SKU, and description',
        'Set price and cost',
        'Upload product images',
        'Set initial stock quantity'
      ]
    },
    {
      step: 2,
      title: 'Configure Stock Settings',
      description: 'Set up inventory tracking and alerts',
      details: [
        'Set minimum stock levels',
        'Configure reorder quantities',
        'Enable low stock alerts',
        'Set up automatic notifications',
        'Configure inventory categories'
      ]
    },
    {
      step: 3,
      title: 'Add Suppliers',
      description: 'Set up your supplier database',
      details: [
        'Go to Suppliers section',
        'Add supplier information',
        'Set contact details',
        'Configure payment terms',
        'Add supplier products'
      ]
    },
    {
      step: 4,
      title: 'Create Purchase Orders',
      description: 'Order stock from suppliers',
      details: [
        'Select supplier',
        'Add products to order',
        'Set quantities and prices',
        'Send order to supplier',
        'Track delivery status'
      ]
    },
    {
      step: 5,
      title: 'Receive Stock',
      description: 'Process incoming inventory',
      details: [
        'Receive delivery notification',
        'Check received quantities',
        'Update stock levels',
        'Process invoices',
        'Update supplier records'
      ]
    }
  ];

  const inventoryReports = [
    {
      title: 'Stock Level Report',
      description: 'View current stock levels across all products',
      icon: Package,
      features: [
        'Current stock quantities',
        'Low stock warnings',
        'Overstock alerts',
        'Stock value summary'
      ]
    },
    {
      title: 'Stock Movement Report',
      description: 'Track all inventory movements and transactions',
      icon: BarChart3,
      features: [
        'Sales transactions',
        'Purchase receipts',
        'Stock adjustments',
        'Transfer movements'
      ]
    },
    {
      title: 'Supplier Performance',
      description: 'Analyze supplier performance and reliability',
      icon: Truck,
      features: [
        'Delivery times',
        'Order accuracy',
        'Price comparisons',
        'Payment terms'
      ]
    },
    {
      title: 'Inventory Valuation',
      description: 'Calculate total inventory value and costs',
      icon: BarChart3,
      features: [
        'Total inventory value',
        'Cost of goods sold',
        'Profit margins',
        'Inventory turnover'
      ]
    }
  ];

  const handleGetStarted = () => {
    window.location.href = '/auth/register';
  };

  const handleStartDemo = () => {
    window.location.href = '/demo?type=store_admin';
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
            Inventory Management
            <span className="text-primary block">
              Smart Control System
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Take control of your inventory with smart tracking, automated alerts, and comprehensive reporting. 
            Reduce waste by 60% and never run out of stock again.
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
              onClick={handleStartDemo}
            >
              Try Inventory Demo
            </button>
          </div>
        </div>
      </section>

      {/* Inventory Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📦 Inventory Features"
            title="Smart Inventory Control"
            description="Everything you need to manage your inventory efficiently and reduce waste by 60%"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {inventoryFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground mb-6 text-lg">{feature.description}</p>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Key Benefits:</h4>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="⚙️ Setup Guide"
            title="Set Up Inventory Management in 5 Steps"
            description="Follow this guide to get your inventory system running efficiently"
            maxWidth="3xl"
          />

          <div className="space-y-8">
            {inventorySteps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-4">
                        {step.step}
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Step {step.step}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-muted-foreground mb-6 text-lg">{step.description}</p>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg mb-3">What you&apos;ll do:</h4>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Inventory Reports */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📊 Reports & Analytics"
            title="Comprehensive Inventory Reports"
            description="Make data-driven decisions with detailed inventory analytics"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {inventoryReports.map((report, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <report.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{report.title}</h3>
                      <p className="text-muted-foreground mb-6 text-lg">{report.description}</p>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Report Features:</h4>
                        <ul className="space-y-2">
                          {report.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Inventory Management Tools */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🛠️ Management Tools"
            title="Powerful Inventory Tools"
            description="Advanced tools to manage your inventory efficiently"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Product Search</h3>
                <p className="text-muted-foreground mb-6">
                  Quickly find products using barcode scanning, SKU search, or name search.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Barcode scanning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced filters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Category browsing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Filtering</h3>
                <p className="text-muted-foreground mb-6">
                  Filter products by category, stock level, supplier, and more for easy management.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Category filters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Stock level filters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Date range filters</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Bulk Operations</h3>
                <p className="text-muted-foreground mb-6">
                  Perform bulk operations on multiple products for efficient management.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Bulk price updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Mass stock adjustments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Category assignments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎥 Video Tutorials"
            title="Learn Inventory Management"
            description="Watch our step-by-step video tutorials to master inventory management"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Product Catalog Setup</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn how to set up your product catalog and manage inventory in 12 minutes.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Tutorial
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Truck className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Supplier Management</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Master supplier management and purchase orders in 15 minutes.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Tutorial
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Inventory Reports</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn how to use inventory reports and analytics in 10 minutes.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Tutorial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            badge="🚀 Ready to Start"
            title="Start Managing Your Inventory Today"
            description="Get started with SCIMS inventory management and reduce waste by 60%"
            maxWidth="2xl"
          />

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-6">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleStartDemo} size="lg" className="text-lg px-8 py-6">
              Try Inventory Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
