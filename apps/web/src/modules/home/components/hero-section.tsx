'use client';

import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  locale: string;
}

const copy = {
  ar: {
    h1: 'احمِ ما يهمّك',
    subtitle: 'طفايات حريق معتمدة — توصيل لكل تونس — الدفع عند الاستلام',
    shop: 'تسوق الآن',
    quote: 'طلب عرض سعر مجاني',
  },
  fr: {
    h1: 'Protégez ce qui compte',
    subtitle:
      'Extincteurs certifiés — Livraison partout en Tunisie — Paiement à la livraison',
    shop: 'Acheter maintenant',
    quote: 'Devis gratuit',
  },
  en: {
    h1: 'Protect What Matters',
    subtitle:
      'Certified fire extinguishers — Delivery across Tunisia — Cash on delivery',
    shop: 'Shop Now',
    quote: 'Get Free Quote',
  },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const, delay },
});

const fadeIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' as const, delay: 0.1 },
};

export function HeroSection({ locale }: HeroSectionProps) {
  const t = copy[locale as keyof typeof copy] ?? copy.fr;
  const isRtl = locale === 'ar';

  return (
    <section
      className="relative flex min-h-[85vh] w-full items-center overflow-hidden md:min-h-[70vh]"
      style={{
        background: 'linear-gradient(135deg, #ec4130 0%, #c12e24 100%)',
      }}
      aria-label={t.h1}
    >
      {/* Dot pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-20 md:flex-row md:items-center md:gap-12 md:px-8">
        {/* Text block */}
        <div
          className={`flex flex-1 flex-col items-center gap-6 text-center md:items-start md:text-start ${isRtl ? 'md:text-right' : 'md:text-left'}`}
        >
          <motion.h1
            className="font-[Rubik] text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl"
            {...fadeUp(0)}
          >
            {t.h1}
          </motion.h1>

          <motion.p
            className="max-w-lg text-base text-white/80 md:text-lg"
            {...fadeUp(0.1)}
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            {...fadeUp(0.2)}
          >
            <Link
              href={ROUTES_MAP.products}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#ec4130] shadow-md transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#ec4130] focus-visible:outline-none"
            >
              {t.shop}
            </Link>
            <Link
              href={ROUTES_MAP.devis}
              className="rounded-xl border-2 border-white px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#ec4130] focus-visible:outline-none"
            >
              {t.quote}
            </Link>
          </motion.div>
        </div>

        {/* Hero illustration */}
        <motion.div
          className="flex flex-1 items-center justify-center"
          {...fadeIn}
        >
          <svg
            viewBox="0 0 200 320"
            fill="none"
            className="h-48 w-auto drop-shadow-2xl md:h-72"
            aria-hidden="true"
          >
            {/* Fire extinguisher body */}
            <rect
              x="60"
              y="80"
              width="80"
              height="200"
              rx="40"
              fill="white"
              fillOpacity="0.15"
              stroke="white"
              strokeWidth="3"
            />
            <rect
              x="70"
              y="90"
              width="60"
              height="180"
              rx="30"
              fill="white"
              fillOpacity="0.1"
            />
            {/* Top */}
            <rect
              x="75"
              y="55"
              width="50"
              height="30"
              rx="8"
              fill="white"
              fillOpacity="0.3"
            />
            <rect
              x="92"
              y="30"
              width="16"
              height="28"
              rx="4"
              fill="white"
              fillOpacity="0.5"
            />
            {/* Handle */}
            <path
              d="M140 90 Q170 90 170 110 Q170 130 140 130"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Label stripe */}
            <rect
              x="62"
              y="150"
              width="76"
              height="40"
              rx="4"
              fill="#ec4130"
              fillOpacity="0.6"
            />
            <rect
              x="68"
              y="158"
              width="64"
              height="6"
              rx="3"
              fill="white"
              fillOpacity="0.8"
            />
            <rect
              x="68"
              y="170"
              width="44"
              height="4"
              rx="2"
              fill="white"
              fillOpacity="0.5"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
