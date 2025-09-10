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
  BookOpen, 
  Globe, 
  Store, 
  Package, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Download,
  ExternalLink
} from 'lucide-react';

export default function GettingStartedPage() {
  const quickStartSteps = [
    {
      step: 1,
      title: 'Create Your Account',
      description: 'Sign up for a free trial and get your FREE ₦500,000 website instantly',
      duration: '2 minutes',
      icon: BookOpen,
      details: [
        'Visit the registration page',
        'Choose your business type (Retail, Restaurant, Pharmacy, Service, or Hybrid)',
        'Enter your business details',
        'Verify your email address',
        'Get instant access to your FREE website'
      ]
    },
    {
      step: 2,
      title: 'Set Up Your FREE Website',
      description: 'Configure your professional website worth ₦500,000 absolutely FREE',
      duration: '5 minutes',
      icon: Globe,
      details: [
        'Customize your website design and colors',
        'Upload your business logo and banner',
        'Set up your business information',
        'Configure payment methods (Pay on Delivery, Online Payment)',
        'Enable your website to go live'
      ]
    },
    {
      step: 3,
      title: 'Configure Your Store',
      description: 'Set up your physical store settings and preferences',
      duration: '3 minutes',
      icon: Store,
      details: [
        'Enter store name and address',
        'Set your currency and language',
        'Configure tax settings',
        'Set up receipt templates',
        'Enable WhatsApp notifications'
      ]
    },
    {
      step: 4,
      title: 'Add Your Products',
      description: 'Import or add your product catalog to start selling',
      duration: '10 minutes',
      icon: Package,
      details: [
        'Add products manually or import from CSV',
        'Set product prices and descriptions',
        'Upload product images',
        'Configure inventory tracking',
        'Set low stock alerts'
      ]
    },
    {
      step: 5,
      title: 'Set Up Staff Accounts',
      description: 'Create accounts for your team members with appropriate permissions',
      duration: '5 minutes',
      icon: Users,
      details: [
        'Create staff accounts',
        'Assign roles (Cashier, Store Admin, Business Admin)',
        'Set permissions for each role',
        'Train staff on POS system',
        'Enable notifications for staff'
      ]
    }
  ];

  const businessTypes = [
    {
      type: 'Retail Store',
      description: 'Perfect for clothing, electronics, groceries, and general retail',
      features: ['Barcode scanning', 'Inventory tracking', 'Customer management', 'Sales reports'],
      setupTime: '15 minutes'
    },
    {
      type: 'Restaurant',
      description: 'Ideal for restaurants, cafes, and food service businesses',
      features: ['Menu management', 'Table orders', 'Kitchen display', 'Recipe tracking'],
      setupTime: '20 minutes'
    },
    {
      type: 'Pharmacy',
      description: 'Designed for pharmacies and medical supply stores',
      features: ['Drug inventory', 'Expiry tracking', 'Prescription management', 'Compliance reports'],
      setupTime: '25 minutes'
    },
    {
      type: 'Service Business',
      description: 'Perfect for salons, repair shops, and service providers',
      features: ['Appointment booking', 'Service catalog', 'Customer history', 'Technician tracking'],
      setupTime: '18 minutes'
    },
    {
      type: 'Hybrid Business',
      description: 'Combines multiple business types in one system',
      features: ['All features', 'Flexible configuration', 'Multi-category support', 'Custom workflows'],
      setupTime: '30 minutes'
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
            Getting Started with
            <span className="text-primary block">
              SCIMS + FREE Website
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Get your business up and running in just 25 minutes with our FREE ₦500,000 professional website included. 
            Follow this comprehensive guide to set up everything you need.
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
              Try Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Quick Start Steps */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="🚀 Quick Start"
            title="Get Started in 25 Minutes"
            description="Follow these 5 simple steps to get your business running with SCIMS and your FREE website"
            maxWidth="3xl"
          />

          <div className="space-y-8">
            {quickStartSteps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <step.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-sm">
                          Step {step.step}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.duration}
                        </Badge>
                      </div>
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

      {/* Business Types */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🏢 Business Types"
            title="Choose Your Business Type"
            description="SCIMS is designed for different types of businesses. Select your type to see specialized setup instructions."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessTypes.map((business, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{business.type}</CardTitle>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {business.setupTime}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{business.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Key Features:</h4>
                    <ul className="space-y-2">
                      {business.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full mt-4">
                      View Setup Guide
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎥 Video Tutorials"
            title="Watch and Learn"
            description="Follow along with our step-by-step video tutorials to get the most out of SCIMS"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Download className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Complete Setup Guide</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Watch our comprehensive 15-minute setup guide covering everything from account creation to first sale.
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
                      <Globe className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">FREE Website Setup</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn how to configure your FREE ₦500,000 professional website in just 10 minutes.
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
                      <Store className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">POS System Tutorial</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Master the Point of Sale system with our detailed 12-minute tutorial.
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

      {/* Next Steps */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            badge="🎯 Next Steps"
            title="Ready to Get Started?"
            description="You now have everything you need to set up SCIMS and your FREE website. Choose your next step:"
            maxWidth="2xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Start Your Free Trial</h3>
                <p className="text-muted-foreground mb-6">
                  Create your account and get instant access to SCIMS plus your FREE ₦500,000 website.
                </p>
                <Button onClick={handleGetStarted} className="w-full">
                  Get Started Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Try Live Demo</h3>
                <p className="text-muted-foreground mb-6">
                  Experience SCIMS with sample data before creating your account.
                </p>
                <Button variant="outline" onClick={handleStartDemo} className="w-full">
                  Try Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
