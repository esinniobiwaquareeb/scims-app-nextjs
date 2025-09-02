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
  StatsGrid,
  AnimatedSection,
  DeviceShowcase,
  DeviceInterface,
  CommunicationShowcase
} from '@/components/landing';
import { BUSINESS_TYPES, getBusinessTypeConfig } from '@/components/common/BusinessTypeConstants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  Database,
  Target,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Eye,
  MousePointer,
  Star
} from 'lucide-react';

export default function HomePage() {
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
      title: 'Advanced Point of Sale',
      description: 'Lightning-fast POS system with barcode scanning, multiple payment methods, and real-time inventory updates.',
      demo: 'pos',
      benefits: ['Barcode Scanning', 'Multiple Payment Methods', 'Real-time Inventory', 'Receipt Printing'],
      category: 'Core Features'
    },
    {
      icon: Package,
      title: 'Smart Inventory Management',
      description: 'Comprehensive inventory tracking with low-stock alerts, supplier management, and expiry date monitoring.',
      demo: 'inventory',
      benefits: ['Low Stock Alerts', 'Supplier Management', 'Expiry Tracking', 'Batch Management'],
      category: 'Core Features'
    },
    {
      icon: BarChart3,
      title: 'Business Analytics & Reporting',
      description: 'Advanced analytics with sales forecasting, profit analysis, and customizable reports for data-driven decisions.',
      demo: 'analytics',
      benefits: ['Sales Forecasting', 'Profit Analysis', 'Custom Reports', 'Growth Insights'],
      category: 'Analytics'
    },
    {
      icon: Store,
      title: 'Multi-Store Management',
      description: 'Centralized control for multiple locations with local autonomy and unified reporting across all stores.',
      demo: 'stores',
      benefits: ['Multi-Location Control', 'Local Permissions', 'Unified Reporting', 'Regional Management'],
      category: 'Enterprise'
    },
    {
      icon: Users,
      title: 'Customer Relationship Management',
      description: 'Build lasting relationships with customers through comprehensive CRM, loyalty programs, and communication tools.',
      demo: 'customers',
      benefits: ['Customer Database', 'Loyalty Programs', 'Purchase History', 'Communication Tools'],
      category: 'CRM'
    },
    {
      icon: MessageSquare,
      title: 'Multi-Channel Communication',
      description: 'Send receipts and notifications via WhatsApp, SMS, and email with automatic delivery and tracking.',
      demo: 'communication',
      benefits: ['WhatsApp Integration', 'SMS Notifications', 'Email Receipts', 'Delivery Tracking'],
      category: 'Communication'
    },
    {
      icon: TabletSmartphone,
      title: 'Universal Device Support',
      description: 'Works seamlessly on POS terminals, tablets, smartphones, and computers with offline capabilities.',
      demo: 'devices',
      benefits: ['POS Terminals', 'Mobile Devices', 'Offline Mode', 'Cloud Sync'],
      category: 'Technology'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with data encryption, user permissions, and compliance with industry standards.',
      demo: 'security',
      benefits: ['Data Encryption', 'User Permissions', 'Audit Logs', 'Compliance'],
      category: 'Security'
    },
    {
      icon: Settings,
      title: 'Customizable Workflows',
      description: 'Tailor SCIMS to your business needs with customizable workflows, fields, and business type configurations.',
      demo: 'workflows',
      benefits: ['Custom Fields', 'Workflow Automation', 'Business Templates', 'Flexible Configuration'],
      category: 'Customization'
    },
    {
      icon: Cloud,
      title: 'Cloud & Offline Sync',
      description: 'Seamless data synchronization between cloud and offline modes, ensuring business continuity.',
      demo: 'sync',
      benefits: ['Cloud Storage', 'Offline Mode', 'Auto Sync', 'Data Backup'],
      category: 'Technology'
    },
    {
      icon: Truck,
      title: 'Supply Chain Management',
      description: 'Complete supply chain visibility with supplier management, purchase orders, and delivery tracking.',
      demo: 'supply',
      benefits: ['Supplier Management', 'Purchase Orders', 'Delivery Tracking', 'Cost Analysis'],
      category: 'Supply Chain'
    },
    {
      icon: UserCheck,
      title: 'Staff & Role Management',
      description: 'Comprehensive staff management with role-based permissions, scheduling, and performance tracking.',
      demo: 'staff',
      benefits: ['Role Management', 'Staff Scheduling', 'Performance Tracking', 'Access Control'],
      category: 'HR Management'
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
      features: [
        '1 Store Location',
        'Up to 3 Staff Members',
        '500 Products/Services',
        'Basic Reporting',
        'WhatsApp Receipts',
        'SMS Integration',
        'Works Offline'
      ],
      popular: false,
      businessTypes: ['All business types']
    },
    {
      name: 'Business',
      price: '₦35,000',
      period: '/month',
      description: 'Best for growing businesses',
      features: [
        '3 Store Locations',
        'Up to 15 Staff Members',
        '5,000 Products/Services',
        'Advanced Reports',
        'All Communication Channels',
        'Multi-store Management',
        'Priority Support',
        'Email Receipts',
        'Customer Database'
      ],
      popular: true,
      businessTypes: ['All business types', 'Multi-location support']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited Stores',
        'Unlimited Staff',
        'Unlimited Products/Services',
        'Custom Features',
        'White-label Solution',
        'Advanced Integration',
        'Dedicated Support',
        'Custom Training',
        'API Access'
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
      content: 'SCIMS transformed my retail business. The barcode scanning is so fast and customers love getting WhatsApp receipts instantly. My sales increased 45%.',
      rating: 5,
      image: '👨‍💼',
      businessType: 'Retail'
    },
    {
      name: 'Chef Amina Hassan',
      role: 'Restaurant Owner',
      company: 'Hassan Cuisine, Lagos',
      content: 'Managing our restaurant menu and kitchen orders became so much easier. The recipe tracking helps control our food costs perfectly.',
      rating: 5,
      image: '👩‍🍳',
      businessType: 'Restaurant'
    },
    {
      name: 'Dr. Joseph Mwangi',
      role: 'Pharmacy Owner',
      company: 'Mwangi Pharmacy, Nairobi',
      content: 'The drug expiry tracking is a lifesaver! SCIMS helps us maintain compliance and never miss critical dates. Perfect for pharmacy management.',
      rating: 5,
      image: '👨‍⚕️',
      businessType: 'Pharmacy'
    },
    {
      name: 'Fatou Diallo',
      role: 'Service Business Owner',
      company: 'Diallo Tech Services, Dakar',
      content: 'Appointment scheduling and technician management made our service business so much more efficient. Customer communication is fantastic.',
      rating: 5,
      image: '👩‍💻',
      businessType: 'Service'
    }
  ];

  const faqs = [
    {
      question: 'Which business types does SCIMS support?',
      answer: 'SCIMS supports retail stores, restaurants, pharmacies, service businesses, and hybrid operations. Each business type has specialized features and templates designed for that industry.'
    },
    {
      question: 'How quickly can I set up SCIMS for my business?',
      answer: 'Most businesses are running within 30 minutes. Choose your business type, and SCIMS will provide industry-specific templates, local currency setup, and communication integration.'
    },
    {
      question: 'Can I switch between business types?',
      answer: 'Yes! If your business evolves or you add new services, you can easily switch to hybrid mode or add additional business type features to your existing setup.'
    },
    {
      question: 'Does SCIMS work for restaurants with kitchen management?',
      answer: 'Absolutely! Our restaurant module includes menu management, recipe tracking, kitchen order management, table assignments, and food cost analysis specifically designed for food service businesses.'
    },
    {
      question: 'Is SCIMS suitable for pharmacies with regulatory requirements?',
      answer: 'Yes! Our pharmacy module includes drug inventory tracking, expiry date monitoring, prescription management, batch tracking, and compliance features required for pharmaceutical operations.'
    },
    {
      question: 'Can service businesses manage appointments and technicians?',
      answer: 'Definitely! Service businesses get appointment scheduling, service catalogs, technician tracking, customer management, and service history - everything needed for service-based operations.'
    }
  ];

  const stats = [
    { value: 4200, suffix: '+', label: 'Active Businesses' },
    { value: 1500, suffix: 'M+', prefix: '₦', label: 'Sales Processed' },
    { value: 250, suffix: 'K+', label: 'Receipts Sent Daily' },
    { value: 24, suffix: '/7', label: 'WhatsApp Support' }
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
                      .filter(([key, value]) => value === true)
                      .map(([key, _], index) => (
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
