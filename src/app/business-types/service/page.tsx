'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
import { BUSINESS_TYPES, getBusinessTypeConfig } from '@/components/common/BusinessTypeConstants';
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
  UserCheck,
  TabletSmartphone,
  Database,
  Target,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Eye,
  Star,
  Calendar,
  Wrench,
  Clock,
  FileText
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function ServiceBusinessPage() {
  const businessType = getBusinessTypeConfig(BUSINESS_TYPES.SERVICE);

  const serviceFeatures = [
    {
      icon: Calendar,
      title: 'Appointment Scheduling',
      description: 'Efficient appointment scheduling with calendar management, client notifications, and automated reminders.',
      benefits: ['Calendar Management', 'Client Notifications', 'Automated Reminders', 'Time Slot Management'],
      category: 'Core Features'
    },
    {
      icon: Wrench,
      title: 'Service Catalog',
      description: 'Comprehensive service catalog with pricing, duration, and resource requirements for each service.',
      benefits: ['Service Catalog', 'Pricing Management', 'Duration Tracking', 'Resource Planning'],
      category: 'Core Features'
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Complete customer management with service history, preferences, and communication tools.',
      benefits: ['Customer Database', 'Service History', 'Preferences Tracking', 'Communication Tools'],
      category: 'Customer Care'
    },
    {
      icon: UserCheck,
      title: 'Technician Tracking',
      description: 'Track technician availability, skills, and performance for optimal service delivery.',
      benefits: ['Availability Tracking', 'Skills Management', 'Performance Monitoring', 'Workload Distribution'],
      category: 'Staff Management'
    },
    {
      icon: FileText,
      title: 'Service History',
      description: 'Comprehensive service history tracking with detailed records and follow-up management.',
      benefits: ['Service Records', 'Follow-up Management', 'Quality Tracking', 'Customer Satisfaction'],
      category: 'Core Features'
    },
    {
      icon: BarChart3,
      title: 'Service Analytics',
      description: 'Advanced analytics for service performance, customer satisfaction, and business growth insights.',
      benefits: ['Performance Analytics', 'Customer Satisfaction', 'Growth Insights', 'Trend Analysis'],
      category: 'Analytics'
    }
  ];

  const serviceBenefits = [
    'Schedule appointments easily',
    'Track service history',
    'Manage technicians',
    'Generate service reports',
    'Improve customer satisfaction',
    'Optimize service delivery',
    'Reduce no-shows',
    'Increase repeat business'
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
              <div className="text-6xl mb-6">{businessType.icon}</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                {businessType.label}
                <span className="text-primary block">
                  Management Solution
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {businessType.description}. SCIMS provides specialized tools for service businesses including appointment scheduling, technician management, and customer service tracking.
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
                  Try Service Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Service Dashboard</h3>
                    <p className="text-muted-foreground">Complete service business management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Service Dashboard</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time appointment and service management for service businesses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🔧 Service Features"
            title="Everything You Need for Service Business Success"
            description="Specialized tools and features designed specifically for service-based businesses"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceFeatures.map((feature, index) => (
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
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS for Service Businesses?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                SCIMS is specifically designed for service businesses, providing all the tools you need to manage 
                appointments, track technicians, and deliver exceptional customer service.
              </p>
              <div className="space-y-4">
                {serviceBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Service Success Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Appointment Accuracy</span>
                    <span className="text-sm text-muted-foreground">97.5%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '97.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-muted-foreground">4.9/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Service Efficiency</span>
                    <span className="text-sm text-muted-foreground">40% Improvement</span>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Service Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of service businesses already using SCIMS to streamline operations and improve customer satisfaction.
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
              Try Service Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
