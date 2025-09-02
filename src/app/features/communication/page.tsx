'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader,
  FeatureCard
} from '@/components/landing';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Video, 
  Users, 
  Bell, 
  CheckCircle2,
  ArrowRight,
  Eye,
  Send,
  FileText,
  Calendar,
  Globe
} from 'lucide-react';

export default function CommunicationFeaturePage() {
  const communicationFeatures = [
    {
      icon: MessageSquare,
      title: 'Internal Messaging',
      description: 'Secure internal messaging system for team communication and collaboration.',
      benefits: ['Team Chat', 'Direct Messages', 'Group Conversations', 'Message History'],
      category: 'Core Features'
    },
    {
      icon: Mail,
      title: 'Email Integration',
      description: 'Seamless email integration for customer communication and notifications.',
      benefits: ['Email Templates', 'Automated Notifications', 'Customer Emails', 'Email Tracking'],
      category: 'Customer Communication'
    },
    {
      icon: Phone,
      title: 'Call Management',
      description: 'Integrated call management with customer history and call tracking.',
      benefits: ['Call Logging', 'Customer History', 'Call Notes', 'Follow-up Reminders'],
      category: 'Customer Communication'
    },
    {
      icon: Video,
      title: 'Video Conferencing',
      description: 'Built-in video conferencing for remote meetings and customer support.',
      benefits: ['Video Calls', 'Screen Sharing', 'Meeting Recording', 'Calendar Integration'],
      category: 'Core Features'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Smart notification system to keep your team informed and responsive.',
      benefits: ['Real-time Alerts', 'Custom Notifications', 'Multi-channel Delivery', 'Notification Preferences'],
      category: 'Core Features'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Enhanced team collaboration tools for better communication and productivity.',
      benefits: ['Team Channels', 'Project Discussions', 'File Sharing', 'Collaboration Tools'],
      category: 'Team Management'
    }
  ];

  const communicationBenefits = [
    'Improve team collaboration',
    'Enhance customer service',
    'Streamline communication',
    'Reduce response times',
    'Centralize communication',
    'Track communication history',
    'Automate notifications',
    'Increase productivity'
  ];

  const communicationTypes = [
    { icon: MessageSquare, name: 'Internal Chat', description: 'Team communication and collaboration' },
    { icon: Mail, name: 'Email Integration', description: 'Customer email management and automation' },
    { icon: Phone, name: 'Call Management', description: 'Phone call tracking and customer history' }
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
              <div className="text-6xl mb-6">💬</div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Communication
                <span className="text-primary block">
                  & Collaboration
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamline communication across your team and with customers. Integrated messaging, email, calls, and collaboration tools to keep everyone connected and productive.
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
                  Try Communication Demo
                </button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Communication Hub</h3>
                    <p className="text-muted-foreground">Complete communication and collaboration solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Communication</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time messaging and collaboration tools
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communication Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💬 Communication Types"
            title="Multiple Communication Channels"
            description="Connect with your team and customers through various communication methods"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communicationTypes.map((type, index) => (
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
            badge="🔧 Communication Features"
            title="Everything You Need for Team Communication"
            description="Comprehensive communication features designed for modern businesses"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communicationFeatures.map((feature, index) => (
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
              <h2 className="text-3xl font-bold mb-6">Why Choose SCIMS Communication?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our communication tools help you stay connected with your team and customers, 
                improving collaboration, customer service, and overall business efficiency.
              </p>
              <div className="space-y-4">
                {communicationBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-sm border">
              <h3 className="text-2xl font-bold mb-6">Communication Performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm text-muted-foreground">2.3s avg</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Message Delivery</span>
                    <span className="text-sm text-muted-foreground">99.9%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Team Collaboration</span>
                    <span className="text-sm text-muted-foreground">85% Improvement</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
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
            Ready to Improve Your Communication?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join businesses already using SCIMS to streamline communication and enhance collaboration.
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
              Try Communication Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
