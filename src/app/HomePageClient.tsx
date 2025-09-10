'use client';

import React, { useState } from 'react';
import { 
  Navigation,
  Footer,
  HeroSection,
  SectionHeader,
  FeatureCard,
  BusinessTypeCard,
  TestimonialCard,
  PricingCard,
  AnimatedSection,
  DeviceShowcase,
  DeviceInterface,
  CommunicationShowcase
} from '@/components/landing';
import { Badge } from '@/components/ui/badge';
import { BUSINESS_TYPES, getBusinessTypeConfig } from '@/components/common/BusinessTypeConstants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  TabletSmartphone,
  Database,
  Target,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Eye,
  Star
} from 'lucide-react';

export default function HomePageClient() {
  const [selectedBusinessType, setSelectedBusinessType] = useState('retail');

  const businessTypes = [
    BUSINESS_TYPES.RETAIL,
    BUSINESS_TYPES.RESTAURANT,
    BUSINESS_TYPES.PHARMACY,
    BUSINESS_TYPES.SERVICE,
    BUSINESS_TYPES.HYBRID
  ].map(type => getBusinessTypeConfig(type));

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

  const workflows = [
    {
      step: 1,
      title: 'Choose Business Type',
      description: 'Select your business type for optimized setup',
      icon: Target,
      time: '1 minute'
    },
    {
      step: 2,
      title: 'Quick Setup',
      description: 'Get started with business-specific templates',
      icon: Rocket,
      time: '5 minutes'
    },
    {
      step: 3,
      title: 'Add Inventory',
      description: 'Import products or services with local pricing',
      icon: Database,
      time: '10 minutes'
    },
    {
      step: 4,
      title: 'Start Trading',
      description: 'Begin operations with automatic notifications',
      icon: TrendingUp,
      time: 'Instantly'
    }
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '₦15,000',
      period: '/month',
      description: 'Perfect for single shop owners',
      originalPrice: '₦65,000',
      savings: '₦50,000',
      features: [
        '🎁 FREE Professional Website (Worth ₦500,000)',
        '1 Store Location',
        'Up to 3 Staff Members',
        '500 Products/Services',
        'Basic Reporting',
        'WhatsApp Receipts',
        'SMS Integration',
        'Works Offline',
        '24/7 Online Sales'
      ],
      popular: false,
      businessTypes: ['All business types']
    },
    {
      name: 'Business',
      price: '₦35,000',
      period: '/month',
      description: 'Best for growing businesses',
      originalPrice: '₦85,000',
      savings: '₦50,000',
      features: [
        '🎁 FREE Professional Website (Worth ₦500,000)',
        '3 Store Locations',
        'Up to 15 Staff Members',
        '5,000 Products/Services',
        'Advanced Reports',
        'All Communication Channels',
        'Multi-store Management',
        'Priority Support',
        'Email Receipts',
        'Customer Database',
        'Advanced Analytics'
      ],
      popular: true,
      businessTypes: ['All business types', 'Multi-location support']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      originalPrice: '₦500,000+',
      savings: '₦500,000',
      features: [
        '🎁 FREE Professional Website (Worth ₦500,000)',
        'Unlimited Stores',
        'Unlimited Staff',
        'Unlimited Products/Services',
        'Custom Features',
        'White-label Solution',
        'Advanced Integration',
        'Dedicated Support',
        'Custom Training',
        'API Access',
        'Custom Website Design'
      ],
      popular: false,
      businessTypes: ['All business types', 'Custom integrations']
    }
  ];

  const testimonials = [
    {
      name: 'Kwame Asante',
      role: 'Electronics Store Owner',
      company: 'Asante Electronics, Accra',
      content: 'SCIMS + FREE website = Game changer! My online sales went from ₦0 to ₦2.3M monthly. The WhatsApp receipts keep customers coming back. Total revenue up 67%!',
      rating: 5,
      image: '👨‍💼',
      businessType: 'Retail'
    },
    {
      name: 'Chef Amina Hassan',
      role: 'Restaurant Owner',
      company: 'Hassan Cuisine, Lagos',
      content: 'The FREE website lets customers order online 24/7! Kitchen orders are automated, food costs down 40%, and we serve 3x more customers. Revenue doubled!',
      rating: 5,
      image: '👩‍🍳',
      businessType: 'Restaurant'
    },
    {
      name: 'Dr. Joseph Mwangi',
      role: 'Pharmacy Owner',
      company: 'Mwangi Pharmacy, Nairobi',
      content: 'Online prescription orders through our FREE website + expiry tracking = Perfect! Never waste drugs again. Customer trust increased 80%, sales up 55%.',
      rating: 5,
      image: '👨‍⚕️',
      businessType: 'Pharmacy'
    },
    {
      name: 'Fatou Diallo',
      role: 'Service Business Owner',
      company: 'Diallo Tech Services, Dakar',
      content: 'The FREE website brings in 15+ new customers weekly! Appointment booking is automated, technician tracking perfect. Business grew 200% in 6 months!',
      rating: 5,
      image: '👩‍💻',
      businessType: 'Service'
    }
  ];

  const faqs = [
    {
      question: 'Is the FREE website really worth ₦500,000?',
      answer: 'Absolutely! Our professional websites include mobile optimization, SEO setup, payment integration, inventory sync, and custom branding. Similar websites cost ₦500,000+ from web developers. You get it FREE with any SCIMS plan.'
    },
    {
      question: 'Can customers really shop 24/7 on my FREE website?',
      answer: 'Yes! Your website works 24/7, even when your physical store is closed. Customers can browse products, add to cart, and place orders anytime. You\'ll get notifications and can process orders when you\'re back.'
    },
    {
      question: 'How does the website sync with my inventory?',
      answer: 'Your website automatically syncs with your SCIMS inventory in real-time. When you sell something in-store, it updates online. When someone orders online, it updates your store inventory. Everything stays in perfect sync.'
    },
    {
      question: 'Which business types does SCIMS support?',
      answer: 'SCIMS supports retail stores, restaurants, pharmacies, service businesses, and hybrid operations. Each business type has specialized features, templates, and website designs designed for that industry.'
    },
    {
      question: 'How quickly can I set up SCIMS + my FREE website?',
      answer: 'Most businesses are running within 30 minutes! Choose your business type, and SCIMS provides industry-specific templates, local currency setup, communication integration, AND your professional website.'
    },
    {
      question: 'What payment methods work on my FREE website?',
      answer: 'Your website supports both pay-on-delivery and online payments. You can enable/disable payment methods based on your preference. Perfect for customers who prefer different payment options.'
    }
  ];

  const handleGetStarted = () => {
    window.location.href = '/auth/register';
  };

  const handleStartDemo = (demoType: string) => {
    window.location.href = `/demo?type=${demoType}`;
  };

  const handleBusinessTypeSelect = (businessType: string) => {
    setSelectedBusinessType(businessType);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onGetStarted={handleGetStarted}
        onStartDemo={handleStartDemo}
      />

      <HeroSection 
        onGetStarted={handleGetStarted}
        onStartDemo={handleStartDemo}
      />

      {/* Business Types Section */}
      <section id="business-types" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🏢 Industry Solutions"
            title="Designed for Your Business Type"
            description="Choose your industry to see specialized features and workflows designed specifically for your type of business."
            maxWidth="3xl"
          />

          {/* Business Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {businessTypes.map((type, index) => (
              <BusinessTypeCard
                key={type.type}
                businessType={type}
                isSelected={selectedBusinessType === type.type}
                onSelect={handleBusinessTypeSelect}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Selected Business Type Details */}
          <AnimatedSection animation="fadeUp" delay={0.6}>
            <div className="bg-background rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="text-6xl">
                      {businessTypes.find(t => t.type === selectedBusinessType)?.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2">
                        {businessTypes.find(t => t.type === selectedBusinessType)?.label}
                      </h3>
                      <p className="text-muted-foreground">
                        {businessTypes.find(t => t.type === selectedBusinessType)?.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative rounded-lg overflow-hidden h-64 mb-6 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">
                        {businessTypes.find(t => t.type === selectedBusinessType)?.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {businessTypes.find(t => t.type === selectedBusinessType)?.label} Environment
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Optimized workspace for {businessTypes.find(t => t.type === selectedBusinessType)?.label.toLowerCase()} operations
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-6">Specialized Features</h4>
                  <div className="space-y-3 mb-8">
                    {Object.entries(businessTypes.find(t => t.type === selectedBusinessType)?.features || {})
                      .filter(([, value]) => value === true)
                      .map(([key], index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                  </div>

                  <h4 className="text-xl font-semibold mb-4">Key Benefits</h4>
                  <div className="space-y-3">
                    {(businessTypes.find(t => t.type === selectedBusinessType)?.features.posFeatures || [])
                      .map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="capitalize">{feature}</span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-8 space-y-4">
                    <button 
                      className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                      onClick={() => handleStartDemo('store_admin')}
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      Try {businessTypes.find(t => t.type === selectedBusinessType)?.label} Demo
                    </button>
                    <button 
                      className="w-full border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors"
                      onClick={handleGetStarted}
                    >
                      Start Free Trial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Device Showcase Section */}
      <section id="devices" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📱 Universal Compatibility"
            title="Works on Every Device You Have"
            description="From POS terminals to smartphones, SCIMS adapts to your existing hardware. No need to buy new devices - start with what you already own."
            maxWidth="3xl"
          />

          <AnimatedSection animation="fadeUp" delay={0.2}>
            <DeviceShowcase />
          </AnimatedSection>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AnimatedSection animation="fadeUp" delay={0.4}>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">POS Terminal Interface</h3>
                <DeviceInterface type="pos" />
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.5}>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Mobile Phone App</h3>
                <DeviceInterface type="phone" />
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.6}>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Tablet Dashboard</h3>
                <DeviceInterface type="tablet" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Communication Showcase Section */}
      <section id="communication" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📧 Smart Receipts"
            title="Customers Get Receipts Instantly"
            description="When connected to internet, send receipts via WhatsApp, SMS, or email. Customers get a link to view their receipt online for proper record keeping."
            maxWidth="3xl"
          />

          <AnimatedSection animation="fadeUp" delay={0.2}>
            <CommunicationShowcase />
          </AnimatedSection>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎯 Complete Solution"
            title="Everything Your Business Needs"
            description="From cash management to customer communication, SCIMS provides comprehensive tools designed for modern business operations across all industries."
            maxWidth="3xl"
          />

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
          <AnimatedSection animation="fadeUp" delay={0.6} className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          </AnimatedSection>
        </div>
      </section>

      {/* FREE Website Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <AnimatedSection animation="fadeUp" delay={0.2}>
                <Badge variant="secondary" className="mb-6">
                  🎁 FREE BONUS
                </Badge>
              </AnimatedSection>
              
              <AnimatedSection animation="fadeUp" delay={0.4}>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Get Your Professional Website
                  <span className="text-primary block">
                    Worth ₦500,000 - FREE!
                  </span>
                </h2>
              </AnimatedSection>
              
              <AnimatedSection animation="fadeUp" delay={0.6}>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  <strong>Stop paying for separate website development!</strong> Every SCIMS plan includes a stunning, 
                  mobile-optimized online store that works 24/7. Your customers can shop even when you&apos;re closed.
                </p>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={0.8}>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg"><strong>Professional Design</strong> - Mobile-optimized, SEO-ready</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg"><strong>24/7 Online Sales</strong> - Never miss a customer</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg"><strong>Automatic Sync</strong> - Inventory updates in real-time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg"><strong>Payment Integration</strong> - Pay on delivery + online payments</span>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={1.0}>
                <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-lg">Real Business Impact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">45%</div>
                      <div className="text-sm text-muted-foreground">Average Sales Increase</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">₦2.3M</div>
                      <div className="text-sm text-muted-foreground">Monthly Online Revenue</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <div className="relative">
              <AnimatedSection animation="fadeUp" delay={0.6}>
                <div className="relative">
                  <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">Your FREE Website</h3>
                      <p className="text-muted-foreground">Professional online store included</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Live Online Store</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your customers can shop 24/7, even when you&apos;re closed
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="⚡ Simple Setup"
            title="Start Your Business in Minutes"
            description="Our setup process includes business templates, receipt delivery configuration, and communication channel integration tailored to your industry."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflows.map((step, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="text-center h-full">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{step.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  <div className="text-sm text-primary font-medium">{step.time}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fadeUp" delay={0.6} className="text-center mt-12">
            <button 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
              onClick={handleGetStarted}
            >
              Start Your Business Setup
              <Rocket className="ml-2 w-5 h-5 inline" />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="⭐ Success Stories"
            title="Trusted by Businesses Worldwide"
            description="See how businesses across different industries are growing with SCIMS"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💰 Simple Pricing"
            title="Plans That Grow With Your Business"
            description="Choose the perfect plan for your business type and scale. All plans include receipt delivery and work across all business types."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={index}
                tier={tier}
                onGetStarted={handleGetStarted}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>

          <AnimatedSection animation="fadeUp" delay={0.6} className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>All business types supported</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>WhatsApp, SMS & Email receipts</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>24/7 support</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="❓ FAQ"
            title="Frequently Asked Questions"
            description="Everything you need to know about SCIMS for your business type"
            maxWidth="2xl"
          />

          <AnimatedSection animation="fadeUp" delay={0.2}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join thousands of businesses already using SCIMS to streamline operations, 
              delight customers, and grow their revenue.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
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
                Try Demo First
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Industry Recognized</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Multi-Language</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
