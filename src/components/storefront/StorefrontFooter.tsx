'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, ExternalLink, MessageCircle, Globe } from 'lucide-react';
import Image from 'next/image';
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

interface PlatformSettings {
  platform_name: string;
  platform_phone?: string;
  platform_whatsapp?: string;
  platform_email?: string;
  platform_website?: string;
}

interface StorefrontFooterProps {
  business: Business;
}

export default function StorefrontFooter({ business }: StorefrontFooterProps) {
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    // Fetch platform settings
    const fetchPlatformSettings = async () => {
      try {
        const response = await fetch('/api/platform/settings');
        const data = await response.json();
        if (data.success) {
          setPlatformSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch platform settings:', error);
      }
    };

    fetchPlatformSettings();
  }, []);

  const handleWhatsAppClick = (phone: string) => {
    const message = `Hello! I'm interested in learning more about SCIMS.`;
    const whatsappUrl = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className={`mt-16 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Business Info */}
          <div className="lg:col-span-1">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {business.name}
            </h3>
            <p className={`text-sm mb-4 leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {business.settings.store_description || business.description}
            </p>
            {business.website && (
              <a 
                href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center text-sm transition-colors ${
                  isDark 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Contact Us
            </h3>
            <div className={`space-y-3 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {business.phone && (
                <div className="flex items-center">
                  <Phone className={`w-4 h-4 mr-3 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <a 
                    href={`tel:${business.phone}`}
                    className={`transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-gray-900'
                    }`}
                  >
                    {business.phone}
                  </a>
                </div>
              )}
              {business.email && (
                <div className="flex items-center">
                  <Mail className={`w-4 h-4 mr-3 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <a 
                    href={`mailto:${business.email}`}
                    className={`transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-gray-900'
                    }`}
                  >
                    {business.email}
                  </a>
                </div>
              )}
              {business.address && (
                <div className="flex items-start">
                  <MapPin className={`w-4 h-4 mr-3 mt-0.5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`leading-relaxed transition-colors ${
                    isDark ? 'hover:text-white' : 'hover:text-gray-900'
                  }`}>
                    {business.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Platform Support */}
          <div className="lg:col-span-1">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Platform Support
            </h3>
            <div className={`space-y-3 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {platformSettings?.platform_phone && (
                <div className="flex items-center">
                  <Phone className={`w-4 h-4 mr-3 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <a 
                    href={`tel:${platformSettings.platform_phone}`}
                    className={`transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-gray-900'
                    }`}
                  >
                    {platformSettings.platform_phone}
                  </a>
                </div>
              )}
              {platformSettings?.platform_email && (
                <div className="flex items-center">
                  <Mail className={`w-4 h-4 mr-3 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <a 
                    href={`mailto:${platformSettings.platform_email}`}
                    className={`transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-gray-900'
                    }`}
                  >
                    {platformSettings.platform_email}
                  </a>
                </div>
              )}
              {platformSettings?.platform_whatsapp && (
                <button
                  onClick={() => handleWhatsAppClick(platformSettings.platform_whatsapp!)}
                  className={`flex items-center transition-colors ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  WhatsApp Support
                </button>
              )}
            </div>
          </div>

          {/* Powered by SCIMS */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <Image
                src="/icons/scims-alt-32x32.png"
                alt="SCIMS Logo"
                width={32}
                height={32}
                className="mr-3"
              />
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Powered by SCIMS
              </h3>
            </div>
            <p className={`text-sm mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Stock Control Inventory Management System
            </p>
            <div className="space-y-2">
              {platformSettings?.platform_website && (
                <a
                  href={platformSettings.platform_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center text-sm transition-colors ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Learn More
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t mt-8 pt-8 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              © {new Date().getFullYear()} {business.name}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Powered by
              </span>
              <a
                href={platformSettings?.platform_website || 'https://scims.app'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center transition-colors ${
                  isDark 
                    ? 'text-white hover:text-blue-400' 
                    : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                <Image
                  src="/icons/scims-alt-16x16.png"
                  alt="SCIMS"
                  width={16}
                  height={16}
                  className="mr-1"
                />
                <span className="font-semibold">SCIMS</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
