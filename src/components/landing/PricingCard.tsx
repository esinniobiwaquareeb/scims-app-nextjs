import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  businessTypes?: string[];
}

export interface PricingCardProps {
  tier: PricingTier;
  onGetStarted?: () => void;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  onGetStarted,
  className = '',
  animation = 'fadeUp',
  delay = 0
}) => {
  const animations = {
    fadeUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 }
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    slideLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 }
    },
    slideRight: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 }
    }
  };

  return (
    <motion.div
      initial={animations[animation].initial}
      whileInView={animations[animation].animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      <Card className={`h-full relative border-2 transition-all duration-300 hover:shadow-lg ${tier.popular ? 'ring-2 ring-primary shadow-xl border-primary' : 'border-border hover:border-primary/50'}`}>
        {tier.popular && (
          <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold shadow-md">
              Most Popular
            </Badge>
          </div>
        )}
        <CardHeader className="text-center pt-6 sm:pt-8 pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl mb-2 sm:mb-3">{tier.name}</CardTitle>
          <div className="mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">{tier.price}</span>
            <span className="text-sm sm:text-base text-muted-foreground ml-1">{tier.period}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{tier.description}</p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
            {tier.features.map((feature, i) => (
              <div key={i} className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
          {tier.businessTypes && tier.businessTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {tier.businessTypes.map((type, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          )}
          <Button 
            className={`w-full text-sm sm:text-base font-semibold py-5 sm:py-6 touch-manipulation ${tier.popular ? 'shadow-md hover:shadow-lg' : ''}`}
            variant={tier.popular ? 'default' : 'outline'}
            onClick={onGetStarted}
            size="lg"
          >
            {tier.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
