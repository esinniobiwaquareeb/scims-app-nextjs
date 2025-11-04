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
      <Card className={`h-full relative ${tier.popular ? 'ring-2 ring-primary shadow-xl' : ''}`}>
        {tier.popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-4 py-1">
              Most Popular
            </Badge>
          </div>
        )}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
          <div className="mb-4">
            <span className="text-4xl font-bold">{tier.price}</span>
            <span className="text-muted-foreground">{tier.period}</span>
          </div>
          <p className="text-muted-foreground">{tier.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-8">
            {tier.features.map((feature, i) => (
              <div key={i} className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
          {tier.businessTypes && tier.businessTypes.length > 0 && (
            <div className="space-y-2 mb-6">
              {tier.businessTypes.map((type, i) => (
                <Badge key={i} variant="secondary" className="text-xs mr-2">
                  {type}
                </Badge>
              ))}
            </div>
          )}
          <Button 
            className={`w-full ${tier.popular ? '' : 'variant-outline'}`}
            variant={tier.popular ? 'default' : 'outline'}
            onClick={onGetStarted}
          >
            {tier.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
