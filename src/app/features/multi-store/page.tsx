'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
import { 
  Store, 
  Building, 
  MapPin, 
  Users, 
  BarChart3, 
  Settings, 
  CheckCircle2,
  ArrowRight,
  Eye,
  Globe,
  Database,
  Zap,
  Shield
} from 'lucide-react';

export default function MultiStoreFeaturePage() {
  const multiStoreFeatures = [
    {
      icon: Store,
      title: 'Multi-Location Management',
      description: 'Manage multiple store locations from a single dashboard with centralized control.',
      benefits: ['Centralized Dashboard', 'Location Overview', 'Store Performance', 'Unified Management'],
      category: 'Core Features'
    },
    {
      icon: Building,
      title: 'Store Hierarchy',
      description: 'Organize stores in a hierarchical structure with regional and district management.',
      benefits: ['Regional Management', 'District Oversight', 'Store Grouping', 'Hierarchical Reports'],
      category: 'Core Features'
    },
    {
      icon: MapPin,
      title: 'Location-Based Analytics',
      description: 'Get location-specific insights and performance metrics for each store.',
      benefits: ['Location Analytics', 'Performance Metrics', 'Comparative Analysis', 'Regional Insights'],
      category: 'Analytics'
    },
    {
      icon: Users,
      title: 'Multi-Store Staff',
      description: 'Manage staff across multiple locations with role-based access and permissions.',
      benefits: ['Cross-Location Staff', 'Role Management', 'Access Control', 'Staff Scheduling'],
      category: 'Staff Management'
    },
    {
      icon: BarChart3,
      title: 'Consolidated Reporting',
      description: 'Generate comprehensive reports across all locations with drill-down capabilities.',
      benefits: ['Consolidated Reports', 'Drill-Down Analysis', 'Cross-Store Comparison', 'Executive Dashboards'],
      category: 'Analytics'
    },
    {
      icon: Settings,
      title: 'Centralized Configuration',
      description: 'Configure settings, policies, and procedures across all locations from one place.',
      benefits: ['Centralized Settings', 'Policy Management', 'Configuration Templates', 'Bulk Updates'],
      category: 'Core Features'
    }
  ];

  const multiStoreBenefits = [
    'Centralized management',
    'Improved oversight',
    'Better resource allocation',
    'Consistent operations',
    'Enhanced reporting',
    'Streamlined processes',
    'Cost optimization',
    'Scalable growth'
  ];

  const storeTypes = [
    { icon: Store, name: 'Retail Stores', description: 'Manage multiple retail locations' },
    { icon: Building, name: 'Restaurant Chains', description: 'Oversee restaurant operations' },
    { icon: MapPin, name: 'Service Centers', description: 'Coordinate service locations' }
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
              <div className="text-6xl mb-6">🏢</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Multi-Store
                <span className="text-primary block">
                  Management
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Scale your business across multiple locations with centralized management. Control inventory, staff, and operations across all your stores from one powerful platform.
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
                  onClick={() => handleStartDemo('super_admin')}
                >
                  <Eye className="mr-2 w-5 h-5 inline" />
                  Try Multi-Store Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Store className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Multi-Store Dashboard</h3>
                    <p className="text-muted-foreground">Complete multi-location management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Multi-Store Management</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time oversight across all locations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🏪 Store Types"
            title="Support for Various Business Models"
            description="Manage different types of stores and locations with specialized features"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {storeTypes.map((type, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
                <p className="text-muted-foreground text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🔧 Multi-Store Features"
            title="Everything You Need for Multi-Location Success"
            description="Comprehensive features designed for businesses with multiple locations"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {multiStoreFeatures.map((feature, index) => (
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
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS Multi-Store?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our multi-store management system helps you maintain consistency across locations, 
                optimize operations, and scale your business efficiently.
              </p>
              <div className="space-y-4">
                {multiStoreBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-6">Multi-Store Performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Operational Efficiency</span>
                    <span className="text-sm text-muted-foreground">90%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cost Reduction</span>
                    <span className="text-sm text-muted-foreground">35%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Management Efficiency</span>
                    <span className="text-sm text-muted-foreground">75%</span>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Scale Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join businesses already using SCIMS to manage multiple locations and drive growth.
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
              onClick={() => handleStartDemo('super_admin')}
            >
              <Eye className="mr-2 w-5 h-5 inline" />
              Try Multi-Store Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
