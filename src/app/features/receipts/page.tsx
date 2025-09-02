'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
import { 
  Receipt, 
  Printer, 
  Smartphone, 
  Mail, 
  FileText, 
  Settings, 
  CheckCircle2,
  ArrowRight,
  Eye,
  Download,
  Share,
  QrCode,
  CreditCard
} from 'lucide-react';

export default function ReceiptsFeaturePage() {
  const receiptFeatures = [
    {
      icon: Receipt,
      title: 'Digital Receipts',
      description: 'Generate and send digital receipts instantly via email or SMS.',
      benefits: ['Instant Delivery', 'Email Receipts', 'SMS Receipts', 'Digital Storage'],
      category: 'Core Features'
    },
    {
      icon: Printer,
      title: 'Print Receipts',
      description: 'Print receipts on thermal printers with customizable templates.',
      benefits: ['Thermal Printing', 'Custom Templates', 'Print Queue', 'Printer Management'],
      category: 'Core Features'
    },
    {
      icon: FileText,
      title: 'Receipt Templates',
      description: 'Customize receipt templates with your branding and business information.',
      benefits: ['Custom Branding', 'Logo Integration', 'Business Info', 'Template Library'],
      category: 'Customization'
    },
    {
      icon: QrCode,
      title: 'QR Code Integration',
      description: 'Add QR codes to receipts for easy access to digital copies and promotions.',
      benefits: ['QR Code Generation', 'Digital Access', 'Promotional Codes', 'Customer Engagement'],
      category: 'Core Features'
    },
    {
      icon: Share,
      title: 'Receipt Sharing',
      description: 'Allow customers to easily share receipts and access them later.',
      benefits: ['Social Sharing', 'Receipt History', 'Customer Portal', 'Access Control'],
      category: 'Customer Experience'
    },
    {
      icon: Settings,
      title: 'Receipt Management',
      description: 'Comprehensive receipt management with search, filtering, and reporting.',
      benefits: ['Receipt Search', 'Filter Options', 'Receipt Reports', 'Data Export'],
      category: 'Management'
    }
  ];

  const receiptBenefits = [
    'Reduce paper waste',
    'Improve customer experience',
    'Faster checkout process',
    'Better record keeping',
    'Enhanced branding',
    'Cost savings',
    'Easy access to receipts',
    'Environmental friendly'
  ];

  const receiptTypes = [
    { icon: Receipt, name: 'Digital Receipts', description: 'Email and SMS receipt delivery' },
    { icon: Printer, name: 'Printed Receipts', description: 'Thermal printer receipt printing' },
    { icon: Smartphone, name: 'Mobile Receipts', description: 'Mobile-optimized receipt viewing' }
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
              <div className="text-6xl mb-6">🧾</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Receipt
                <span className="text-primary block">
                  Management
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamline receipt generation and management with digital and printed options. Customize templates, integrate QR codes, and provide customers with easy access to their purchase records.
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
                  onClick={() => handleStartDemo('cashier')}
                >
                  <Eye className="mr-2 w-5 h-5 inline" />
                  Try Receipt Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Receipt System</h3>
                    <p className="text-muted-foreground">Complete receipt management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Receipt Generation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time receipt creation and delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Receipt Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🧾 Receipt Types"
            title="Multiple Receipt Options"
            description="Choose the receipt format that works best for your business and customers"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {receiptTypes.map((type, index) => (
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
            badge="🔧 Receipt Features"
            title="Everything You Need for Receipt Management"
            description="Comprehensive receipt features designed for modern businesses"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {receiptFeatures.map((feature, index) => (
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
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS Receipt Management?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our receipt management system helps you provide better customer service, reduce costs, 
                and maintain professional records while being environmentally friendly.
              </p>
              <div className="space-y-4">
                {receiptBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-6">Receipt Performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Generation Speed</span>
                    <span className="text-sm text-muted-foreground">0.5s avg</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Delivery Success</span>
                    <span className="text-sm text-muted-foreground">99.8%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.8%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cost Savings</span>
                    <span className="text-sm text-muted-foreground">60%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
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
            Ready to Modernize Your Receipts?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join businesses already using SCIMS to streamline receipt management and improve customer experience.
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
              onClick={() => handleStartDemo('cashier')}
            >
              <Eye className="mr-2 w-5 h-5 inline" />
              Try Receipt Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
