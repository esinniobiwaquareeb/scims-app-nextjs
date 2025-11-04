import React from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export interface SectionHeaderProps {
  badge?: string;
  title: string;
  description: string;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  description,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  maxWidth = '3xl'
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <motion.div
      initial={animations[animation].initial}
      whileInView={animations[animation].animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`text-center mb-12 sm:mb-16 lg:mb-20 ${className}`}
    >
      {badge && (
        <Badge variant="outline" className="mb-3 sm:mb-4">
          {badge}
        </Badge>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
        {title}
      </h2>
      <p className={`text-base sm:text-lg lg:text-xl text-muted-foreground mx-auto ${maxWidthClasses[maxWidth]}`}>
        {description}
      </p>
    </motion.div>
  );
};
