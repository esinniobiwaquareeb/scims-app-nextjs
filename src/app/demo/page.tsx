'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Store, 
  Eye, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

export default function DemoPage() {
  const searchParams = useSearchParams();
  const demoType = searchParams.get('type') || 'store_admin';
  const [selectedDemo, setSelectedDemo] = useState(demoType);

  const demoTypes = [
    {
      id: 'store_admin',
      title: 'Store Manager Demo',
      description: 'Full access including receipt settings and customer communication',
      icon: Store,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
      features: [
        'Complete store management',
        'Inventory control',
        'Staff management',
        'Customer communication',
        'Sales reporting',
        'Receipt configuration'
      ],
      duration: '15 minutes',
      difficulty: 'Beginner'
    },
    {
      id: 'cashier',
      title: 'Cashier Demo',
      description: 'Experience POS system with WhatsApp and SMS receipt delivery',
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-50 dark:bg-green-950/20',
      features: [
        'Point of sale interface',
        'Barcode scanning',
        'Payment processing',
        'Receipt printing',
        'Customer lookup',
        'Transaction history'
      ],
      duration: '10 minutes',
      difficulty: 'Beginner'
    },
    {
      id: 'business_admin',
      title: 'Business Owner Demo',
      description: 'See multi-store management and communication analytics',
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
      features: [
        'Multi-store overview',
        'Business analytics',
        'Staff management',
        'Financial reports',
        'Communication insights',
        'Business settings'
      ],
      duration: '20 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'superadmin',
      title: 'Platform Admin Demo',
      description: 'Platform-wide management and system administration',
      icon: Shield,
      color: 'text-red-600 bg-red-50 dark:bg-red-950/20',
      features: [
        'Platform overview',
        'Business management',
        'System monitoring',
        'User administration',
        'Platform analytics',
        'System configuration'
      ],
      duration: '25 minutes',
      difficulty: 'Advanced'
    }
  ];

  const demoSteps = {
    store_admin: [
      'Explore the store dashboard',
      'Add and manage products',
      'Process a sample sale',
      'Configure receipt settings',
      'View sales reports',
      'Manage staff accounts'
    ],
    cashier: [
      'Access the POS interface',
      'Scan product barcodes',
      'Process a payment',
      'Send WhatsApp receipt',
      'Handle customer returns',
      'View transaction history'
    ],
    business_admin: [
      'Review business overview',
      'Manage multiple stores',
      'Analyze business metrics',
      'Configure communication settings',
      'Review financial reports',
      'Manage business settings'
    ],
    superadmin: [
      'Access platform dashboard',
      'Manage businesses',
      'Monitor system health',
      'View platform analytics',
      'Configure system settings',
      'Manage user permissions'
    ]
  };

  const selectedDemoData = demoTypes.find(demo => demo.id === selectedDemo);
  const currentSteps = demoSteps[selectedDemo as keyof typeof demoSteps] || [];

  const handleGetStarted = () => {
    window.location.href = '/auth/register';
  };

  const handleStartDemo = (demoType: string) => {
    setSelectedDemo(demoType);
    // In a real implementation, this would redirect to the actual demo
    window.location.href = `/auth/login?demo=${demoType}`;
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
            Try SCIMS + FREE Website
            <span className="text-primary block">
              No Signup Required
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience SCIMS from different perspectives. See how the FREE ₦500,000 website works with your business management system. 
            Choose a demo role and explore all features with sample data.
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
              <Eye className="mr-2 w-5 h-5 inline" />
              Try Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Demo Types */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎯 Demo Types"
            title="Choose Your Demo Experience"
            description="Explore SCIMS from different user perspectives and see how it adapts to various roles"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoTypes.map((demo, index) => (
              <Card 
                key={demo.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedDemo === demo.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setSelectedDemo(demo.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${demo.color}`}>
                      <demo.icon className="w-8 h-8" />
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {demo.duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {demo.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{demo.title}</CardTitle>
                  <p className="text-muted-foreground">{demo.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {demo.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${selectedDemo === demo.id ? '' : 'variant-outline'}`}
                    variant={selectedDemo === demo.id ? 'default' : 'outline'}
                    onClick={() => handleStartDemo(demo.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Try {demo.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Demo Details */}
      {selectedDemoData && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">What You&apos;ll Experience</h2>
                <p className="text-muted-foreground mb-8">
                  The {selectedDemoData.title} gives you hands-on experience with real SCIMS features and sample data.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Duration: {selectedDemoData.duration}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>Difficulty: {selectedDemoData.difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span>No registration required</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <span>Works on all devices</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6">Demo Steps</h3>
                <div className="space-y-4">
                  {currentSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Demo Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="✨ Demo Features"
            title="What&apos;s Included in the Demo"
            description="Experience the full power of SCIMS + FREE website with realistic sample data"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Sample Business Data</h3>
                <p className="text-muted-foreground">
                  Explore with realistic products, customers, and transaction history
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">FREE Website Demo</h3>
                <p className="text-muted-foreground">
                  See how your FREE ₦500,000 website works with your business system
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Real Analytics</h3>
                <p className="text-muted-foreground">
                  View actual reports and analytics with sample business data
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Your FREE Website?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Try the demo first, then start your free trial to get your FREE ₦500,000 website + complete business management system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-10 py-6 rounded-lg hover:bg-primary/90 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
              onClick={() => handleStartDemo(selectedDemo)}
            >
              <Eye className="mr-2 w-5 h-5 inline" />
              Try Demo Now
            </button>
            <button 
              className="border-2 border-primary text-primary px-10 py-6 rounded-lg hover:bg-primary/10 transition-all duration-300 text-lg"
              onClick={handleGetStarted}
            >
              Get FREE Website + Start Trial
              <ArrowRight className="ml-2 w-5 h-5 inline" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
