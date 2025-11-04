'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Navigation,
  Footer,
  HeroSection,
  SectionHeader,
  FeatureCard,
  TestimonialCard,
  PricingCard,
  AnimatedSection,
} from '@/components/landing';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Globe, 
  Store, 
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function HomePageClient() {
  // Top 6 features only - focused on key value props
  const features = [
    {
      icon: ShoppingCart,
      title: 'Fast POS System',
      description: 'Process sales 3x faster with barcode scanning and multiple payment methods. Increase daily sales by 45%.',
      benefits: ['3x Faster Checkout', 'Barcode Scanning', 'Multiple Payments', 'Instant Receipts'],
      category: 'Revenue Boost'
    },
    {
      icon: Globe,
      title: 'FREE Professional Website',
      description: 'Get a stunning online store worth ₦500,000 absolutely FREE. Your customers can shop 24/7.',
      benefits: ['Worth ₦500,000', '24/7 Online Sales', 'Mobile Optimized', 'SEO Ready'],
      category: 'FREE Bonus'
    },
    {
      icon: Package,
      title: 'Smart Inventory',
      description: 'Never run out of stock. Get low-stock alerts and track expiry dates automatically.',
      benefits: ['Auto Stock Alerts', 'Expiry Tracking', 'Supplier Management', 'Waste Reduction'],
      category: 'Cost Savings'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'See exactly what\'s making you money with real-time reports and profit analysis.',
      benefits: ['Real-time Reports', 'Sales Forecasting', 'Profit Analysis', 'Growth Insights'],
      category: 'Smart Decisions'
    },
    {
      icon: Store,
      title: 'Multi-Store Management',
      description: 'Manage unlimited stores from one dashboard. Perfect for growing businesses.',
      benefits: ['Unlimited Stores', 'Centralized Control', 'Unified Reporting', 'Local Autonomy'],
      category: 'Scale Up'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integration',
      description: 'Send receipts and promotions via WhatsApp automatically. Keep customers engaged.',
      benefits: ['WhatsApp Receipts', 'Auto Notifications', 'Customer Engagement', 'Marketing Tools'],
      category: 'Customer Engagement'
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
        '🎁 FREE Professional Website',
        '1 Store Location',
        'Up to 3 Staff Members',
        '500 Products/Services',
        'Basic Reporting',
        'WhatsApp Receipts',
        'Works Offline',
        '24/7 Online Sales'
      ],
      popular: false,
    },
    {
      name: 'Business',
      price: '₦35,000',
      period: '/month',
      description: 'Best for growing businesses',
      originalPrice: '₦85,000',
      savings: '₦50,000',
      features: [
        '🎁 FREE Professional Website',
        '3 Store Locations',
        'Up to 15 Staff Members',
        '5,000 Products/Services',
        'Advanced Reports',
        'All Communication Channels',
        'Multi-store Management',
        'Priority Support',
        'Advanced Analytics'
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      originalPrice: '₦500,000+',
      savings: '₦500,000',
      features: [
        '🎁 FREE Professional Website',
        'Unlimited Stores',
        'Unlimited Staff',
        'Unlimited Products',
        'Custom Features',
        'White-label Solution',
        'Dedicated Support',
        'API Access'
      ],
      popular: false,
    }
  ];

  const testimonials = [
    {
      name: 'Kwame Asante',
      role: 'Electronics Store Owner',
      company: 'Asante Electronics, Accra',
      content: 'SCIMS + FREE website = Game changer! My online sales went from ₦0 to ₦2.3M monthly. Revenue up 67%!',
      rating: 5,
      image: '👨‍💼',
      businessType: 'Retail'
    },
    {
      name: 'Chef Amina Hassan',
      role: 'Restaurant Owner',
      company: 'Hassan Cuisine, Lagos',
      content: 'The FREE website lets customers order online 24/7! Kitchen orders automated, revenue doubled!',
      rating: 5,
      image: '👩‍🍳',
      businessType: 'Restaurant'
    },
    {
      name: 'Dr. Joseph Mwangi',
      role: 'Pharmacy Owner',
      company: 'Mwangi Pharmacy, Nairobi',
      content: 'Online prescription orders through our FREE website + expiry tracking. Sales up 55%.',
      rating: 5,
      image: '👨‍⚕️',
      businessType: 'Pharmacy'
    },
    {
      name: 'Fatou Diallo',
      role: 'Service Business Owner',
      company: 'Diallo Tech Services, Dakar',
      content: 'The FREE website brings 15+ new customers weekly! Business grew 200% in 6 months!',
      rating: 5,
      image: '👩‍💻',
      businessType: 'Service'
    }
  ];

  const faqs = [
    {
      question: 'Is the FREE website really worth ₦500,000?',
      answer: 'Absolutely! Our professional websites include mobile optimization, SEO setup, payment integration, and inventory sync. Similar websites cost ₦500,000+ from developers. You get it FREE with any SCIMS plan.'
    },
    {
      question: 'Can customers shop 24/7 on my FREE website?',
      answer: 'Yes! Your website works 24/7, even when your physical store is closed. Customers can browse, add to cart, and place orders anytime.'
    },
    {
      question: 'How quickly can I set up SCIMS?',
      answer: 'Most businesses are running within 30 minutes! Choose your business type, and SCIMS provides industry-specific templates and your professional website.'
    },
    {
      question: 'Which business types does SCIMS support?',
      answer: 'SCIMS supports retail stores, restaurants, pharmacies, service businesses, and hybrid operations. Each has specialized features and templates.'
    },
    {
      question: 'What payment methods work on my FREE website?',
      answer: 'Your website supports both pay-on-delivery and online payments. You can enable/disable payment methods based on your preference.'
    },
    {
      question: 'Does SCIMS work offline?',
      answer: 'Yes! SCIMS works completely offline. All sales are stored locally and sync automatically when internet returns. Never lose a sale.'
    }
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

      <HeroSection 
        onGetStarted={handleGetStarted}
        onStartDemo={handleStartDemo}
      />

      {/* Module Showcase Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💼 Key Modules"
            title="Everything You Need in One Platform"
            description="Powerful modules designed to streamline your business operations"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {[
              {
                src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/pos-page.png',
                alt: 'SCIMS POS System',
                title: 'Point of Sale',
                description: 'Process sales and transactions'
              },
              {
                src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/business-admin-dashboard.png',
                alt: 'SCIMS Business Admin Dashboard',
                title: 'Business Dashboard',
                description: 'Complete business management overview'
              },
              {
                src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/inventory.png',
                alt: 'SCIMS Inventory Management',
                title: 'Inventory Management',
                description: 'Track products and stock levels'
              },
              {
                src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/pos-payment.png',
                alt: 'SCIMS Payment Processing',
                title: 'Payment Processing',
                description: 'Secure payment handling'
              },
              {
                src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/pos-receipt.png',
                alt: 'SCIMS Receipt Generation',
                title: 'Receipt Generation',
                description: 'Professional receipt printing'
              }
            ].map((module, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="group relative overflow-hidden rounded-2xl bg-background shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={module.src}
                      alt={module.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        {module.title}
                      </h3>
                      <p className="text-sm text-white/90">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FREE Website Section - Simplified */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <AnimatedSection animation="fadeUp" delay={0.1}>
                <Badge variant="secondary" className="mb-4">
                  🎁 FREE BONUS
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Professional Website
                  <span className="text-primary block mt-2">
                    Worth ₦500,000 - FREE!
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                  <strong>Stop paying for separate website development!</strong> Every SCIMS plan includes a stunning, 
                  mobile-optimized online store that works 24/7. Your customers can shop even when you&apos;re closed.
                </p>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={0.2}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Professional Design - Mobile-optimized, SEO-ready</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>24/7 Online Sales - Never miss a customer</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Automatic Sync - Inventory updates in real-time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Payment Integration - Pay on delivery + online payments</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="fadeUp" delay={0.3}>
              <div className="relative rounded-2xl shadow-2xl overflow-hidden aspect-video">
                <Image
                  src="https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/website-shot.png"
                  alt="SCIMS FREE Website"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Showcase - Reduced to 6 */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎯 Complete Solution"
            title="Everything Your Business Needs"
            description="From POS to online store, SCIMS provides comprehensive tools for modern business operations."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                benefits={feature.benefits}
                category={feature.category}
                demo="pos"
                onDemoClick={handleStartDemo}
                animation="fadeUp"
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="⭐ Success Stories"
            title="Trusted by Businesses Worldwide"
            description="See how businesses are growing with SCIMS"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12">
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
      <section id="pricing" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💰 Simple Pricing"
            title="Plans That Grow With Your Business"
            description="Choose the perfect plan for your business. All plans include your FREE website."
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
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

          <AnimatedSection animation="fadeUp" delay={0.4} className="text-center mt-12">
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>All business types</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>WhatsApp, SMS & Email</span>
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
      <section id="faq" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="❓ FAQ"
            title="Frequently Asked Questions"
            description="Everything you need to know about SCIMS"
            maxWidth="2xl"
          />

          <AnimatedSection animation="fadeUp" delay={0.2}>
            <Accordion type="single" collapsible className="space-y-4 mt-12">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto">
              Join thousands of businesses using SCIMS to streamline operations and grow revenue.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-primary text-primary-foreground px-8 sm:px-10 py-4 sm:py-6 rounded-lg hover:bg-primary/90 transition-all text-base sm:text-lg shadow-lg hover:shadow-xl"
                onClick={handleGetStarted}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5 inline" />
              </button>
              <button 
                className="border-2 border-primary text-primary px-8 sm:px-10 py-4 sm:py-6 rounded-lg hover:bg-primary/10 transition-all text-base sm:text-lg"
                onClick={() => handleStartDemo('store_admin')}
              >
                <Eye className="mr-2 w-5 h-5 inline" />
                Try Demo First
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
