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
  Globe, 
  ShoppingCart, 
  CreditCard, 
  Smartphone, 
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Download,
  ExternalLink,
  Palette,
  Settings,
  BarChart3,
  Users,
  Package
} from 'lucide-react';

export default function WebsitePage() {
  const websiteFeatures = [
    {
      title: 'Professional Design',
      description: 'Get a stunning, mobile-responsive website worth ₦500,000 absolutely FREE',
      icon: Palette,
      benefits: [
        'Modern, professional design',
        'Mobile-responsive layout',
        'Customizable colors and branding',
        'SEO-optimized structure'
      ]
    },
    {
      title: 'Online Store Integration',
      description: 'Sell products online with automatic sync from your POS system',
      icon: ShoppingCart,
      benefits: [
        'Automatic product sync',
        'Real-time inventory updates',
        'Shopping cart functionality',
        'Order management system'
      ]
    },
    {
      title: 'Payment Integration',
      description: 'Accept payments online with multiple payment methods',
      icon: CreditCard,
      benefits: [
        'Pay on delivery option',
        'Online payment processing',
        'Secure payment gateway',
        'Multiple currency support'
      ]
    },
    {
      title: 'Mobile Optimization',
      description: 'Perfect experience on all devices - mobile, tablet, and desktop',
      icon: Smartphone,
      benefits: [
        'Mobile-first design',
        'Touch-friendly interface',
        'Fast loading speeds',
        'Offline functionality'
      ]
    }
  ];

  const setupSteps = [
    {
      step: 1,
      title: 'Enable Your Website',
      description: 'Activate your FREE website from the business settings',
      details: [
        'Go to Business Settings > Store Tab',
        'Toggle "Enable Public Store" to ON',
        'Your website URL will be generated automatically',
        'Copy the URL to share with customers'
      ]
    },
    {
      step: 2,
      title: 'Customize Design',
      description: 'Personalize your website with your branding',
      details: [
        'Upload your business logo',
        'Set your brand colors',
        'Add a store banner image',
        'Write your store description'
      ]
    },
    {
      step: 3,
      title: 'Configure Products',
      description: 'Make your products available for online purchase',
      details: [
        'Go to Products section',
        'Edit each product you want to sell online',
        'Toggle "Make Public" to ON',
        'Add product descriptions and images'
      ]
    },
    {
      step: 4,
      title: 'Set Up Payments',
      description: 'Configure payment methods for online orders',
      details: [
        'Enable Pay on Delivery option',
        'Set up online payment processing',
        'Configure payment instructions',
        'Test payment flow'
      ]
    },
    {
      step: 5,
      title: 'Go Live',
      description: 'Launch your website and start receiving online orders',
      details: [
        'Share your website URL with customers',
        'Add website link to your social media',
        'Monitor incoming orders',
        'Process orders through your POS system'
      ]
    }
  ];

  const websiteBenefits = [
    {
      title: '24/7 Online Sales',
      description: 'Your customers can shop anytime, anywhere',
      icon: Clock,
      stats: 'Increase sales by 40%'
    },
    {
      title: 'Professional Image',
      description: 'Build trust with a professional online presence',
      icon: Star,
      stats: 'Worth ₦500,000 FREE'
    },
    {
      title: 'Mobile Commerce',
      description: 'Tap into the growing mobile shopping trend',
      icon: Smartphone,
      stats: '60% of customers shop on mobile'
    },
    {
      title: 'SEO Optimized',
      description: 'Get found on Google and other search engines',
      icon: Search,
      stats: 'Better search rankings'
    }
  ];

  const orderManagement = [
    {
      title: 'Order Notifications',
      description: 'Get instant notifications when customers place orders',
      features: [
        'WhatsApp notifications',
        'Email alerts',
        'In-app notifications',
        'SMS notifications'
      ]
    },
    {
      title: 'Order Processing',
      description: 'Manage orders directly from your SCIMS dashboard',
      features: [
        'View order details',
        'Update order status',
        'Process payments',
        'Generate invoices'
      ]
    },
    {
      title: 'Customer Communication',
      description: 'Communicate with customers about their orders',
      features: [
        'Order confirmation messages',
        'Status update notifications',
        'Delivery confirmations',
        'Customer support'
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
            FREE Website Management
            <span className="text-primary block">
              Worth ₦500,000
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Get a professional, mobile-responsive website worth ₦500,000 absolutely FREE with SCIMS. 
            Sell online 24/7, accept payments, and grow your business beyond your physical store.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
              onClick={handleGetStarted}
            >
              Get FREE Website
            </button>
            <button 
              className="border border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-lg"
              onClick={handleStartDemo}
            >
              See Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Website Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🌐 Website Features"
            title="Professional Website Worth ₦500,000 - FREE"
            description="Everything you need for a successful online presence, included at no extra cost"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {websiteFeatures.map((feature, index) => (
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
                        <h4 className="font-semibold">Key Features:</h4>
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
            title="Get Your Website Live in 5 Steps"
            description="Follow this simple guide to set up your FREE ₦500,000 website"
            maxWidth="3xl"
          />

          <div className="space-y-8">
            {setupSteps.map((step, index) => (
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

      {/* Website Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📈 Business Impact"
            title="Grow Your Business with Your FREE Website"
            description="See how your FREE ₦500,000 website can transform your business"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {websiteBenefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground mb-4">{benefit.description}</p>
                  <Badge variant="secondary" className="text-sm">
                    {benefit.stats}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Order Management */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📦 Order Management"
            title="Handle Online Orders Seamlessly"
            description="Manage online orders directly from your SCIMS dashboard"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {orderManagement.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Features:</h4>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
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
            title="Learn Website Management"
            description="Watch our comprehensive video tutorials to master your FREE website"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h3 className="text-lg font-semibold mb-2">Website Setup Guide</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn how to set up your FREE ₦500,000 website in 15 minutes.
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
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Product Sync Tutorial</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Master product synchronization between POS and website in 10 minutes.
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
                      <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Order Management</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn how to manage online orders and customer communication in 12 minutes.
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
            badge="🎁 FREE Website"
            title="Get Your FREE ₦500,000 Website Today"
            description="Start your free trial and get your professional website included at no extra cost"
            maxWidth="2xl"
          />

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-6">
              Get FREE Website
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleStartDemo} size="lg" className="text-lg px-8 py-6">
              See Live Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
