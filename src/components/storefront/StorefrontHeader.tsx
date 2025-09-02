'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Check } from 'lucide-react';


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
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business.name} - Online Store`,
          text: `Check out ${business.name}'s online store!`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to copy to clipboard
        copyToClipboard(url);
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              {business.settings.store_description && (
                <p className="text-sm text-gray-600">{business.settings.store_description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </>
                )}
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
