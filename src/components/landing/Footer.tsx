import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  HelpCircle,
  BookOpen,
  MessageCircle,
  Headphones,
  Activity,
  Award,
  Globe,
  Shield
} from 'lucide-react';
import Logo from '@/components/common/Logo';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-muted/50 border-t py-12 sm:py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div>
              <Logo size="md" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
              The complete business management platform trusted by 4,200+ businesses worldwide. 
              From retail stores to restaurants, pharmacies to service businesses - SCIMS adapts to your industry.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">Retail</Badge>
              <Badge variant="secondary" className="text-xs">Restaurant</Badge>
              <Badge variant="secondary" className="text-xs">Pharmacy</Badge>
              <Badge variant="secondary" className="text-xs">Service</Badge>
              <Badge variant="secondary" className="text-xs">Hybrid</Badge>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm touch-manipulation">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm touch-manipulation">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm touch-manipulation">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Call
              </Button>
            </div>
          </div>

          {/* Business Types */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-5 text-base sm:text-lg">Business Types</h4>
            <nav className="space-y-2.5 sm:space-y-3" aria-label="Business types">
              <Link href="/business-types/retail" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                🛍️ Retail Stores
              </Link>
              <Link href="/business-types/restaurant" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                🍽️ Restaurants
              </Link>
              <Link href="/business-types/pharmacy" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                💊 Pharmacies
              </Link>
              <Link href="/business-types/service" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                🔧 Service Businesses
              </Link>
              <Link href="/business-types/hybrid" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                🔄 Hybrid Operations
              </Link>
            </nav>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-5 text-base sm:text-lg">Features</h4>
            <nav className="space-y-2.5 sm:space-y-3" aria-label="Features">
              <Link href="/features/pos" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                Point of Sale
              </Link>
              <Link href="/features/inventory" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                Inventory Management
              </Link>
              <Link href="/features/analytics" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                Business Analytics
              </Link>
              <Link href="/features/communication" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                Customer Communication
              </Link>
              <Link href="/features/multi-store" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                Multi-store Management
              </Link>
              <Link href="/features/receipts" className="block text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                Receipt Delivery
              </Link>
            </nav>
          </div>

          {/* Support & Resources */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-5 text-base sm:text-lg">Support & Resources</h4>
            <nav className="space-y-2.5 sm:space-y-3" aria-label="Support and resources">
              <Link href="/help" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                <HelpCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                Help Center
              </Link>
              <Link href="/docs" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                Documentation
              </Link>
              <Link href="/contact" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                Contact Us
              </Link>
              <Link href="/support" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                <Headphones className="w-4 h-4 mr-2 flex-shrink-0" />
                Live Support
              </Link>
              <Link href="/training" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                Training
              </Link>
              <Link href="/status" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1">
                <Activity className="w-4 h-4 mr-2 flex-shrink-0" />
                System Status
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t mt-10 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              <p>&copy; {new Date().getFullYear()} SCIMS. All rights reserved.</p>
              <nav className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6" aria-label="Legal links">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
              </nav>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span>Available in 15+ languages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
