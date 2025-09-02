import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: {
    container: 'w-6 h-6',
    icon: 'w-3 h-3',
    text: 'text-sm'
  },
  md: {
    container: 'w-8 h-8',
    icon: 'w-5 h-5',
    text: 'text-lg'
  },
  lg: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    text: 'text-xl'
  },
  xl: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    text: 'text-2xl'
  }
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  animated = false 
}: LogoProps) {
  const sizeConfig = sizeClasses[size];
  
  const LogoContent = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeConfig.container} bg-primary rounded-lg flex items-center justify-center`}>
        <ShoppingCart className={`${sizeConfig.icon} text-primary-foreground`} />
      </div>
      {showText && (
        <span className={`${sizeConfig.text} font-semibold`}>SCIMS</span>
      )}
    </div>
  );

  if (animated) {
    return (
      <Link href="/" className="inline-block">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <LogoContent />
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href="/" className="inline-block">
      <LogoContent />
    </Link>
  );
}
