import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    locale: string;
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
  };
  robots: {
    index: boolean;
    follow: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
      'max-video-preview': number;
      'max-image-preview': 'large' | 'none' | 'standard';
      'max-snippet': number;
    };
  };
  alternates: {
    canonical: string;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scims.app';
const siteName = 'SCIMS - Stock Control & Inventory Management System';

export const defaultSEO: Partial<SEOConfig> = {
  openGraph: {
    title: 'SCIMS - Stock Control & Inventory Management System',
    description: 'Transform your business with SCIMS - the complete POS, inventory management, and business analytics platform.',
    url: baseUrl,
    siteName,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'SCIMS - Stock Control & Inventory Management System'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SCIMS - Stock Control & Inventory Management System',
    description: 'Transform your business with SCIMS - the complete POS, inventory management, and business analytics platform.',
    images: [`${baseUrl}/og-image.jpg`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl
  }
};

export function generateMetadata(config: Partial<SEOConfig>): Metadata {
  const fullConfig = { ...defaultSEO, ...config } as SEOConfig;
  
  return {
    title: fullConfig.title,
    description: fullConfig.description,
    keywords: fullConfig.keywords,
    robots: fullConfig.robots,
    alternates: fullConfig.alternates,
    openGraph: fullConfig.openGraph,
    twitter: fullConfig.twitter,
  };
}

// SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: 'SCIMS - Stock Control & Inventory Management System | POS, Inventory & Business Management',
    description: 'Transform your business with SCIMS - the complete POS, inventory management, and business analytics platform. Support for retail, restaurant, pharmacy, and service businesses. Start your free trial today!',
    keywords: [
      'POS system',
      'inventory management',
      'business management software',
      'retail management',
      'restaurant POS',
      'pharmacy management',
      'service business software',
      'point of sale',
      'business analytics',
      'multi-store management',
      'customer management',
      'business software Nigeria',
      'business software Africa',
      'cloud-based POS',
      'offline POS system'
    ],
    canonical: baseUrl,
    openGraph: {
      title: 'SCIMS - Stock Control & Inventory Management System',
      description: 'Transform your business with SCIMS - the complete POS, inventory management, and business analytics platform.',
      url: baseUrl,
      siteName,
      images: [
        {
          url: `${baseUrl}/og-home.jpg`,
          width: 1200,
          height: 630,
          alt: 'SCIMS - Complete Business Management Solution'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SCIMS - Stock Control & Inventory Management System',
      description: 'Transform your business with SCIMS - the complete POS, inventory management, and business analytics platform.',
      images: [`${baseUrl}/og-home.jpg`]
    }
  },

  businessTypes: {
    title: 'Business Types Supported by SCIMS | Retail, Restaurant, Pharmacy & Service Management',
    description: 'Discover how SCIMS supports different business types including retail stores, restaurants, pharmacies, and service businesses with specialized features and workflows.',
    keywords: [
      'business types',
      'retail management',
      'restaurant management',
      'pharmacy management',
      'service business management',
      'business software types',
      'industry solutions',
      'specialized business software'
    ],
    canonical: `${baseUrl}/business-types`,
    openGraph: {
      title: 'Business Types Supported by SCIMS',
      description: 'Discover how SCIMS supports different business types with specialized features and workflows.',
      url: `${baseUrl}/business-types`,
      siteName,
      images: [
        {
          url: `${baseUrl}/og-business-types.jpg`,
          width: 1200,
          height: 630,
          alt: 'SCIMS Business Types - Retail, Restaurant, Pharmacy, Service'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Business Types Supported by SCIMS',
      description: 'Discover how SCIMS supports different business types with specialized features and workflows.',
      images: [`${baseUrl}/og-business-types.jpg`]
    }
  },

  features: {
    title: 'SCIMS Features | Complete Business Management Features & Capabilities',
    description: 'Explore SCIMS comprehensive features including POS system, inventory management, analytics, multi-store management, customer management, and more.',
    keywords: [
      'SCIMS features',
      'business management features',
      'POS features',
      'inventory management features',
      'business analytics features',
      'multi-store features',
      'customer management features',
      'business software features'
    ],
    canonical: `${baseUrl}/features`,
    openGraph: {
      title: 'SCIMS Features - Complete Business Management',
      description: 'Explore SCIMS comprehensive features for complete business management.',
      url: `${baseUrl}/features`,
      siteName,
      images: [
        {
          url: `${baseUrl}/og-features.jpg`,
          width: 1200,
          height: 630,
          alt: 'SCIMS Features - Complete Business Management'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SCIMS Features - Complete Business Management',
      description: 'Explore SCIMS comprehensive features for complete business management.',
      images: [`${baseUrl}/og-features.jpg`]
    }
  },

  pricing: {
    title: 'SCIMS Pricing Plans | Affordable Business Management Software Pricing',
    description: 'Choose the perfect SCIMS pricing plan for your business. Flexible plans starting from ₦15,000/month. 14-day free trial, no setup fees. Start today!',
    keywords: [
      'SCIMS pricing',
      'business software pricing',
      'POS system pricing',
      'inventory management pricing',
      'affordable business software',
      'business management cost',
      'software subscription pricing',
      'Nigeria business software pricing'
    ],
    canonical: `${baseUrl}/pricing`,
    openGraph: {
      title: 'SCIMS Pricing Plans - Affordable Business Management',
      description: 'Choose the perfect SCIMS pricing plan for your business. Flexible plans starting from ₦15,000/month.',
      url: `${baseUrl}/pricing`,
      siteName,
      images: [
        {
          url: `${baseUrl}/og-pricing.jpg`,
          width: 1200,
          height: 630,
          alt: 'SCIMS Pricing Plans - Affordable Business Management'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SCIMS Pricing Plans - Affordable Business Management',
      description: 'Choose the perfect SCIMS pricing plan for your business. Flexible plans starting from ₦15,000/month.',
      images: [`${baseUrl}/og-pricing.jpg`]
    }
  },

  contact: {
    title: 'Contact SCIMS | Get Support & Sales Information',
    description: 'Contact SCIMS for sales inquiries, technical support, or general questions. Get in touch with our team for personalized business management solutions.',
    keywords: [
      'contact SCIMS',
      'SCIMS support',
      'business software support',
      'POS system support',
      'sales inquiry',
      'technical support',
      'customer service'
    ],
    canonical: `${baseUrl}/contact`,
    openGraph: {
      title: 'Contact SCIMS - Get Support & Sales Information',
      description: 'Contact SCIMS for sales inquiries, technical support, or general questions.',
      url: `${baseUrl}/contact`,
      siteName,
      images: [
        {
          url: `${baseUrl}/og-contact.jpg`,
          width: 1200,
          height: 630,
          alt: 'Contact SCIMS - Support & Sales'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact SCIMS - Get Support & Sales Information',
      description: 'Contact SCIMS for sales inquiries, technical support, or general questions.',
      images: [`${baseUrl}/og-contact.jpg`]
    }
  },

  privacy: {
    title: 'SCIMS Privacy Policy | Data Protection & Privacy Information',
    description: 'Read SCIMS privacy policy to understand how we collect, use, and protect your personal information and business data.',
    keywords: [
      'SCIMS privacy policy',
      'data protection',
      'privacy information',
      'data security',
      'GDPR compliance',
      'data privacy'
    ],
    canonical: `${baseUrl}/privacy`,
    openGraph: {
      title: 'SCIMS Privacy Policy - Data Protection',
      description: 'Read SCIMS privacy policy to understand how we protect your data.',
      url: `${baseUrl}/privacy`,
      siteName,
      images: [
        {
          url: `${baseUrl}/og-privacy.jpg`,
          width: 1200,
          height: 630,
          alt: 'SCIMS Privacy Policy - Data Protection'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SCIMS Privacy Policy - Data Protection',
      description: 'Read SCIMS privacy policy to understand how we protect your data.',
      images: [`${baseUrl}/og-privacy.jpg`]
    }
  },

  terms: {
    title: 'SCIMS Terms of Service | User Agreement & Terms',
    description: 'Read SCIMS terms of service and user agreement. Understand the terms and conditions for using our business management platform.',
    keywords: [
      'SCIMS terms of service',
      'user agreement',
      'terms and conditions',
      'service terms',
      'user terms'
    ],
    canonical: `${baseUrl}/terms`,
    openGraph: {
      title: 'SCIMS Terms of Service - User Agreement',
      description: 'Read SCIMS terms of service and user agreement.',
      url: `${baseUrl}/terms`,
      siteName,
      images: [
        {
          url: `${baseUrl}/og-terms.jpg`,
          width: 1200,
          height: 630,
          alt: 'SCIMS Terms of Service - User Agreement'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SCIMS Terms of Service - User Agreement',
      description: 'Read SCIMS terms of service and user agreement.',
      images: [`${baseUrl}/og-terms.jpg`]
    }
  }
};

// Business type specific SEO configs
export const businessTypeSEO = {
  retail: {
    title: 'Retail Management Software | SCIMS Retail POS & Inventory System',
    description: 'Complete retail management solution with POS system, inventory tracking, customer management, and analytics. Perfect for retail stores, shops, and retail businesses.',
    keywords: [
      'retail management software',
      'retail POS system',
      'retail inventory management',
      'retail store management',
      'shop management software',
      'retail business software',
      'retail analytics',
      'retail customer management'
    ],
    canonical: `${baseUrl}/business-types/retail`
  },
  restaurant: {
    title: 'Restaurant Management Software | SCIMS Restaurant POS & Kitchen Management',
    description: 'Complete restaurant management solution with POS system, kitchen management, menu management, table service, and restaurant analytics.',
    keywords: [
      'restaurant management software',
      'restaurant POS system',
      'kitchen management',
      'menu management',
      'table service management',
      'restaurant analytics',
      'food service software',
      'restaurant business software'
    ],
    canonical: `${baseUrl}/business-types/restaurant`
  },
  pharmacy: {
    title: 'Pharmacy Management Software | SCIMS Pharmacy POS & Drug Inventory',
    description: 'Complete pharmacy management solution with POS system, drug inventory tracking, prescription management, expiry monitoring, and pharmacy compliance.',
    keywords: [
      'pharmacy management software',
      'pharmacy POS system',
      'drug inventory management',
      'prescription management',
      'pharmacy compliance',
      'drug expiry tracking',
      'pharmacy software',
      'pharmaceutical management'
    ],
    canonical: `${baseUrl}/business-types/pharmacy`
  },
  service: {
    title: 'Service Business Management | SCIMS Service Business Software',
    description: 'Complete service business management solution with appointment scheduling, service tracking, customer management, and service analytics.',
    keywords: [
      'service business management',
      'appointment scheduling software',
      'service tracking software',
      'service business software',
      'service management system',
      'service analytics',
      'service customer management',
      'service business tools'
    ],
    canonical: `${baseUrl}/business-types/service`
  },
  hybrid: {
    title: 'Hybrid Business Management | SCIMS Multi-Business Type Software',
    description: 'Complete hybrid business management solution supporting multiple business types from a single platform. Manage retail, restaurant, service, and pharmacy operations.',
    keywords: [
      'hybrid business management',
      'multi-business software',
      'multi-type business management',
      'hybrid business software',
      'multi-industry software',
      'business type switching',
      'flexible business software',
      'multi-model business management'
    ],
    canonical: `${baseUrl}/business-types/hybrid`
  }
};

// Feature specific SEO configs
export const featureSEO = {
  pos: {
    title: 'Point of Sale (POS) System | SCIMS Advanced POS Features',
    description: 'Advanced POS system with barcode scanning, multiple payment methods, receipt management, and real-time inventory integration. Perfect for all business types.',
    keywords: [
      'POS system',
      'point of sale',
      'barcode scanning',
      'payment processing',
      'receipt management',
      'POS terminal',
      'retail POS',
      'restaurant POS'
    ],
    canonical: `${baseUrl}/features/pos`
  },
  inventory: {
    title: 'Inventory Management System | SCIMS Smart Inventory Features',
    description: 'Smart inventory management with real-time tracking, low-stock alerts, supplier management, and automated reordering. Optimize your inventory operations.',
    keywords: [
      'inventory management',
      'stock management',
      'inventory tracking',
      'low stock alerts',
      'supplier management',
      'automated reordering',
      'inventory optimization',
      'stock control'
    ],
    canonical: `${baseUrl}/features/inventory`
  },
  analytics: {
    title: 'Business Analytics & Reporting | SCIMS Advanced Analytics Features',
    description: 'Advanced business analytics with sales forecasting, profit analysis, custom reports, and growth insights. Make data-driven business decisions.',
    keywords: [
      'business analytics',
      'sales analytics',
      'business reporting',
      'sales forecasting',
      'profit analysis',
      'business insights',
      'data analytics',
      'business intelligence'
    ],
    canonical: `${baseUrl}/features/analytics`
  },
  communication: {
    title: 'Business Communication Tools | SCIMS Multi-Channel Communication',
    description: 'Multi-channel communication tools including WhatsApp, SMS, email integration, and customer communication management. Enhance customer engagement.',
    keywords: [
      'business communication',
      'WhatsApp integration',
      'SMS notifications',
      'email marketing',
      'customer communication',
      'multi-channel communication',
      'communication tools',
      'customer engagement'
    ],
    canonical: `${baseUrl}/features/communication`
  },
  multiStore: {
    title: 'Multi-Store Management | SCIMS Multi-Location Business Management',
    description: 'Complete multi-store management solution with centralized control, location-based analytics, and unified reporting across all store locations.',
    keywords: [
      'multi-store management',
      'multi-location management',
      'chain store management',
      'franchise management',
      'multi-location POS',
      'centralized management',
      'store chain software',
      'multi-location analytics'
    ],
    canonical: `${baseUrl}/features/multi-store`
  },
  receipts: {
    title: 'Receipt Management System | SCIMS Digital & Print Receipt Features',
    description: 'Complete receipt management with digital receipts, print receipts, QR codes, and receipt sharing. Modernize your receipt system.',
    keywords: [
      'receipt management',
      'digital receipts',
      'print receipts',
      'receipt system',
      'QR code receipts',
      'receipt sharing',
      'receipt templates',
      'receipt automation'
    ],
    canonical: `${baseUrl}/features/receipts`
  }
};
