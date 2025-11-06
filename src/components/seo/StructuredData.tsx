/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export interface StructuredDataProps {
  type: 'Organization' | 'SoftwareApplication' | 'WebSite' | 'BreadcrumbList' | 'FAQPage' | 'Product' | 'Service';
  data: any;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scims.app';
    
    switch (type) {
      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "SCIMS",
          "alternateName": "Stock Control & Inventory Management System",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "description": "Stock Control & Inventory Management System - Complete business management solution with POS, inventory management, business analytics, and FREE professional website for retail, restaurant, pharmacy, and service businesses.",
          "foundingDate": "2024",
          "numberOfEmployees": {
            "@type": "QuantitativeValue",
            "value": "50-100"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+234-XXX-XXXX-XXX",
            "contactType": "customer service",
            "email": "support@scims.app",
            "availableLanguage": ["English", "French", "Swahili", "Yoruba", "Hausa", "Igbo"]
          },
          "sameAs": [
            "https://twitter.com/scims",
            "https://linkedin.com/company/scims",
            "https://facebook.com/scims"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "NG"
          }
        };

      case 'SoftwareApplication':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "SCIMS",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web, iOS, Android",
          "description": "Complete business management solution with POS system, stock control, analytics, multi-store management, and FREE professional website (worth ₦500,000). Support for retail, restaurant, pharmacy, and service businesses.",
          "url": baseUrl,
          "screenshot": `${baseUrl}/screenshot.png`,
          "softwareVersion": "2.0",
          "datePublished": "2024-01-01",
          "dateModified": new Date().toISOString().split('T')[0],
          "author": {
            "@type": "Organization",
            "name": "SCIMS"
          },
          "offers": [
            {
              "@type": "Offer",
              "name": "Starter Plan",
              "price": "15000",
              "priceCurrency": "NGN",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/InStock",
              "description": "Perfect for single shop owners - includes FREE website"
            },
            {
              "@type": "Offer",
              "name": "Business Plan",
              "price": "35000",
              "priceCurrency": "NGN",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/InStock",
              "description": "Best for growing businesses - includes FREE website"
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "4200",
            "bestRating": "5",
            "worstRating": "1"
          },
          "featureList": [
            "Point of Sale System",
            "Inventory Management",
            "Business Analytics",
            "Multi-Store Management",
            "Customer Management",
            "Receipt Management",
            "Multi-Channel Communication",
            "Offline Support",
            "FREE Professional Website",
            "24/7 Online Sales",
            "Mobile App Support",
            "WhatsApp Integration"
          ]
        };

      case 'WebSite':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "SCIMS",
          "url": baseUrl,
          "description": "Stock Control & Inventory Management System - Complete business management solution",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        };

      case 'BreadcrumbList':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      case 'FAQPage':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };

      case 'Product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.image,
          "brand": {
            "@type": "Brand",
            "name": "SCIMS"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": data.currency || "NGN",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": data.rating || "4.9",
            "ratingCount": data.reviewCount || "150"
          }
        };

      case 'Service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": data.name,
          "description": data.description,
          "provider": {
            "@type": "Organization",
            "name": "SCIMS"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Nigeria"
          },
          "serviceType": data.serviceType || "Business Management Software",
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": data.currency || "NGN"
          }
        };

      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  );
};

// Predefined structured data components for common use cases
export const OrganizationStructuredData = () => (
  <StructuredData type="Organization" data={{}} />
);

export const SoftwareApplicationStructuredData = () => (
  <StructuredData type="SoftwareApplication" data={{}} />
);

export const WebSiteStructuredData = () => (
  <StructuredData type="WebSite" data={{}} />
);

export const BreadcrumbStructuredData: React.FC<{ items: Array<{ name: string; url: string }> }> = ({ items }) => (
  <StructuredData type="BreadcrumbList" data={items} />
);

export const FAQStructuredData: React.FC<{ faqs: Array<{ question: string; answer: string }> }> = ({ faqs }) => (
  <StructuredData type="FAQPage" data={faqs} />
);

export const ProductStructuredData: React.FC<{
  name: string;
  description: string;
  image: string;
  price: string;
  currency?: string;
  rating?: string;
  reviewCount?: string;
}> = (props) => (
  <StructuredData type="Product" data={props} />
);

export const ServiceStructuredData: React.FC<{
  name: string;
  description: string;
  serviceType?: string;
  price: string;
  currency?: string;
}> = (props) => (
  <StructuredData type="Service" data={props} />
);
