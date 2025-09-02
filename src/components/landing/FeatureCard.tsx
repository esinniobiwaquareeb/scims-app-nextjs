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
      <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl mb-4">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
          <div className="space-y-2 mb-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          {demo && onDemoClick && (
            <Button 
              variant="ghost" 
              className="p-0 h-auto group-hover:text-primary transition-colors"
              onClick={() => onDemoClick(demo)}
            >
              See in Demo
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
