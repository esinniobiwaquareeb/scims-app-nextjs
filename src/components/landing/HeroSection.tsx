import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Eye, MousePointer, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  
  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Dashboard images data
  const dashboardImages = [
    {
      src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/business-admin-dashboard.png',
      alt: 'SCIMS Business Admin Dashboard',
      title: 'Business Dashboard',
      description: 'Complete business management overview'
    },
    {
      src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/inventory.png',
      alt: 'SCIMS Inventory Management',
      title: 'Inventory Management',
      description: 'Track products and stock levels'
    },
    {
      src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/pos-page.png',
      alt: 'SCIMS POS System',
      title: 'Point of Sale',
      description: 'Process sales and transactions'
    },
    {
      src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/pos-payment.png',
      alt: 'SCIMS Payment Processing',
      title: 'Payment Processing',
      description: 'Secure payment handling'
    },
    {
      src: 'https://eutsywibykwwvpqsrgkz.supabase.co/storage/v1/object/public/images/pos-receipt.png',
      alt: 'SCIMS Receipt Generation',
      title: 'Receipt Generation',
      description: 'Professional receipt printing'
    }
  ];

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

  // Carousel navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % dashboardImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + dashboardImages.length) % dashboardImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
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


          </div>

          <div className="lg:pl-8">
            <AnimatedSection animation="fadeUp" delay={0.6}>
              <div className="relative">
                {/* Main Image Display */}
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl overflow-hidden relative">
                  <Image
                    src={dashboardImages[currentImageIndex].src}
                    alt={dashboardImages[currentImageIndex].alt}
                    fill
                    className="object-cover rounded-2xl"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">{dashboardImages[currentImageIndex].title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardImages[currentImageIndex].description}
                    </p>
                  </div>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center space-x-2 mt-4">
                  {dashboardImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'bg-primary scale-125'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
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
