import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Eye } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { motion } from 'framer-motion';

export interface NavigationProps {
  onGetStarted?: () => void;
  onStartDemo?: (demoType: string) => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  onGetStarted,
  onStartDemo,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDemoClick = () => {
    if (onStartDemo) {
      onStartDemo('store_admin');
    } else {
      window.location.href = '/demo?type=store_admin';
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/auth/register';
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo size="md" animated={true} />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </a>
            <a 
              href="#faq" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            
            <Link 
              href="/auth/login" 
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              Demo
            </Link>
            <Button 
              onClick={handleGetStarted} 
              className="bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
            >
              Start Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden bg-background border-t overflow-hidden"
        >
          <div className="px-4 py-4 space-y-3">
            <a 
              href="#features" 
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </a>
            <a 
              href="#faq" 
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDemoClick}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-1" />
                Try Demo
              </Button>
              <Button 
                size="sm" 
                onClick={handleGetStarted}
                className="w-full"
              >
                Start Trial
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};
