import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Eye, 
  ChevronDown,
  BookOpen,
  FileText,
  HelpCircle,
  Settings,
  MessageCircle,
  Headphones,
  Activity,
  Award
} from 'lucide-react';
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

  const handleDemoClick = (demoType: string) => {
    if (onStartDemo) {
      onStartDemo(demoType);
    } else {
      window.location.href = `/demo?type=${demoType}`;
    }
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/auth/register';
    }
  };

  return (
    <nav className={`fixed top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">SCIMS</span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#business-types" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Business Types
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Features
            </a>
            <a href="#devices" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Devices
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Pricing
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Reviews
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              FAQ
            </a>
            
            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center">
                Resources
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link href="/docs" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Documentation
                  </Link>
                  <Link href="/blog" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Blog
                  </Link>
                  <Link href="/help" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <HelpCircle className="w-4 h-4 inline mr-2" />
                    Help Center
                  </Link>
                  <Link href="/api" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <Settings className="w-4 h-4 inline mr-2" />
                    API Documentation
                  </Link>
                </div>
              </div>
            </div>

            {/* Support Dropdown */}
            <div className="relative group">
              <button className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center">
                Support
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link href="/contact" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Contact Us
                  </Link>
                  <Link href="/support" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <Headphones className="w-4 h-4 inline mr-2" />
                    Live Support
                  </Link>
                  <Link href="/status" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <Activity className="w-4 h-4 inline mr-2" />
                    System Status
                  </Link>
                  <Link href="/training" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <Award className="w-4 h-4 inline mr-2" />
                    Training
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/auth/login" className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200">
              <Eye className="w-4 h-4 mr-1" />
              Try Demo
            </Link>
            <Button onClick={handleGetStarted} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
              Start Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
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
          <div className="px-4 py-4 space-y-4">
            <a href="#business-types" className="block text-muted-foreground hover:text-foreground transition-colors">Business Types</a>
            <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#devices" className="block text-muted-foreground hover:text-foreground transition-colors">Devices</a>
            <a href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="block text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
            <a href="#faq" className="block text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Resources</h4>
              <div className="space-y-2 ml-4">
                <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Documentation
                </Link>
                <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Blog
                </Link>
                <Link href="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="w-4 h-4 inline mr-2" />
                  Help Center
                </Link>
                <Link href="/api" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="w-4 h-4 inline mr-2" />
                  API Documentation
                </Link>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Support</h4>
              <div className="space-y-2 ml-4">
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Contact Us
                </Link>
                <Link href="/support" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Headphones className="w-4 h-4 inline mr-2" />
                  Live Support
                </Link>
                <Link href="/status" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Activity className="w-4 h-4 inline mr-2" />
                  System Status
                </Link>
                <Link href="/training" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Award className="w-4 h-4 inline mr-2" />
                  Training
                </Link>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => handleDemoClick('store_admin')}>
                <Eye className="w-4 h-4 mr-1" />
                Try Demo
              </Button>
              <Button size="sm" onClick={handleGetStarted}>Start Trial</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};
