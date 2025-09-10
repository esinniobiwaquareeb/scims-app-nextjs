import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Eye, MousePointer } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedSection } from './AnimatedSection';

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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/auth/register';
    }
  };

  const handleStartDemo = (demoType: string) => {
    if (onStartDemo) {
      onStartDemo(demoType);
    } else {
      window.location.href = `/demo?type=${demoType}`;
    }
  };

  return (
    <section className={`relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0 bg-muted/20"
        style={{ y }}
      />
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <AnimatedSection animation="fadeUp" delay={0.2}>
              <Badge variant="secondary" className="mb-6">
                🎉 NEW: Get Your FREE Professional Website + Complete Business Management
              </Badge>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.4}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Everything Your Business Needs
                <span className="text-primary block">
                  + FREE Website Included
                </span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.6}>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                <strong>Stop paying for separate systems!</strong> Get complete business management (POS, inventory, analytics) 
                PLUS a professional online store that works 24/7. From retail to restaurants - everything in one platform.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.7}>
              <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span><strong>FREE Website</strong> (Worth ₦500,000)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Works offline</span>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                  onClick={handleGetStarted}
                >
                  Get FREE Website + Start Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 border-2 hover:bg-muted/50"
                  onClick={() => handleStartDemo('store_admin')}
                >
                  <MousePointer className="mr-2 w-5 h-5" />
                  See Live Demo
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={1.0}>
              <p className="text-sm text-muted-foreground">
                🎁 FREE ₦500,000 Website • No payment required • 14-day trial • Works offline
              </p>
            </AnimatedSection>
          </div>

          <div className="lg:pl-8">
            <AnimatedSection animation="fadeUp" delay={0.6}>
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">SCIMS Dashboard</h3>
                    <p className="text-muted-foreground">Complete business management solution</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Dashboard</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time business insights across all industries
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
        
        <AnimatedSection animation="fadeUp" delay={1.2} className="mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                4,200+
              </div>
              <div className="text-muted-foreground">Businesses Growing</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                ₦1,500M+
              </div>
              <div className="text-muted-foreground">Revenue Generated</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                45%
              </div>
              <div className="text-muted-foreground">Average Sales Increase</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">₦500K</div>
              <div className="text-muted-foreground">Website Value FREE</div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
