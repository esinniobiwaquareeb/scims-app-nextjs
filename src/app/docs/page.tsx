'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download, 
  ExternalLink,
  Search,
  ArrowRight
} from 'lucide-react';

export default function DocsPage() {
  const documentationSections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of SCIMS and set up your first business',
      icon: BookOpen,
      articles: [
        'Quick Start Guide',
        'Business Type Setup',
        'First Store Configuration',
        'Adding Your First Products',
        'Setting Up Staff Accounts'
      ]
    },
    {
      title: 'Point of Sale',
      description: 'Master the POS system for efficient sales processing',
      icon: FileText,
      articles: [
        'POS Interface Overview',
        'Processing Sales',
        'Payment Methods',
        'Receipt Management',
        'Offline Mode Usage'
      ]
    },
    {
      title: 'Inventory Management',
      description: 'Manage your products, stock, and suppliers effectively',
      icon: FileText,
      articles: [
        'Product Catalog Setup',
        'Stock Tracking',
        'Low Stock Alerts',
        'Supplier Management',
        'Purchase Orders'
      ]
    },
    {
      title: 'Customer Management',
      description: 'Build and maintain customer relationships',
      icon: FileText,
      articles: [
        'Customer Database',
        'Loyalty Programs',
        'Communication Tools',
        'Customer Analytics',
        'Marketing Campaigns'
      ]
    },
    {
      title: 'Reports & Analytics',
      description: 'Understand your business performance with detailed reports',
      icon: FileText,
      articles: [
        'Sales Reports',
        'Inventory Reports',
        'Customer Analytics',
        'Financial Reports',
        'Custom Report Builder'
      ]
    },
    {
      title: 'Multi-Store Management',
      description: 'Manage multiple locations from a single dashboard',
      icon: FileText,
      articles: [
        'Store Setup',
        'Cross-Store Inventory',
        'Centralized Reporting',
        'Staff Management',
        'Regional Settings'
      ]
    }
  ];

  const videoTutorials = [
    {
      title: 'SCIMS Overview',
      duration: '5:30',
      description: 'Complete overview of SCIMS features and capabilities'
    },
    {
      title: 'Setting Up Your First Store',
      duration: '8:15',
      description: 'Step-by-step guide to configuring your first store'
    },
    {
      title: 'POS System Tutorial',
      duration: '12:45',
      description: 'Learn how to use the Point of Sale system effectively'
    },
    {
      title: 'Inventory Management',
      duration: '10:20',
      description: 'Master inventory tracking and management features'
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
            SCIMS Documentation
            <span className="text-primary block">
              Everything You Need to Know
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Comprehensive guides, tutorials, and resources to help you get the most out of SCIMS for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
              onClick={handleGetStarted}
            >
              Start Free Trial
            </button>
            <button 
              className="border border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-lg"
              onClick={() => handleStartDemo('store_admin')}
            >
              Try Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-4 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📚 Documentation"
            title="Comprehensive Guides"
            description="Browse our detailed documentation organized by feature and use case"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documentationSections.map((section, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                        <span className="text-sm">{article}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Articles
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🎥 Video Tutorials"
            title="Learn with Video Guides"
            description="Watch step-by-step video tutorials to master SCIMS features"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{video.title}</h3>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4">{video.description}</p>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4 mr-2" />
                        Watch Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="🚀 Quick Start"
            title="Get Started in 5 Minutes"
            description="Follow this quick start guide to set up your first SCIMS store"
            maxWidth="2xl"
          />

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Create Your Account</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign up for a free trial and choose your business type during registration.
                    </p>
                    <Button size="sm" onClick={handleGetStarted}>
                      Start Free Trial
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Set Up Your Store</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure your store details, currency, and basic settings.
                    </p>
                    <Button variant="outline" size="sm">
                      View Setup Guide
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Add Your Products</h3>
                    <p className="text-muted-foreground mb-4">
                      Import your product catalog or add products manually.
                    </p>
                    <Button variant="outline" size="sm">
                      Product Import Guide
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Start Selling</h3>
                    <p className="text-muted-foreground mb-4">
                      Begin processing sales with the POS system and send receipts to customers.
                    </p>
                    <Button variant="outline" size="sm">
                      POS Tutorial
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Download Resources */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            badge="📥 Downloads"
            title="Additional Resources"
            description="Download helpful resources to support your SCIMS journey"
            maxWidth="2xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Download className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Manual</h3>
                <p className="text-muted-foreground mb-4">Complete user manual in PDF format</p>
                <Button variant="outline" size="sm">
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
                <p className="text-muted-foreground mb-4">Technical documentation for developers</p>
                <Button variant="outline" size="sm">
                  View API Docs
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
                <p className="text-muted-foreground mb-4">Industry best practices and tips</p>
                <Button variant="outline" size="sm">
                  Download Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
