'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Server, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Mail, 
  Phone, 
  MapPin,
  Zap,
  Globe,
  FileText
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All data is encrypted in transit and at rest using industry-standard encryption protocols.',
      details: [
        'AES-256 encryption for data at rest',
        'TLS 1.3 for data in transit',
        'End-to-end encryption for sensitive data',
        'Regular encryption key rotation'
      ]
    },
    {
      icon: Shield,
      title: 'Access Control',
      description: 'Multi-layered access control with role-based permissions and authentication.',
      details: [
        'Role-based access control (RBAC)',
        'Multi-factor authentication (MFA)',
        'Single sign-on (SSO) support',
        'Session management and timeout'
      ]
    },
    {
      icon: Database,
      title: 'Data Protection',
      description: 'Comprehensive data protection measures to ensure your information is secure.',
      details: [
        'Regular automated backups',
        'Data loss prevention (DLP)',
        'Privacy by design principles',
        'GDPR and CCPA compliance'
      ]
    },
    {
      icon: Server,
      title: 'Infrastructure Security',
      description: 'Secure infrastructure with regular security audits and monitoring.',
      details: [
        'Secure cloud infrastructure',
        'Regular security audits',
        '24/7 security monitoring',
        'Incident response procedures'
      ]
    }
  ];

  const complianceStandards = [
    {
      name: 'SOC 2 Type II',
      description: 'Security, availability, and confidentiality controls',
      status: 'Certified'
    },
    {
      name: 'ISO 27001',
      description: 'Information security management system',
      status: 'Certified'
    },
    {
      name: 'GDPR',
      description: 'General Data Protection Regulation compliance',
      status: 'Compliant'
    },
    {
      name: 'CCPA',
      description: 'California Consumer Privacy Act compliance',
      status: 'Compliant'
    }
  ];

  const securityBenefits = [
    'Bank-level encryption',
    'Regular security audits',
    'Compliance certifications',
    '24/7 monitoring',
    'Data backup and recovery',
    'Access control management',
    'Incident response team',
    'Privacy protection'
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
              Security &
              <span className="text-primary block">
                Compliance
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Your data security is our top priority. SCIMS implements enterprise-grade security measures and maintains compliance with industry standards to protect your business information.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
                onClick={handleGetStarted}
              >
                Start Secure Trial
              </button>
              <button 
                className="border border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-lg"
                onClick={() => window.open('/docs/security', '_blank')}
              >
                <FileText className="mr-2 w-5 h-5 inline" />
                Security Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🛡️ Security Features"
            title="Enterprise-Grade Security"
            description="Comprehensive security measures to protect your data and business"
            maxWidth="3xl"
          />

          <div className="space-y-8">
            {securityFeatures.map((feature, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{feature.title}</h2>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <ul className="space-y-3">
                      {feature.details.map((detail, detailIndex) => (
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

      {/* Compliance Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📋 Compliance"
            title="Industry Standards & Certifications"
            description="We maintain compliance with leading security and privacy standards"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-sm border text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{standard.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{standard.description}</p>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {standard.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS Security?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our security-first approach ensures your business data is protected with enterprise-grade 
                security measures and compliance with industry standards.
              </p>
              <div className="space-y-4">
                {securityBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Security Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Data Encryption</span>
                    <span className="text-sm text-muted-foreground">AES-256</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Security Audits</span>
                    <span className="text-sm text-muted-foreground">Quarterly</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm text-muted-foreground">99.9%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Security Notice</h3>
                <p className="text-blue-700 text-sm">
                  If you discover a security vulnerability in SCIMS, please report it to our security team at 
                  <a href="mailto:security@scims.com" className="underline ml-1">security@scims.com</a>. 
                  We take security seriously and will respond promptly to all reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Security Questions?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Contact our security team for questions about our security measures and compliance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>security@scims.com</span>
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
