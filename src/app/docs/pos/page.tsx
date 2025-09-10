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
  ShoppingCart, 
  CreditCard, 
  Receipt, 
  Wifi, 
  WifiOff,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Download,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

export default function POSPage() {
  const posFeatures = [
    {
      title: 'Lightning-Fast Checkout',
      description: 'Process sales 3x faster with our optimized POS interface',
      icon: ShoppingCart,
      benefits: [
        'One-click product selection',
        'Barcode scanning support',
        'Quick customer lookup',
        'Instant receipt generation'
      ]
    },
    {
      title: 'Multiple Payment Methods',
      description: 'Accept cash, card, mobile payments, and more',
      icon: CreditCard,
      benefits: [
        'Cash payments with change calculation',
        'Card payment processing',
        'Mobile money integration',
        'Pay on delivery support'
      ]
    },
    {
      title: 'Receipt Management',
      description: 'Generate and send receipts via WhatsApp, SMS, or email',
      icon: Receipt,
      benefits: [
        'Custom receipt templates',
        'WhatsApp receipt delivery',
        'SMS notifications',
        'Email receipts'
      ]
    },
    {
      title: 'Offline Mode',
      description: 'Continue selling even without internet connection',
      icon: WifiOff,
      benefits: [
        'Works without internet',
        'Automatic sync when online',
        'No data loss',
        'Seamless experience'
      ]
    }
  ];

  const posSteps = [
    {
      step: 1,
      title: 'Access POS System',
      description: 'Navigate to the Point of Sale section from your dashboard',
      details: [
        'Click on "Point of Sale" in the main menu',
        'Select your store location',
        'Choose your cashier account',
        'The POS interface will load automatically'
      ]
    },
    {
      step: 2,
      title: 'Add Products to Cart',
      description: 'Add products to the cart using various methods',
      details: [
        'Scan product barcodes with the scanner',
        'Search for products by name or SKU',
        'Browse products by category',
        'Use the product grid for quick selection'
      ]
    },
    {
      step: 3,
      title: 'Process Payment',
      description: 'Complete the payment using your preferred method',
      details: [
        'Review the cart total and items',
        'Select payment method (Cash, Card, Mobile)',
        'Enter payment amount if paying in cash',
        'Confirm the transaction'
      ]
    },
    {
      step: 4,
      title: 'Send Receipt',
      description: 'Generate and send receipt to customer',
      details: [
        'Choose receipt delivery method',
        'Enter customer contact information',
        'Send receipt via WhatsApp, SMS, or email',
        'Print physical receipt if needed'
      ]
    }
  ];

  const paymentMethods = [
    {
      method: 'Cash',
      description: 'Traditional cash payments with automatic change calculation',
      icon: '💵',
      features: ['Change calculation', 'Cash drawer integration', 'Receipt printing']
    },
    {
      method: 'Card',
      description: 'Credit and debit card payments with secure processing',
      icon: '💳',
      features: ['Secure processing', 'Multiple card types', 'Transaction records']
    },
    {
      method: 'Mobile Money',
      description: 'Mobile payment solutions like MTN Mobile Money, Airtel Money',
      icon: '📱',
      features: ['Mobile integration', 'Instant verification', 'Digital receipts']
    },
    {
      method: 'Pay on Delivery',
      description: 'Payment upon delivery for online orders',
      icon: '🚚',
      features: ['COD support', 'Delivery tracking', 'Payment confirmation']
    }
  ];

  const handleGetStarted = () => {
    window.location.href = '/auth/register';
  };

  const handleStartDemo = () => {
    window.location.href = '/demo?type=cashier';
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
            Point of Sale
            <span className="text-primary block">
              Lightning-Fast System
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Process sales 3x faster with our advanced POS system. Accept multiple payment methods, 
            generate instant receipts, and work offline seamlessly.
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
              Try POS Demo
            </button>
          </div>
        </div>
      </section>

      {/* POS Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="⚡ POS Features"
            title="Powerful Point of Sale System"
            description="Everything you need to process sales efficiently and grow your business"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posFeatures.map((feature, index) => (
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

      {/* How to Use POS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="📋 How to Use"
            title="POS System Tutorial"
            description="Follow these simple steps to process sales with the POS system"
            maxWidth="3xl"
          />

          <div className="space-y-8">
            {posSteps.map((step, index) => (
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

      {/* Payment Methods */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💳 Payment Methods"
            title="Accept All Payment Types"
            description="Support multiple payment methods to serve all your customers"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{method.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{method.method}</h3>
                  <p className="text-muted-foreground mb-6">{method.description}</p>
                  
                  <div className="space-y-2">
                    {method.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Device Support */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📱 Device Support"
            title="Works on Any Device"
            description="Use SCIMS POS on any device - from smartphones to desktop computers"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Mobile Devices</h3>
                <p className="text-muted-foreground mb-6">
                  Use your smartphone or tablet as a portable POS terminal. Perfect for pop-up stores and mobile sales.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Touch-friendly interface</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Camera barcode scanning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Offline mode support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Tablet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Tablets</h3>
                <p className="text-muted-foreground mb-6">
                  Ideal for counter-top POS systems. Large screen for easy product browsing and customer interaction.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Large product grid</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">External barcode scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Receipt printer support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Monitor className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Desktop Computers</h3>
                <p className="text-muted-foreground mb-6">
                  Full-featured POS system on desktop computers. Perfect for busy retail environments.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Full keyboard support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Multiple monitor support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced reporting</span>
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
            title="Learn POS with Videos"
            description="Watch our step-by-step video tutorials to master the POS system"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">POS Interface Overview</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn the basics of the POS interface and navigation in 8 minutes.
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
                      <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Payment Processing</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Master payment processing with different payment methods in 10 minutes.
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
                      <Receipt className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Receipt Management</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn how to generate and send receipts via WhatsApp, SMS, and email in 6 minutes.
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
            title="Start Using POS Today"
            description="Get started with SCIMS POS system and process your first sale in minutes"
            maxWidth="2xl"
          />

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-6">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleStartDemo} size="lg" className="text-lg px-8 py-6">
              Try POS Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
