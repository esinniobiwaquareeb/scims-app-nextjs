import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo';
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData';
import PricingClient from './PricingClient';

export const metadata: Metadata = generateSEOMetadata(seoConfigs.pricing);

export default function PricingPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://scims.app' },
    { name: 'Pricing', url: 'https://scims.app/pricing' }
  ];

  const pricingProducts = [
    {
      name: 'SCIMS Starter Plan',
      description: 'Perfect for single shop owners with basic business management needs',
      image: 'https://scims.app/pricing-starter.jpg',
      price: '15000',
      currency: 'NGN'
    },
    {
      name: 'SCIMS Business Plan',
      description: 'Best for growing businesses with advanced features and multi-location support',
      image: 'https://scims.app/pricing-business.jpg',
      price: '35000',
      currency: 'NGN'
    }
  ];

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      {pricingProducts.map((product, index) => (
        <ProductStructuredData
          key={index}
          name={product.name}
          description={product.description}
          image={product.image}
          price={product.price}
          currency={product.currency}
          rating="4.9"
          reviewCount="150"
        />
      ))}
      <PricingClient />
    </>
  );
}