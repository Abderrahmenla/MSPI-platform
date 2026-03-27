import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';

interface QuoteCtaBannerProps {
  locale: string;
}

const WHATSAPP_NUMBER = '21600000000';

const copy = {
  ar: {
    title: 'تحتاج تركيب أو معاينة؟',
    subtitle: 'احصل على عرض سعر مجاني خلال 24 ساعة',
    cta: 'طلب عرض سعر',
    waLabel: 'أو تواصل معنا عبر واتساب',
    waMsg: 'مرحبا، أريد الاستفسار عن خدمات التركيب',
  },
  fr: {
    title: "Besoin d'une installation ou d'une inspection ?",
    subtitle: 'Obtenez un devis gratuit en 24 heures',
    cta: 'Demander un devis',
    waLabel: 'Ou contactez-nous via WhatsApp',
    waMsg: 'Bonjour, je voudrais un devis pour une installation',
  },
  en: {
    title: 'Need installation or inspection?',
    subtitle: 'Get a free quote within 24 hours',
    cta: 'Request a Quote',
    waLabel: 'Or contact us on WhatsApp',
    waMsg: 'Hello, I would like a quote for installation',
  },
};

export function QuoteCtaBanner({ locale }: QuoteCtaBannerProps) {
  const t = copy[locale as keyof typeof copy] ?? copy.fr;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.waMsg)}`;

  return (
    <section
      className="px-4 py-16 text-center md:px-8"
      style={{
        background: 'linear-gradient(135deg, #ec4130 0%, #c12e24 100%)',
      }}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 className="font-[Rubik] text-2xl font-bold text-white md:text-3xl">
          {t.title}
        </h2>
        <p className="text-base text-white/80">{t.subtitle}</p>
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES_MAP.devis}
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#ec4130] shadow-md transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            {t.cta}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border-2 border-white px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            {t.waLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
