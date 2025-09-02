import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo';
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData';
import BusinessTypesClient from './BusinessTypesClient';

export const metadata: Metadata = generateSEOMetadata(seoConfigs.businessTypes);

export default function BusinessTypesPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://scims.app' },
    { name: 'Business Types', url: 'https://scims.app/business-types' }
  ];

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <BusinessTypesClient />
    </>
  );
}
