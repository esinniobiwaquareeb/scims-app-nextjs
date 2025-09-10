'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Mail, 
  Phone, 
  MapPin
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function TermsOfServicePage() {
  const termsSections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      description: 'By accessing and using SCIMS services, you accept and agree to be bound by the terms and provision of this agreement.',
      details: [
        'You must be at least 18 years old to use our services',
        'You agree to comply with all applicable laws and regulations',
        'You are responsible for maintaining the confidentiality of your account',
        'You agree to provide accurate and complete information',
        'You understand that these terms may be updated from time to time'
      ]
    },
    {
      icon: Scale,
      title: 'Service Description',
      description: 'SCIMS provides business management software including point of sale, inventory management, customer management, and related services.',
      details: [
        'Point of sale and transaction processing',
        'Inventory and stock management',
        'Customer relationship management',
        'Business analytics and reporting',
        'Multi-location business support'
      ]
    },
    {
      icon: Shield,
      title: 'User Responsibilities',
      description: 'Users are responsible for their use of the service and must comply with all applicable terms and conditions.',
      details: [
        'Maintain accurate account information',
        'Use the service in compliance with applicable laws',
        'Not attempt to gain unauthorized access to the system',
        'Not use the service for illegal or unauthorized purposes',
        'Report any security breaches or suspicious activity'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Limitation of Liability',
      description: 'SCIMS provides the service "as is" and disclaims all warranties, express or implied, to the maximum extent permitted by law.',
      details: [
        'Service is provided on an "as is" basis',
        'No warranty of merchantability or fitness for a particular purpose',
        'Limitation of liability for indirect or consequential damages',
        'Maximum liability limited to the amount paid for the service',
        'Force majeure events are excluded from liability'
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
            <div className="text-6xl mb-6">📋</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              These Terms of Service govern your use of SCIMS and our services. Please read them carefully before using our platform.
            </p>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {termsSections.map((section, index) => (
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

      {/* Important Information Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="⚠️ Important"
            title="Important Information"
            description="Key points you should know about using SCIMS services"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Service Availability</h3>
              <p className="text-muted-foreground text-sm">
                We strive to maintain 99.9% uptime, but we cannot guarantee uninterrupted service. 
                Scheduled maintenance will be announced in advance.
              </p>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Data Backup</h3>
              <p className="text-muted-foreground text-sm">
                We maintain regular backups of your data, but you are responsible for maintaining 
                your own backups of critical business information.
              </p>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Security</h3>
              <p className="text-muted-foreground text-sm">
                We implement industry-standard security measures to protect your data, 
                but you must also take appropriate security precautions.
              </p>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Updates</h3>
              <p className="text-muted-foreground text-sm">
                These terms may be updated from time to time. We will notify you of any 
                material changes via email or through the service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Questions About Terms?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>legal@scims.com</span>
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
