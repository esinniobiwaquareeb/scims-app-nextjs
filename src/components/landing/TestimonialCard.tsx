import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
  businessType: string;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
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
      <Card className="h-full border border-border/50 hover:border-primary/50 transition-colors">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            <div className="text-2xl sm:text-3xl flex-shrink-0">{testimonial.image}</div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm sm:text-base truncate">{testimonial.name}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{testimonial.role}</p>
              <Badge variant="secondary" className="text-[10px] sm:text-xs mt-1">
                {testimonial.businessType}
              </Badge>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-4 sm:line-clamp-none">
            &ldquo;{testimonial.content}&rdquo;
          </p>
          <div className="flex text-yellow-500 mb-2">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            ))}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{testimonial.company}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
