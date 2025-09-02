import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo';
import { OrganizationStructuredData, SoftwareApplicationStructuredData, WebSiteStructuredData, FAQStructuredData } from '@/components/seo/StructuredData';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = generateSEOMetadata(seoConfigs.home);

export default function HomePage() {
  const faqs = [
    {
      question: 'Which business types does SCIMS support?',
      answer: 'SCIMS supports retail stores, restaurants, pharmacies, service businesses, and hybrid operations. Each business type has specialized features and templates designed for that industry.'
    },
    {
      question: 'How quickly can I set up SCIMS for my business?',
      answer: 'Most businesses are running within 30 minutes. Choose your business type, and SCIMS will provide industry-specific templates, local currency setup, and communication integration.'
    },
    {
      question: 'Can I switch between business types?',
      answer: 'Yes! If your business evolves or you add new services, you can easily switch to hybrid mode or add additional business type features to your existing setup.'
    },
    {
      question: 'Does SCIMS work for restaurants with kitchen management?',
      answer: 'Absolutely! Our restaurant module includes menu management, recipe tracking, kitchen order management, table assignments, and food cost analysis specifically designed for food service businesses.'
    },
    {
      question: 'Is SCIMS suitable for pharmacies with regulatory requirements?',
      answer: 'Yes! Our pharmacy module includes drug inventory tracking, expiry date monitoring, prescription management, batch tracking, and compliance features required for pharmaceutical operations.'
    },
    {
      question: 'Can service businesses manage appointments and technicians?',
      answer: 'Definitely! Service businesses get appointment scheduling, service catalogs, technician tracking, customer management, and service history - everything needed for service-based operations.'
    }
  ];

  return (
    <>
      <OrganizationStructuredData />
      <SoftwareApplicationStructuredData />
      <WebSiteStructuredData />
      <FAQStructuredData faqs={faqs} />
      <HomePageClient />
    </>
  );
}