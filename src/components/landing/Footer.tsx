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
    <footer className={`bg-muted/50 py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo size="md" />
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The complete business management platform trusted by 4,200+ businesses worldwide. 
              From retail stores to restaurants, pharmacies to service businesses - SCIMS adapts to your industry.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">Retail</Badge>
              <Badge variant="secondary">Restaurant</Badge>
              <Badge variant="secondary">Pharmacy</Badge>
              <Badge variant="secondary">Service</Badge>
              <Badge variant="secondary">Hybrid</Badge>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </div>

          {/* Business Types */}
          <div>
            <h4 className="font-semibold mb-4">Business Types</h4>
            <div className="space-y-3 text-sm">
              <Link href="/business-types/retail" className="block text-muted-foreground hover:text-foreground transition-colors">
                🛍️ Retail Stores
              </Link>
              <Link href="/business-types/restaurant" className="block text-muted-foreground hover:text-foreground transition-colors">
                🍽️ Restaurants
              </Link>
              <Link href="/business-types/pharmacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                💊 Pharmacies
              </Link>
              <Link href="/business-types/service" className="block text-muted-foreground hover:text-foreground transition-colors">
                🔧 Service Businesses
              </Link>
              <Link href="/business-types/hybrid" className="block text-muted-foreground hover:text-foreground transition-colors">
                🔄 Hybrid Operations
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <div className="space-y-3 text-sm">
              <Link href="/features/pos" className="block text-muted-foreground hover:text-foreground transition-colors">
                Point of Sale
              </Link>
              <Link href="/features/inventory" className="block text-muted-foreground hover:text-foreground transition-colors">
                Inventory Management
              </Link>
              <Link href="/features/analytics" className="block text-muted-foreground hover:text-foreground transition-colors">
                Business Analytics
              </Link>
              <Link href="/features/communication" className="block text-muted-foreground hover:text-foreground transition-colors">
                Customer Communication
              </Link>
              <Link href="/features/multi-store" className="block text-muted-foreground hover:text-foreground transition-colors">
                Multi-store Management
              </Link>
              <Link href="/features/receipts" className="block text-muted-foreground hover:text-foreground transition-colors">
                Receipt Delivery
              </Link>
            </div>
          </div>

          {/* Support & Resources */}
          <div>
            <h4 className="font-semibold mb-4">Support & Resources</h4>
            <div className="space-y-3 text-sm">
              <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="w-4 h-4 inline mr-2" />
                Help Center
              </Link>
              <Link href="/docs" className="block text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Documentation
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Contact Us
              </Link>
              <Link href="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                <Headphones className="w-4 h-4 inline mr-2" />
                Live Support
              </Link>
              <Link href="/training" className="block text-muted-foreground hover:text-foreground transition-colors">
                <Award className="w-4 h-4 inline mr-2" />
                Training
              </Link>
              <Link href="/status" className="block text-muted-foreground hover:text-foreground transition-colors">
                <Activity className="w-4 h-4 inline mr-2" />
                System Status
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
              <p>&copy; 2024 SCIMS. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Available in 15+ languages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
