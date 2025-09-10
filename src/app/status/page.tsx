'use client';

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Footer, 
  SectionHeader
} from '@/components/landing';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Server, 
  Database, 
  Globe, 
  Shield,
  Activity,
  Zap,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

export default function StatusPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const systemStatus = [
    {
      name: 'API Services',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '45ms',
      icon: Server,
      description: 'Core API endpoints and services'
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.8%',
      responseTime: '12ms',
      icon: Database,
      description: 'Primary database and data storage'
    },
    {
      name: 'Authentication',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '23ms',
      icon: Shield,
      description: 'User authentication and authorization'
    },
    {
      name: 'Payment Processing',
      status: 'operational',
      uptime: '99.7%',
      responseTime: '156ms',
      icon: Zap,
      description: 'Payment gateway and transaction processing'
    },
    {
      name: 'File Storage',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '89ms',
      icon: Globe,
      description: 'File upload and storage services'
    },
    {
      name: 'Email Services',
      status: 'operational',
      uptime: '99.6%',
      responseTime: '234ms',
      icon: Mail,
      description: 'Email delivery and notifications'
    }
  ];

  const recentIncidents = [
    {
      date: '2024-01-15',
      title: 'Scheduled Maintenance',
      status: 'resolved',
      description: 'Planned maintenance window for database optimization',
      duration: '2 hours'
    },
    {
      date: '2024-01-10',
      title: 'API Rate Limiting',
      status: 'resolved',
      description: 'Temporary rate limiting due to high traffic',
      duration: '30 minutes'
    },
    {
      date: '2024-01-05',
      title: 'Payment Gateway Issue',
      status: 'resolved',
      description: 'Third-party payment gateway connectivity issue',
      duration: '1 hour'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'outage':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircle2;
      case 'degraded':
        return AlertTriangle;
      case 'outage':
        return XCircle;
      default:
        return Clock;
    }
  };

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
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              System Status
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time status of SCIMS services and infrastructure. We monitor our systems 24/7 to ensure optimal performance.
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All Systems Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="🔧 System Status"
            title="Service Status Overview"
            description="Current status of all SCIMS services and components"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemStatus.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                  <div className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{service.uptime}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">{service.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📋 Recent Incidents"
            title="Incident History"
            description="Recent incidents and maintenance activities"
            maxWidth="3xl"
          />

          <div className="space-y-4">
            {recentIncidents.map((incident, index) => {
              const StatusIcon = getStatusIcon(incident.status);
              return (
                <AnimatedSection key={index} animation="fadeUp" delay={index * 0.1}>
                  <div className="bg-background rounded-xl p-6 shadow-sm border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <StatusIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{incident.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                              {incident.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{incident.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Date: {incident.date}</span>
                            <span>Duration: {incident.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="📈 Performance"
            title="Performance Metrics"
            description="Key performance indicators and system health metrics"
            maxWidth="3xl"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background rounded-xl p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Overall Uptime</div>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold mb-1">45ms</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Server className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold mb-1">6</div>
              <div className="text-sm text-muted-foreground">Services Monitored</div>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Report an Issue</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you&apos;re experiencing issues not reflected in our status page, please contact our support team.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>support@scims.com</span>
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
