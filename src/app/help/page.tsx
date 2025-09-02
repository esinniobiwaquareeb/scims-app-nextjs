'use client';

import React, { useState } from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  HelpCircle, 
  BookOpen, 
  Video, 
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      title: 'Getting Started',
      description: 'New to SCIMS? Start here',
      icon: BookOpen,
      articles: 12,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Account & Billing',
      description: 'Manage your subscription and payments',
      icon: FileText,
      articles: 8,
      color: 'text-green-600 bg-green-50 dark:bg-green-950/20'
    },
    {
      title: 'POS System',
      description: 'Point of sale and transaction management',
      icon: MessageCircle,
      articles: 15,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20'
    },
    {
      title: 'Inventory Management',
      description: 'Products, stock, and supplier management',
      icon: FileText,
      articles: 20,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20'
    },
    {
      title: 'Customer Management',
      description: 'CRM, loyalty programs, and communication',
      icon: MessageCircle,
      articles: 10,
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/20'
    },
    {
      title: 'Reports & Analytics',
      description: 'Business insights and reporting',
      icon: FileText,
      articles: 6,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
    }
  ];

  const popularArticles = [
    {
      title: 'How to set up your first store',
      category: 'Getting Started',
      views: '2.5k',
      updated: '2 days ago'
    },
    {
      title: 'Adding products to your inventory',
      category: 'Inventory Management',
      views: '1.8k',
      updated: '1 week ago'
    },
    {
      title: 'Processing your first sale',
      category: 'POS System',
      views: '1.5k',
      updated: '3 days ago'
    },
    {
      title: 'Setting up WhatsApp receipts',
      category: 'Customer Management',
      views: '1.2k',
      updated: '5 days ago'
    },
    {
      title: 'Understanding your sales reports',
      category: 'Reports & Analytics',
      views: '980',
      updated: '1 week ago'
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      responseTime: 'Instant response',
      action: 'Start Chat'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      availability: 'Mon-Fri, 8AM-6PM',
      responseTime: 'Immediate',
      action: 'Call Now'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      availability: '24/7',
      responseTime: 'Within 24 hours',
      action: 'Send Email'
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
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Help Center
            <span className="text-primary block">
              We&apos;re Here to Help
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Find answers to your questions, learn how to use SCIMS effectively, and get support when you need it.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help articles, guides, or solutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Try searching for &quot;setup&quot;, &quot;POS&quot;, &quot;inventory&quot;, or &quot;reports&quot;
          </p>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📚 Help Categories"
            title="Browse by Topic"
            description="Find help articles organized by feature and use case"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {category.articles} articles
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🔥 Popular Articles"
            title="Most Helpful Content"
            description="Articles that other users find most helpful"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded text-xs">
                      {article.category}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.views} views
                    </span>
                    <span>Updated {article.updated}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="💬 Contact Support"
            title="Still Need Help?"
            description="Get in touch with our support team through your preferred method"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <method.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{method.title}</h3>
                  <p className="text-muted-foreground mb-6">{method.description}</p>
                  
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{method.availability}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">{method.responseTime}</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="❓ Quick Answers"
            title="Frequently Asked Questions"
            description="Quick answers to common questions"
            maxWidth="2xl"
          />

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">How do I reset my password?</h3>
                <p className="text-muted-foreground">
                  Click &quot;Forgot Password&quot; on the login page and follow the instructions sent to your email.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Can I use SCIMS offline?</h3>
                <p className="text-muted-foreground">
                  Yes! SCIMS works offline and automatically syncs when you&apos;re back online.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">How do I add more staff members?</h3>
                <p className="text-muted-foreground">
                  Go to Staff Management in your dashboard and click &quot;Add Staff Member&quot; to create new accounts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">What payment methods are supported?</h3>
                <p className="text-muted-foreground">
                  SCIMS supports cash, card payments, mobile money, and bank transfers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
