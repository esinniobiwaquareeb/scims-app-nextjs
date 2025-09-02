'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function SupportPage() {
  const supportOptions = [
    {
      icon: MessageSquare,
      title: 'Live Chat Support',
      description: 'Get instant help from our support team through live chat.',
      availability: '24/7 Available',
      responseTime: 'Average response: 2 minutes',
      features: ['Instant responses', 'Screen sharing', 'File sharing', 'Chat history']
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support specialists for complex issues.',
      availability: 'Mon-Fri 9AM-6PM EST',
      responseTime: 'Immediate connection',
      features: ['Direct phone line', 'Expert technicians', 'Remote assistance', 'Follow-up calls']
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed questions and receive comprehensive responses.',
      availability: '24/7 Available',
      responseTime: 'Response within 4 hours',
      features: ['Detailed responses', 'File attachments', 'Issue tracking', 'Email history']
    }
  ];

  const supportResources = [
    {
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Comprehensive guides and tutorials for all SCIMS features.',
      link: '/docs',
      features: ['Step-by-step guides', 'Video tutorials', 'FAQ sections', 'Best practices']
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch detailed video tutorials to learn SCIMS features.',
      link: '/training',
      features: ['Feature walkthroughs', 'Setup guides', 'Advanced tips', 'Webinar recordings']
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Technical documentation and API references.',
      link: '/docs',
      features: ['API documentation', 'Technical specs', 'Integration guides', 'Developer resources']
    }
  ];

  const supportStats = [
    { label: 'Customer Satisfaction', value: '98%', icon: Star },
    { label: 'Average Response Time', value: '2 min', icon: Zap },
    { label: 'Support Team Size', value: '50+', icon: Users },
    { label: 'Uptime Guarantee', value: '99.9%', icon: Shield }
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
            <div className="text-6xl mb-6">🆘</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Support Center
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Get the help you need, when you need it. Our dedicated support team is here to ensure your success with SCIMS.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
                onClick={() => window.open('mailto:support@scims.app', '_blank')}
              >
                Contact Support
                <ArrowRight className="ml-2 w-5 h-5 inline" />
              </button>
              <button 
                className="border border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-lg"
                onClick={() => window.open('/docs', '_blank')}
              >
                <BookOpen className="mr-2 w-5 h-5 inline" />
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {supportStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💬 Support Options"
            title="How Can We Help You?"
            description="Choose the support method that works best for you"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{option.availability}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{option.responseTime}</span>
                    </div>
                  </div>

                  <ul className="space-y-1 mb-4">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                    Get Support
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Support Resources */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📚 Resources"
            title="Self-Service Resources"
            description="Find answers and learn at your own pace"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportResources.map((resource, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <resource.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                  
                  <ul className="space-y-1 mb-4">
                    {resource.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className="w-full border border-primary text-primary py-2 px-4 rounded-lg hover:bg-primary/10 transition-colors duration-200"
                    onClick={() => window.open(resource.link, '_blank')}
                  >
                    Access Resource
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Need immediate assistance? Contact our support team directly.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-muted-foreground text-sm">support@scims.app</p>
                <button 
                  className="text-primary hover:underline"
                  onClick={() => window.open('mailto:support@scims.app', '_blank')}
                >
                  Send Email
                </button>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
                <button 
                  className="text-primary hover:underline"
                  onClick={() => window.open('tel:+15551234567', '_blank')}
                >
                  Call Now
                </button>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-muted-foreground text-sm">Available 24/7</p>
                <button className="text-primary hover:underline">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
