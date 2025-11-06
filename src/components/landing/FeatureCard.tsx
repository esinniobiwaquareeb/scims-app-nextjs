import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  category?: string;
  demo?: string;
  onDemoClick?: (demo: string) => void;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  benefits,
  category,
  demo,
  onDemoClick,
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
      <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer border border-border/50 hover:border-primary/50">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            {category && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                {category}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">{description}</p>
          <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          {demo && onDemoClick && (
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-xs sm:text-sm group-hover:text-primary transition-colors touch-manipulation"
              onClick={() => onDemoClick(demo)}
            >
              See in Demo
              <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
