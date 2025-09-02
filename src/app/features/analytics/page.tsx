'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LineChart, 
  Target, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  Eye,
  DollarSign,
  Users,
  ShoppingCart,
  Package
} from 'lucide-react';

export default function AnalyticsFeaturePage() {
  const analyticsFeatures = [
    {
      icon: BarChart3,
      title: 'Sales Analytics',
      description: 'Comprehensive sales analytics with real-time tracking, trends, and performance insights.',
      benefits: ['Real-time Sales Data', 'Trend Analysis', 'Performance Metrics', 'Revenue Tracking'],
      category: 'Core Features'
    },
    {
      icon: PieChart,
      title: 'Product Performance',
      description: 'Detailed product performance analytics to identify top sellers and optimize inventory.',
      benefits: ['Product Rankings', 'Sales Volume', 'Profit Margins', 'Inventory Optimization'],
      category: 'Product Analytics'
    },
    {
      icon: LineChart,
      title: 'Trend Analysis',
      description: 'Advanced trend analysis to predict future sales and identify seasonal patterns.',
      benefits: ['Seasonal Trends', 'Growth Patterns', 'Forecasting', 'Market Insights'],
      category: 'Analytics'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and track business goals with automated progress monitoring and alerts.',
      benefits: ['Goal Setting', 'Progress Tracking', 'Performance Alerts', 'Achievement Reports'],
      category: 'Core Features'
    },
    {
      icon: Users,
      title: 'Customer Analytics',
      description: 'Deep insights into customer behavior, preferences, and lifetime value.',
      benefits: ['Customer Segmentation', 'Behavior Analysis', 'Lifetime Value', 'Retention Metrics'],
      category: 'Customer Analytics'
    },
    {
      icon: DollarSign,
      title: 'Financial Reports',
      description: 'Comprehensive financial reporting with profit/loss analysis and cost tracking.',
      benefits: ['P&L Reports', 'Cost Analysis', 'Profit Margins', 'Financial Insights'],
      category: 'Financial Analytics'
    }
  ];

  const analyticsBenefits = [
    'Make data-driven decisions',
    'Identify growth opportunities',
    'Optimize inventory levels',
    'Improve customer targeting',
    'Track business performance',
    'Predict future trends',
    'Reduce operational costs',
    'Increase profitability'
  ];

  const reportTypes = [
    { icon: BarChart3, name: 'Sales Reports', description: 'Daily, weekly, and monthly sales performance' },
    { icon: Users, name: 'Customer Reports', description: 'Customer behavior and segmentation analysis' },
    { icon: Package, name: 'Inventory Reports', description: 'Stock levels and product performance' }
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
              <div className="text-6xl mb-6">📊</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Analytics &
                <span className="text-primary block">
                  Reporting
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transform your business data into actionable insights. Get comprehensive analytics, real-time reporting, and predictive insights to drive growth and optimize operations.
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
                  onClick={() => handleStartDemo('business_admin')}
                >
                  <Eye className="mr-2 w-5 h-5 inline" />
                  Try Analytics Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground">Complete business intelligence solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Analytics</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time business insights and performance tracking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📈 Report Types"
            title="Comprehensive Business Reports"
            description="Get insights from every aspect of your business with detailed analytics"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reportTypes.map((report, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{report.name}</h3>
                <p className="text-muted-foreground text-sm">{report.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🔧 Analytics Features"
            title="Everything You Need for Business Intelligence"
            description="Advanced analytics features designed to drive data-driven decisions"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {analyticsFeatures.map((feature, index) => (
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS Analytics?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our analytics platform provides the insights you need to make informed decisions, 
                optimize operations, and drive business growth through data-driven strategies.
              </p>
              <div className="space-y-4">
                {analyticsBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-6">Analytics Performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Data Processing Speed</span>
                    <span className="text-sm text-muted-foreground">Real-time</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Report Accuracy</span>
                    <span className="text-sm text-muted-foreground">99.9%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Insight Generation</span>
                    <span className="text-sm text-muted-foreground">Automated</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Unlock Your Business Insights?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join businesses already using SCIMS analytics to make data-driven decisions and drive growth.
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
              onClick={() => handleStartDemo('business_admin')}
            >
              <Eye className="mr-2 w-5 h-5 inline" />
              Try Analytics Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
