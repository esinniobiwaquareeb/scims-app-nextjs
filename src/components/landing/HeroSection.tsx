import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, MousePointer } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import Image from 'next/image';

export interface HeroSectionProps {
  onGetStarted?: () => void;
  onStartDemo?: (demoType: string) => void;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onStartDemo,
  className = ''
}) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/auth/register';
    }
  };

  const handleStartDemo = () => {
    if (onStartDemo) {
      onStartDemo('store_admin');
    } else {
      window.location.href = '/demo?type=store_admin';
    }
  };

  return (
    <section className={`relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}>
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content - Hero text and CTA */}
          <div className="text-center lg:text-left space-y-6">
            <AnimatedSection animation="fadeUp" delay={0.1}>
              <Badge variant="secondary" className="mb-4">
                🎁 FREE Professional Website Included
              </Badge>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.2}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Complete Business Management
                <span className="text-primary block mt-2">
                  + FREE Website
                </span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.3}>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                POS, inventory, analytics, and a professional online store—all in one platform. 
                Start selling online 24/7 with your free website included.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-6 shadow-lg hover:shadow-xl transition-all" 
                  onClick={handleGetStarted}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-6 border-2"
                  onClick={handleStartDemo}
                >
                  <MousePointer className="mr-2 w-5 h-5" />
                  View Demo
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.5}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-muted-foreground pt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Works offline</span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right content - Single dashboard image */}
          <div className="lg:pl-8">
            <AnimatedSection animation="fadeUp" delay={0.3}>
              <div className="relative w-full aspect-video rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <Image
                  src="https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/business-admin-dashboard.png"
                  alt="SCIMS Business Dashboard"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
        
        {/* Stats - Simplified */}
        <AnimatedSection animation="fadeUp" delay={0.6} className="mt-12 sm:mt-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                4,200+
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Businesses</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                ₦1.5B+
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Revenue Processed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                45%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg. Sales Increase</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                ₦500K
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Website Value FREE</div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
