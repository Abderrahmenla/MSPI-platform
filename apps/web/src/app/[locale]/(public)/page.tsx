import { use } from 'react';
import { TrustBadges } from '@/modules/core/components';
import { ProductsGrid } from '@/modules/products/components';
import { HeroSection } from '@/modules/home/components/hero-section';
import { UseCasesSection } from '@/modules/home/components/use-cases-section';
import { HowItWorksSection } from '@/modules/home/components/how-it-works-section';
import { QuoteCtaBanner } from '@/modules/home/components/quote-cta-banner';
import { TestimonialsSection } from '@/modules/home/components/testimonials-section';
import { FaqSection } from '@/modules/home/components/faq-section';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = use(params);

  return (
    <>
      <HeroSection locale={locale} />
      <TrustBadges locale={locale} />
      <UseCasesSection locale={locale} />
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="mb-8 text-center font-[Rubik] text-2xl font-bold text-gray-900 md:text-3xl">
          {locale === 'ar'
            ? 'منتجاتنا'
            : locale === 'fr'
              ? 'Nos produits'
              : 'Our Products'}
        </h2>
        <ProductsGrid locale={locale} />
      </section>
      <HowItWorksSection locale={locale} />
      <QuoteCtaBanner locale={locale} />
      <TestimonialsSection locale={locale} />
      <FaqSection locale={locale} />
    </>
  );
}
