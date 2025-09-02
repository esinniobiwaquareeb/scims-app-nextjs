'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
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

interface StorefrontHeaderProps {
  business: Business;
}

export default function StorefrontHeader({ business }: StorefrontHeaderProps) {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                {business.settings.store_description && (
                  <p className="text-sm text-gray-600">{business.settings.store_description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {business.settings.store_banner_url && (
        <div className="h-64 bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
          <img 
            src={business.settings.store_banner_url} 
            alt={`${business.name} banner`}
            className="max-h-full max-w-full object-cover rounded-lg"
          />
        </div>
      )}
    </>
  );
}
