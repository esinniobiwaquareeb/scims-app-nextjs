import React, { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-background/98 backdrop-blur-md border-b shadow-md' : 'bg-background/95 backdrop-blur-sm border-b shadow-sm'
    } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="SCIMS Home">
            <Logo size="md" animated={true} disableLink={true} />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-6">
            <a 
              href="#features" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </a>
            <a 
              href="#faq" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            
            <Link 
              href="/auth/login" 
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Demo
            </Link>
            <Button 
              onClick={handleGetStarted} 
              className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg ml-2"
            >
              Start Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 rounded-md hover:bg-muted/50 transition-colors touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden bg-background border-t overflow-hidden"
        >
          <div className="px-4 py-4 space-y-1">
            <a 
              href="#features" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-3 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-3 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-3 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </a>
            <a 
              href="#faq" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-3 rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            
            <div className="flex flex-col space-y-2 pt-4 border-t mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDemoClick}
                className="w-full justify-center touch-manipulation"
              >
                <Eye className="w-4 h-4 mr-2" />
                Try Demo
              </Button>
              <Button 
                size="sm" 
                onClick={handleGetStarted}
                className="w-full justify-center touch-manipulation"
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
