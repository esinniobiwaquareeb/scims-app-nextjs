'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Share2, Check, Store, Phone, Mail } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';


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
  const { isDark } = useTheme();

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
      <header className={`backdrop-blur-sm shadow-sm border-b sticky top-0 z-50 ${
        isDark 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {business.name}
                  </h1>
                  {business.settings.store_description && (
                    <p className={`text-sm line-clamp-1 max-w-md ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {business.settings.store_description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Actions */}
            <div className="flex items-center space-x-4">
              {/* Contact Info */}
              <div className={`hidden md:flex items-center space-x-4 text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {business.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{business.email}</span>
                  </div>
                )}
              </div>

              {/* Share Button */}
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
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="w-full relative overflow-hidden">
        {business.settings.store_banner_url ? (
          <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
            <Image 
              src={business.settings.store_banner_url} 
              alt={`${business.name} banner`}
              fill
              className="object-cover object-center"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Modern gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
            
            {/* Store info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
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
          </div>
        ) : (
          <div className={`w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 bg-gradient-to-br flex items-center justify-center ${
            isDark 
              ? 'from-primary/20 via-primary/10 to-gray-800' 
              : 'from-primary/10 via-primary/5 to-gray-50'
          }`}>
            <div className="text-center px-4 max-w-4xl mx-auto">
              <div className={`backdrop-blur-sm rounded-2xl p-8 border shadow-lg ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700/20' 
                  : 'bg-white/80 border-white/20'
              }`}>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {business.name}
                </h2>
                {business.settings.store_description && (
                  <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {business.settings.store_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
