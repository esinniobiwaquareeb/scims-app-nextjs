import React from 'react';
import { AnimatedCounter } from './AnimatedCounter';
import { motion } from 'framer-motion';

export interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description?: string;
}

export interface StatsGridProps {
  stats: StatItem[];
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  columns = 4
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

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-6'
  };

  return (
    <motion.div
      initial={animations[animation].initial}
      whileInView={animations[animation].animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`grid ${gridClasses[columns]} gap-8 text-center ${className}`}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={animations[animation].initial}
          whileInView={animations[animation].animate}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: delay + (index * 0.1), ease: "easeOut" }}
        >
          <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {stat.prefix}
            <AnimatedCounter 
              end={stat.value} 
              suffix={stat.suffix}
              duration={2000}
            />
          </div>
          <div className="text-muted-foreground">
            {stat.label}
          </div>
          {stat.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {stat.description}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};
