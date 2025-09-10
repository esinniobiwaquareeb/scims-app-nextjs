'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function PrivacyPolicyPage() {
  const privacySections = [
    {
      icon: Info,
      title: 'Information We Collect',
      description: 'We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.',
      details: [
        'Account information (name, email, phone number)',
        'Business information (company name, address, business type)',
        'Payment information (processed securely through third-party providers)',
        'Usage data (how you interact with our services)',
        'Device information (IP address, browser type, operating system)'
      ]
    },
    {
      icon: Shield,
      title: 'How We Use Your Information',
      description: 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.',
      details: [
        'Provide and maintain our services',
        'Process transactions and send related information',
        'Send technical notices and support messages',
        'Respond to your comments and questions',
        'Improve our services and develop new features'
      ]
    },
    {
      icon: Lock,
      title: 'Information Security',
      description: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      details: [
        'Encryption of data in transit and at rest',
        'Regular security audits and assessments',
        'Access controls and authentication measures',
        'Secure data centers with physical security',
        'Employee training on data protection'
      ]
    },
    {
      icon: Database,
      title: 'Data Sharing and Disclosure',
      description: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.',
      details: [
        'Service providers who assist in our operations',
        'Legal requirements and law enforcement',
        'Business transfers (mergers, acquisitions)',
        'With your explicit consent',
        'Aggregated, non-personally identifiable information'
      ]
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

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This Privacy Policy explains how SCIMS collects, uses, and protects your personal information when you use our services.
            </p>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {privacySections.map((section, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <section.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <ul className="space-y-3">
                      {section.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Your Rights Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="👤 Your Rights"
            title="Your Privacy Rights"
            description="You have certain rights regarding your personal information under applicable privacy laws"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Access Your Data</h3>
              <p className="text-muted-foreground text-sm">Request access to the personal information we hold about you.</p>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Update Your Data</h3>
              <p className="text-muted-foreground text-sm">Correct or update your personal information at any time.</p>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Your Data</h3>
              <p className="text-muted-foreground text-sm">Request deletion of your personal information from our systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Questions About Privacy?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>privacy@scims.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+234 815 464 4324</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>123 Business St, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
