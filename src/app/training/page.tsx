'use client';

import React from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { 
  BookOpen, 
  Video, 
  Users, 
  Award, 
  Clock, 
  CheckCircle2, 
  Play,
  Download,
  Star,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function TrainingPage() {
  const trainingPrograms = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of SCIMS and get up and running quickly.',
      duration: '2 hours',
      level: 'Beginner',
      format: 'Self-paced',
      features: ['Basic navigation', 'Account setup', 'Initial configuration', 'First transactions']
    },
    {
      icon: Video,
      title: 'Advanced Features',
      description: 'Master advanced features and optimize your business operations.',
      duration: '4 hours',
      level: 'Intermediate',
      format: 'Video + Hands-on',
      features: ['Advanced analytics', 'Custom workflows', 'Integration setup', 'Performance optimization']
    },
    {
      icon: Users,
      title: 'Team Training',
      description: 'Comprehensive training for your entire team with role-specific modules.',
      duration: '8 hours',
      level: 'All Levels',
      format: 'Live Sessions',
      features: ['Role-based training', 'Team collaboration', 'Best practices', 'Q&A sessions']
    },
    {
      icon: Award,
      title: 'Certification Program',
      description: 'Become a certified SCIMS expert with our comprehensive certification program.',
      duration: '16 hours',
      level: 'Advanced',
      format: 'Blended Learning',
      features: ['Comprehensive curriculum', 'Practical assessments', 'Certification exam', 'Ongoing support']
    }
  ];

  const trainingResources = [
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all SCIMS features',
      count: '50+ videos',
      duration: '10+ hours'
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Comprehensive written guides and API documentation',
      count: '200+ articles',
      duration: 'Always updated'
    },
    {
      icon: Users,
      title: 'Webinars',
      description: 'Live training sessions with SCIMS experts',
      count: 'Monthly sessions',
      duration: '1-2 hours each'
    },
    {
      icon: Download,
      title: 'Resources',
      description: 'Downloadable guides, templates, and checklists',
      count: '100+ resources',
      duration: 'Free access'
    }
  ];

  const trainingBenefits = [
    'Faster onboarding',
    'Reduced support tickets',
    'Increased productivity',
    'Better user adoption',
    'Optimized workflows',
    'Certified expertise',
    'Ongoing support',
    'Best practices'
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
            <div className="text-6xl mb-6">🎓</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Training &
              <span className="text-primary block">
                Education
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Master SCIMS with our comprehensive training programs. From beginner basics to advanced certification, we provide the education you need to succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-lg"
                onClick={handleGetStarted}
              >
                Start Learning
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

      {/* Training Programs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📚 Training Programs"
            title="Comprehensive Learning Paths"
            description="Choose the training program that fits your needs and skill level"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainingPrograms.map((program, index) => (
              <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                <div className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <program.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {program.level}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {program.format}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{program.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{program.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{program.duration}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-1 mb-4">
                    {program.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                    Start Program
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Training Resources */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📖 Resources"
            title="Learning Resources"
            description="Access a wealth of training materials and resources"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainingResources.map((resource, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <resource.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{resource.description}</p>
                <div className="text-sm text-muted-foreground">
                  <div>{resource.count}</div>
                  <div>{resource.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Invest in Training?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Proper training ensures your team gets the most out of SCIMS, leading to increased 
                productivity, better user adoption, and optimized business processes.
              </p>
              <div className="space-y-4">
                {trainingBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Training Success Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">User Adoption Rate</span>
                    <span className="text-sm text-muted-foreground">95%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Productivity Increase</span>
                    <span className="text-sm text-muted-foreground">40%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Support Ticket Reduction</span>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of users who have successfully mastered SCIMS through our training programs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-10 py-6 rounded-lg hover:bg-primary/90 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
              onClick={handleGetStarted}
            >
              Start Free Training
            </button>
            <button 
              className="border-2 border-primary text-primary px-10 py-6 rounded-lg hover:bg-primary/10 transition-all duration-300 text-lg"
              onClick={() => window.open('/docs', '_blank')}
            >
              <BookOpen className="mr-2 w-5 h-5 inline" />
              Browse Resources
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Need Custom Training?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Contact our training team for custom training programs tailored to your business needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>training@scims.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+1 (555) 123-4567</span>
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
