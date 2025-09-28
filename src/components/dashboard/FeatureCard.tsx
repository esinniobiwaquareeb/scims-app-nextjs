import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick 
}) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-0 shadow-sm"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors mb-2">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ml-4 group-hover:scale-110 transition-transform ${color.includes('bg-') ? color : `bg-${color}-100`}`}>
            <Icon className={`w-6 h-6 ${color.includes('text-') ? color : `text-${color}-600`}`} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
