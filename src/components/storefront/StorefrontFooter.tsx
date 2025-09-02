'use client';

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/common/Logo';

interface Business {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  slug: string;
  currency: { symbol: string; code: string };
  language: { name: string };
  country: { name: string };
  settings: {
    enable_public_store: boolean;
    store_theme: string;
    store_banner_url?: string;
    store_description?: string;
    whatsapp_phone: string;
    whatsapp_message_template: string;
  };
}

interface StorefrontFooterProps {
  business: Business;
}

export default function StorefrontFooter({ business }: StorefrontFooterProps) {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">{business.name}</h3>
            <p className="text-gray-600 text-sm">{business.description}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {business.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {business.phone}
                </div>
              )}
              {business.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {business.email}
                </div>
              )}
              {business.address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {business.address}
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Powered by</h3>
            <Logo size="sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}
