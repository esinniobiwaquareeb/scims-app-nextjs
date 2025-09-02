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
  ChefHat,
  Utensils,
  Clock
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function RestaurantBusinessPage() {
  const businessType = getBusinessTypeConfig(BUSINESS_TYPES.RESTAURANT);

  const restaurantFeatures = [
    {
      icon: ChefHat,
      title: 'Menu Management',
      description: 'Digital menu management with recipe tracking, ingredient management, and dynamic pricing.',
      benefits: ['Digital Menus', 'Recipe Tracking', 'Ingredient Management', 'Dynamic Pricing'],
      category: 'Core Features'
    },
    {
      icon: Utensils,
      title: 'Kitchen Order Management',
      description: 'Streamline kitchen operations with order management, table assignments, and cooking timers.',
      benefits: ['Order Management', 'Table Assignments', 'Cooking Timers', 'Kitchen Display'],
      category: 'Core Features'
    },
    {
      icon: Users,
      title: 'Table Management',
      description: 'Efficient table management with reservations, seating arrangements, and turnover tracking.',
      benefits: ['Reservations', 'Seating Arrangements', 'Turnover Tracking', 'Wait List Management'],
      category: 'Core Features'
    },
    {
      icon: BarChart3,
      title: 'Food Cost Analysis',
      description: 'Track food costs, analyze profitability, and optimize menu pricing for maximum profit.',
      benefits: ['Cost Tracking', 'Profit Analysis', 'Menu Optimization', 'Waste Management'],
      category: 'Analytics'
    },
    {
      icon: Clock,
      title: 'Staff Scheduling',
      description: 'Manage staff schedules, track hours, and optimize labor costs for your restaurant.',
      benefits: ['Schedule Management', 'Time Tracking', 'Labor Cost Optimization', 'Shift Planning'],
      category: 'HR Management'
    },
    {
      icon: MessageSquare,
      title: 'Customer Communication',
      description: 'Send order confirmations, receipts, and promotional messages via WhatsApp and SMS.',
      benefits: ['Order Confirmations', 'Receipt Delivery', 'Promotional Messages', 'Customer Feedback'],
      category: 'Communication'
    }
  ];

  const restaurantBenefits = [
    'Streamline order taking',
    'Track food costs precisely',
    'Manage kitchen workflow',
    'Monitor table turnover',
    'Optimize staff scheduling',
    'Reduce food waste',
    'Improve customer service',
    'Increase profitability'
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
                {businessType.description}. SCIMS provides specialized tools for restaurant operations including menu management, kitchen order tracking, and table management.
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
                  Try Restaurant Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChefHat className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Restaurant Dashboard</h3>
                    <p className="text-muted-foreground">Complete restaurant management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Restaurant Dashboard</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time kitchen and table management for restaurant operations
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
            badge="🍽️ Restaurant Features"
            title="Everything You Need for Restaurant Success"
            description="Specialized tools and features designed specifically for restaurant operations"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurantFeatures.map((feature, index) => (
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
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS for Restaurants?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                SCIMS is specifically designed for restaurant businesses, providing all the tools you need to manage 
                your kitchen, serve customers, and optimize your operations for maximum profitability.
              </p>
              <div className="space-y-4">
                {restaurantBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Restaurant Success Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Order Accuracy</span>
                    <span className="text-sm text-muted-foreground">98.5%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '98.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Table Turnover</span>
                    <span className="text-sm text-muted-foreground">2.5x Faster</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Food Cost Control</span>
                    <span className="text-sm text-muted-foreground">25% Reduction</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
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
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of restaurants already using SCIMS to streamline operations and increase profitability.
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
              Try Restaurant Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
