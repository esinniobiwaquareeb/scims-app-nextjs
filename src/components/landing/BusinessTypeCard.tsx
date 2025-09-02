import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BusinessTypeConfig } from '@/components/common/BusinessTypeConstants';

export interface BusinessTypeCardProps {
  businessType: BusinessTypeConfig;
  isSelected?: boolean;
  onSelect?: (type: string) => void;
  onLearnMore?: (type: string) => void;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  showLearnMore?: boolean;
}

export const BusinessTypeCard: React.FC<BusinessTypeCardProps> = ({
  businessType,
  isSelected = false,
  onSelect,
  onLearnMore,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  showLearnMore = true
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

  const getColorClasses = (type: string) => {
    const colors = {
      retail: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
      restaurant: 'text-green-600 bg-green-50 dark:bg-green-950/20',
      pharmacy: 'text-red-600 bg-red-50 dark:bg-red-950/20',
      service: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
      hybrid: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  };

  const colorClasses = getColorClasses(businessType.type);

  return (
    <motion.div
      initial={animations[animation].initial}
      whileInView={animations[animation].animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isSelected 
            ? `ring-2 ring-primary ${colorClasses}` 
            : 'hover:bg-muted/50'
        }`}
        onClick={() => onSelect?.(businessType.type)}
      >
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">{businessType.icon}</div>
          <h3 className="font-semibold mb-2">{businessType.label}</h3>
          <p className="text-sm text-muted-foreground mb-4">{businessType.description}</p>
          
          {/* Key Features Preview */}
          <div className="space-y-1 mb-4">
            {Object.entries(businessType.features)
              .filter(([key, value]) => value === true)
              .slice(0, 3)
              .map(([key, _]) => (
                <div key={key} className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
          </div>

          {showLearnMore && onLearnMore && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onLearnMore(businessType.type);
              }}
            >
              Learn More <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
