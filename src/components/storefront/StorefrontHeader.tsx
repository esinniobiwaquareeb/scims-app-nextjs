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
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {business.name}
                </h1>
                {business.settings.store_description && (
                  <p className="text-sm text-gray-600 line-clamp-1 max-w-md">
                    {business.settings.store_description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-green-600 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {business.settings.store_banner_url ? (
          <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
            <img 
              src={business.settings.store_banner_url} 
              alt={`${business.name} banner`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
              onError={(e) => {
                // Hide the image if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            
            {/* Store info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  Welcome to {business.name}
                </h2>
                {business.settings.store_description && (
                  <p className="text-lg sm:text-xl text-white/90 max-w-2xl drop-shadow-md">
                    {business.settings.store_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-center px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary/80 mb-2">
                {business.name}
              </h2>
              {business.settings.store_description && (
                <p className="text-lg sm:text-xl text-primary/60 max-w-2xl mx-auto">
                  {business.settings.store_description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
