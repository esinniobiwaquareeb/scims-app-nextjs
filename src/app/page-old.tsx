'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  AnimatedCounter,
  DeviceShowcase,
  DeviceInterface,
  CommunicationShowcase
} from '@/components/landing';
import { 
  ArrowRight, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Package, 
  Store, 
  CreditCard, 
  Shield, 
  Globe, 
  TrendingUp,
  Star,
  Menu,
  X,
  Building2,
  UserCheck,
  Headphones,
  Award,
  Rocket,
  Target,
  CheckCircle2,
  Database,
  TabletSmartphone,
  Eye,
  MousePointer,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Settings,
  Zap,
  Lock,
  Cloud,
  Activity,
  Truck,
  MessageSquare,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
interface LandingPageProps {
  onGetStarted: () => void;
  onStartDemo: (demoType: string) => void;
  onBusinessTypeSelect?: (businessType: string) => void;
}

export const HomePage = ({ onGetStarted, onStartDemo, onBusinessTypeSelect }: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState('retail');
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  // Business types data
  const businessTypes = [
    {
      id: 'retail',
      name: 'Retail Store',
      description: 'Traditional retail business with inventory management',
      icon: '🛍️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      darkBgColor: 'dark:bg-blue-950/20',
      features: [
        'Product catalog management',
        'Barcode scanning & printing',
        'Multi-category inventory',
        'Supplier management',
        'Customer loyalty programs',
        'Sales reporting & analytics'
      ],
      benefits: [
        'Track inventory in real-time',
        'Automatic low-stock alerts',
        'Fast barcode checkout',
        'Customer purchase history'
      ]
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      description: 'Restaurant business with menu and recipe management',
      icon: '🍽️',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      darkBgColor: 'dark:bg-green-950/20',
      features: [
        'Digital menu management',
        'Recipe & ingredient tracking',
        'Table management system',
        'Kitchen order management',
        'Staff scheduling',
        'Food cost analysis'
      ],
      benefits: [
        'Streamline order taking',
        'Track food costs precisely',
        'Manage kitchen workflow',
        'Monitor table turnover'
      ]
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy',
      description: 'Pharmacy with specialized inventory management',
      icon: '💊',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      darkBgColor: 'dark:bg-red-950/20',
      features: [
        'Drug inventory tracking',
        'Expiry date monitoring',
        'Prescription management',
        'Regulatory compliance',
        'Insurance integration',
        'Batch tracking'
      ],
      benefits: [
        'Never miss expiry dates',
        'Maintain compliance',
        'Track prescriptions',
        'Manage drug batches'
      ]
    },
    {
      id: 'service',
      name: 'Service Business',
      description: 'Service-based business with appointment booking',
      icon: '🔧',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      darkBgColor: 'dark:bg-purple-950/20',
      features: [
        'Appointment scheduling',
        'Service catalog',
        'Customer management',
        'Technician tracking',
        'Service history',
        'Invoice generation'
      ],
      benefits: [
        'Schedule appointments easily',
        'Track service history',
        'Manage technicians',
        'Generate service reports'
      ]
    },
    {
      id: 'hybrid',
      name: 'Hybrid Business',
      description: 'Combines multiple business types',
      icon: '🔄',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      darkBgColor: 'dark:bg-orange-950/20',
      features: [
        'Multi-business type support',
        'Unified dashboard',
        'Cross-business analytics',
        'Flexible configurations',
        'Custom workflows',
        'Advanced reporting'
      ],
      benefits: [
        'One system for everything',
        'Unified business view',
        'Flexible operations',
        'Comprehensive analytics'
      ]
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onGetStarted={onGetStarted}
        onStartDemo={onStartDemo}
      />

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-muted/20"
          style={{ y }}
        />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <AnimatedSection animation="fadeUp" delay={0.2}>
                <Badge variant="secondary" className="mb-6">
                  🚀 Trusted by 4,200+ Businesses Worldwide
                </Badge>
              </AnimatedSection>
              
              <AnimatedSection animation="fadeUp" delay={0.4}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  The Complete Business
                  <span className="text-primary block">
                    Management Platform
                  </span>
                </h1>
              </AnimatedSection>
              
              <AnimatedSection animation="fadeUp" delay={0.6}>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  From retail stores to restaurants, pharmacies to service businesses - SCIMS provides industry-specific 
                  tools, automatic receipt delivery, and works seamlessly across all devices, online and offline.
                </p>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={0.7}>
                <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="fadeUp" delay={0.8}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300" 
                    onClick={onGetStarted}
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 border-2 hover:bg-muted/50"
                    onClick={() => onStartDemo('store_admin')}
                  >
                    <MousePointer className="mr-2 w-5 h-5" />
                    Try Live Demo
                  </Button>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={1.0}>
                <p className="text-sm text-muted-foreground">
                  ✨ No payment required • 14-day free trial • Works offline • Instant receipts
                </p>
              </AnimatedSection>
            </div>

            <div className="lg:pl-8">
              <AnimatedSection animation="fadeUp" delay={0.6}>
                <div className="relative">
                  <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">SCIMS Dashboard</h3>
                      <p className="text-muted-foreground">Complete business management solution</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Live Dashboard</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Real-time business insights across all industries
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
          
          <AnimatedSection animation="fadeUp" delay={1.2} className="mt-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={4200} suffix="+" />
                </div>
                <div className="text-muted-foreground">Active Businesses</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={1500} suffix="M+" prefix="₦" />
                </div>
                <div className="text-muted-foreground">Sales Processed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={250} suffix="K+" />
                </div>
                <div className="text-muted-foreground">Receipts Sent Daily</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">WhatsApp Support</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Business Types Section */}
      <section id="business-types" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">🏢 Industry Solutions</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Designed for Your Business Type
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your industry to see specialized features and workflows designed 
              specifically for your type of business.
            </p>
          </AnimatedSection>

          {/* Business Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {businessTypes.map((type, index) => (
              <AnimatedSection key={type.id} animation="fadeUp" delay={index * 0.1}>
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedBusinessType === type.id 
                      ? `ring-2 ring-primary ${type.bgColor} ${type.darkBgColor}` 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedBusinessType(type.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="font-semibold mb-2">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                    {onBusinessTypeSelect && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBusinessTypeSelect(type.id);
                        }}
                      >
                        Learn More <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          {/* Selected Business Type Details */}
          <AnimatedSection animation="fadeUp" delay={0.6}>
            <div className="bg-background rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="text-6xl">
                      {businessTypes.find(t => t.id === selectedBusinessType)?.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2">
                        {businessTypes.find(t => t.id === selectedBusinessType)?.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {businessTypes.find(t => t.id === selectedBusinessType)?.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Business type image */}
                  <div className="relative rounded-lg overflow-hidden h-64 mb-6 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">
                        {businessTypes.find(t => t.id === selectedBusinessType)?.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {businessTypes.find(t => t.id === selectedBusinessType)?.name} Environment
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Optimized workspace for {businessTypes.find(t => t.id === selectedBusinessType)?.name.toLowerCase()} operations
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-6">Specialized Features</h4>
                  <div className="space-y-3 mb-8">
                    {businessTypes.find(t => t.id === selectedBusinessType)?.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <h4 className="text-xl font-semibold mb-4">Key Benefits</h4>
                  <div className="space-y-3">
                    {businessTypes.find(t => t.id === selectedBusinessType)?.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-4">
                    <Button className="w-full" onClick={() => onStartDemo('store_admin')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Try {businessTypes.find(t => t.id === selectedBusinessType)?.name} Demo
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onGetStarted}>
                      Start Free Trial
                    </Button>
                    {onBusinessTypeSelect && (
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => onBusinessTypeSelect(selectedBusinessType)}
                      >
                        Learn More About {businessTypes.find(t => t.id === selectedBusinessType)?.name}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Business Type Showcase Section */}
      {onBusinessTypeSelect && (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection animation="fadeUp" className="text-center mb-20">
              <Badge variant="outline" className="mb-4">🎯 Explore Solutions</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Deep Dive into Each Business Type
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get detailed information, use cases, and success stories for your specific industry.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessTypes.slice(0, 3).map((type, index) => (
                <AnimatedSection key={type.id} animation="fadeUp" delay={index * 0.1}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer"
                        onClick={() => onBusinessTypeSelect(type.id)}>
                    <CardHeader>
                      <div className={`w-16 h-16 ${type.bgColor} ${type.darkBgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{type.icon}</span>
                      </div>
                      <CardTitle className="text-2xl mb-4">{type.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6 leading-relaxed">{type.description}</p>
                      <div className="space-y-2 mb-6">
                        {type.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" className="p-0 h-auto group-hover:text-primary transition-colors">
                        Explore {type.name}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {businessTypes.slice(3).map((type, index) => (
                <AnimatedSection key={type.id} animation="fadeUp" delay={index * 0.1}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer"
                        onClick={() => onBusinessTypeSelect(type.id)}>
                    <CardHeader>
                      <div className={`w-16 h-16 ${type.bgColor} ${type.darkBgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{type.icon}</span>
                      </div>
                      <CardTitle className="text-2xl mb-4">{type.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6 leading-relaxed">{type.description}</p>
                      <div className="space-y-2 mb-6">
                        {type.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" className="p-0 h-auto group-hover:text-primary transition-colors">
                        Explore {type.name}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Device Showcase Section */}
      <section id="devices" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">📱 Universal Compatibility</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Works on Every Device You Have
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From POS terminals to smartphones, SCIMS adapts to your existing hardware. 
              No need to buy new devices - start with what you already own.
            </p>
          </AnimatedSection>

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
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">📧 Smart Receipts</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Customers Get Receipts Instantly
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              When connected to internet, send receipts via WhatsApp, SMS, or email. 
              Customers get a link to view their receipt online for proper record keeping.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={0.2}>
            <CommunicationShowcase />
          </AnimatedSection>
        </div>
      </section>

      {/* Integration Showcase Section */}
      <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">🔗 Seamless Integrations</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Connect with Your Favorite Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              SCIMS integrates seamlessly with popular business tools, payment processors, 
              and communication platforms to streamline your operations.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Payment Integrations */}
            <AnimatedSection animation="fadeUp" delay={0.1}>
              <Card className="h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Payment Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Accept payments from multiple sources with secure processing.</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Mobile Money (M-Pesa, MTN, etc.)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Bank Transfers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Cash Payments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Communication Integrations */}
            <AnimatedSection animation="fadeUp" delay={0.2}>
              <Card className="h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Communication Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Reach customers through their preferred communication channels.</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>WhatsApp Business API</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>SMS Gateway Integration</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Email Marketing Tools</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Social Media Integration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Business Tools */}
            <AnimatedSection animation="fadeUp" delay={0.3}>
              <Card className="h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
                    <Settings className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Business Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Connect with essential business applications and services.</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Accounting Software (QuickBooks, Xero)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>E-commerce Platforms</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Shipping & Logistics</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>CRM Systems</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* API & Custom Integrations */}
          <AnimatedSection animation="fadeUp" delay={0.4}>
            <div className="bg-background rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">API & Custom Integrations</h3>
                  <p className="text-muted-foreground mb-6">
                    Build custom integrations with our comprehensive REST API. Connect SCIMS with any 
                    system or create custom workflows tailored to your business needs.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>RESTful API with comprehensive documentation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Webhook support for real-time updates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>SDK for popular programming languages</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Custom integration development services</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Popular Integrations</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <span className="text-lg font-bold text-blue-600">QB</span>
                      </div>
                      <p className="text-sm text-muted-foreground">QuickBooks</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <span className="text-lg font-bold text-green-600">MP</span>
                      </div>
                      <p className="text-sm text-muted-foreground">M-Pesa</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <span className="text-lg font-bold text-blue-500">WA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <span className="text-lg font-bold text-orange-600">SM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Shopify</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Demo Access Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Try SCIMS Right Now - No Signup Required</h3>
            <p className="text-muted-foreground mb-8">Explore all features with different user roles and business types</p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedSection animation="fadeUp" delay={0.1}>
              <Card className="text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => onStartDemo('store_admin')}>
                <CardHeader>
                  <UserCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle>Store Manager Demo</CardTitle>
                  <p className="text-muted-foreground">Full access including receipt settings and customer communication</p>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Try as Store Manager
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.2}>
              <Card className="text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => onStartDemo('cashier')}>
                <CardHeader>
                  <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle>Cashier Demo</CardTitle>
                  <p className="text-muted-foreground">Experience POS system with WhatsApp and SMS receipt delivery</p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Try as Cashier
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.3}>
              <Card className="text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => onStartDemo('business_admin')}>
                <CardHeader>
                  <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle>Business Owner Demo</CardTitle>
                  <p className="text-muted-foreground">See multi-store management and communication analytics</p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Try as Business Owner
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">🎯 Complete Solution</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything Your Business Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From cash management to customer communication, SCIMS provides comprehensive tools 
              designed for modern business operations across all industries.
            </p>
          </AnimatedSection>

          {/* Feature Categories */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['All', 'Core Features', 'Analytics', 'Enterprise', 'CRM', 'Communication', 'Technology', 'Security', 'Customization', 'Supply Chain', 'HR Management'].map((category) => (
                <Button
                  key={category}
                  variant={category === 'All' ? 'default' : 'outline'}
                  size="sm"
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection 
                key={index} 
                animation="fadeUp" 
                delay={index * 0.1}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                    <div className="space-y-2 mb-6">
                      {feature.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto group-hover:text-primary transition-colors"
                      onClick={() => onStartDemo(feature.demo)}
                    >
                      See in Demo
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
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

      {/* Security & Compliance Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">🔒 Enterprise Security</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Bank-Level Security & Compliance
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your business data is protected with enterprise-grade security, compliance standards, 
              and industry-leading encryption technologies.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <AnimatedSection animation="fadeUp" delay={0.1}>
              <Card className="text-center h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Data Encryption</h3>
                  <p className="text-sm text-muted-foreground">AES-256 encryption for data at rest and in transit</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.2}>
              <Card className="text-center h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">SOC 2 Compliant</h3>
                  <p className="text-sm text-muted-foreground">Audited security controls and compliance standards</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.3}>
              <Card className="text-center h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-sm text-muted-foreground">Granular permissions and user access controls</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.4}>
              <Card className="text-center h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
                  <p className="text-sm text-muted-foreground">Complete activity tracking and audit trails</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fadeUp" delay={0.5}>
              <div>
                <h3 className="text-2xl font-bold mb-6">Compliance & Certifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>GDPR Compliant - European data protection standards</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>HIPAA Ready - Healthcare data protection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>PCI DSS - Payment card industry standards</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>ISO 27001 - Information security management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Regular Security Audits - Third-party assessments</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.6}>
              <div className="bg-background rounded-2xl p-8 shadow-lg">
                <h4 className="text-xl font-semibold mb-6">Security Features</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium">End-to-End Encryption</h5>
                      <p className="text-sm text-muted-foreground">All data encrypted from device to cloud</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium">Multi-Factor Authentication</h5>
                      <p className="text-sm text-muted-foreground">Enhanced login security with 2FA</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Cloud className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium">Secure Cloud Infrastructure</h5>
                      <p className="text-sm text-muted-foreground">AWS/Azure with 99.9% uptime SLA</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium">Real-time Monitoring</h5>
                      <p className="text-sm text-muted-foreground">24/7 security monitoring and alerts</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">⚡ Simple Setup</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start Your Business in Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our setup process includes business templates, receipt delivery configuration, 
              and communication channel integration tailored to your industry.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflows.map((step, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <Card className="text-center h-full hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{step.step}</div>
                    <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                    <Badge variant="secondary" className="mb-4">{step.time}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fadeUp" delay={0.6} className="text-center mt-12">
            <Button size="lg" onClick={onGetStarted}>
              Start Your Business Setup
              <Rocket className="ml-2 w-5 h-5" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">⭐ Success Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how businesses across different industries are growing with SCIMS
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-3xl">{testimonial.image}</div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <Badge variant="secondary" className="text-xs">
                          {testimonial.businessType}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex text-yellow-500">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{testimonial.company}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">💰 Simple Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Plans That Grow With Your Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your business type and scale. 
              All plans include receipt delivery and work across all business types.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <Card className={`h-full relative ${tier.popular ? 'ring-2 ring-primary shadow-xl' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                    <p className="text-muted-foreground">{tier.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-8">
                      {tier.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 mb-6">
                      {tier.businessTypes.map((type, i) => (
                        <Badge key={i} variant="secondary" className="text-xs mr-2">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className={`w-full ${tier.popular ? '' : 'variant-outline'}`}
                      variant={tier.popular ? 'default' : 'outline'}
                      onClick={onGetStarted}
                    >
                      {tier.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fadeUp" className="text-center mb-20">
            <Badge variant="outline" className="mb-4">❓ FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about SCIMS for your business type
            </p>
          </AnimatedSection>

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
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={onGetStarted}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 border-2"
                onClick={() => onStartDemo('store_admin')}
              >
                <Eye className="mr-2 w-5 h-5" />
                Try Demo First
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Industry Recognized</span>
              </div>
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4" />
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

      {/* Footer */}
      <footer className="bg-muted/50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold">SCIMS</span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The complete business management platform trusted by 4,200+ businesses worldwide. 
                From retail stores to restaurants, pharmacies to service businesses - SCIMS adapts to your industry.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">Retail</Badge>
                <Badge variant="secondary">Restaurant</Badge>
                <Badge variant="secondary">Pharmacy</Badge>
                <Badge variant="secondary">Service</Badge>
                <Badge variant="secondary">Hybrid</Badge>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>

            {/* Business Types */}
            <div>
              <h4 className="font-semibold mb-4">Business Types</h4>
              <div className="space-y-3 text-sm">
                <Link href="/business-types/retail" className="block text-muted-foreground hover:text-foreground transition-colors">
                  🛍️ Retail Stores
                </Link>
                <Link href="/business-types/restaurant" className="block text-muted-foreground hover:text-foreground transition-colors">
                  🍽️ Restaurants
                </Link>
                <Link href="/business-types/pharmacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  💊 Pharmacies
                </Link>
                <Link href="/business-types/service" className="block text-muted-foreground hover:text-foreground transition-colors">
                  🔧 Service Businesses
                </Link>
                <Link href="/business-types/hybrid" className="block text-muted-foreground hover:text-foreground transition-colors">
                  🔄 Hybrid Operations
                </Link>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <div className="space-y-3 text-sm">
                <Link href="/features/pos" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Point of Sale
                </Link>
                <Link href="/features/inventory" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Inventory Management
                </Link>
                <Link href="/features/analytics" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Business Analytics
                </Link>
                <Link href="/features/communication" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Customer Communication
                </Link>
                <Link href="/features/multi-store" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Multi-store Management
                </Link>
                <Link href="/features/receipts" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Receipt Delivery
                </Link>
              </div>
            </div>

            {/* Support & Resources */}
            <div>
              <h4 className="font-semibold mb-4">Support & Resources</h4>
              <div className="space-y-3 text-sm">
                <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="w-4 h-4 inline mr-2" />
                  Help Center
                </Link>
                <Link href="/docs" className="block text-muted-foreground hover:text-foreground transition-colors">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Documentation
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Contact Us
                </Link>
                <Link href="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                  <Headphones className="w-4 h-4 inline mr-2" />
                  Live Support
                </Link>
                <Link href="/training" className="block text-muted-foreground hover:text-foreground transition-colors">
                  <Award className="w-4 h-4 inline mr-2" />
                  Training
                </Link>
                <Link href="/status" className="block text-muted-foreground hover:text-foreground transition-colors">
                  <Activity className="w-4 h-4 inline mr-2" />
                  System Status
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
                <p>&copy; 2024 SCIMS. All rights reserved.</p>
                <div className="flex space-x-6">
                  <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                  <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                  <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Available in 15+ languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>SOC 2 Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function Page() {
  const handleGetStarted = () => {
    // Redirect to signup or registration page
    window.location.href = '/auth/register';
  };

  const handleStartDemo = (demoType: string) => {
    // Redirect to demo page with specific demo type
    window.location.href = `/demo?type=${demoType}`;
  };

  const handleBusinessTypeSelect = (businessType: string) => {
    // Redirect to business type specific page
    window.location.href = `/business-types/${businessType}`;
  };

  return (
    <HomePage 
      onGetStarted={handleGetStarted}
      onStartDemo={handleStartDemo}
      onBusinessTypeSelect={handleBusinessTypeSelect}
    />
  );
}