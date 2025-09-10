'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { 
  Cookie, 
  Settings, 
  Shield, 
  Eye, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Mail, 
  Phone, 
  MapPin
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      icon: Settings,
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off in our systems.',
      purpose: 'Website functionality, security, and user authentication',
      examples: ['Session management', 'Security tokens', 'User preferences', 'Shopping cart'],
      required: true
    },
    {
      icon: Eye,
      title: 'Analytics Cookies',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
      purpose: 'Website performance analysis and improvement',
      examples: ['Page views', 'User behavior', 'Traffic sources', 'Performance metrics'],
      required: false
    },
    {
      icon: Database,
      title: 'Functional Cookies',
      description: 'These cookies enable enhanced functionality and personalization, such as videos and live chat.',
      purpose: 'Enhanced user experience and personalization',
      examples: ['Language preferences', 'Region settings', 'Chat functionality', 'Video players'],
      required: false
    }
  ];

  const cookieBenefits = [
    'Improved website performance',
    'Personalized user experience',
    'Enhanced security features',
    'Better content recommendations',
    'Faster page loading times',
    'Remembered preferences',
    'Analytics for improvement',
    'Customized content delivery'
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
            <div className="text-6xl mb-6">🍪</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Cookie Policy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              This Cookie Policy explains how SCIMS uses cookies and similar technologies to enhance your experience on our website and services.
            </p>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🍪 Cookie Types"
            title="Types of Cookies We Use"
            description="We use different types of cookies to provide and improve our services"
            maxWidth="3xl"
          />

          <div className="space-y-8">
            {cookieTypes.map((cookie, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="bg-background rounded-xl p-6 shadow-sm border">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <cookie.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{cookie.title}</h3>
                        {cookie.required && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                        {!cookie.required && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{cookie.description}</p>
                      <p className="text-sm font-medium mb-2">Purpose: {cookie.purpose}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Examples:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {cookie.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Cookie Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="✅ Benefits"
            title="How Cookies Benefit You"
            description="Cookies help us provide a better experience for all users"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cookieBenefits.map((benefit, index) => (
              <div key={index} className="bg-background rounded-xl p-4 shadow-sm border">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cookie Management Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="⚙️ Management"
            title="Managing Your Cookie Preferences"
            description="You have control over how cookies are used on our website"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Browser Settings</h3>
              <p className="text-muted-foreground text-sm mb-4">
                You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete them.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chrome: Settings &gt; Privacy and security &gt; Cookies</li>
                <li>• Firefox: Options &gt; Privacy & Security &gt; Cookies</li>
                <li>• Safari: Preferences &gt; Privacy &gt; Cookies</li>
                <li>• Edge: Settings &gt; Cookies and site permissions</li>
              </ul>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
              <p className="text-muted-foreground text-sm mb-4">
                When you first visit our website, you&apos;ll see a cookie consent banner where you can choose your preferences.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Accept all cookies</li>
                <li>• Reject non-essential cookies</li>
                <li>• Customize your preferences</li>
                <li>• Change settings anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
                <p className="text-yellow-700 text-sm">
                  Disabling certain cookies may affect the functionality of our website and services. 
                  Essential cookies are required for the website to function properly and cannot be disabled.
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
            <h2 className="text-3xl font-bold mb-6">Questions About Cookies?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you have any questions about our use of cookies, please contact us.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>privacy@scims.app</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+234 815 464 4324</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>123 Business St, Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
