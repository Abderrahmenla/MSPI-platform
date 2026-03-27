import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';

interface UseCasesSectionProps {
  locale: string;
}

const copy = {
  ar: {
    title: 'لكل مكان... طفاية مناسبة',
    cases: [
      {
        title: 'السيارة',
        desc: 'طفاية 1-2 كغ مثالية للسيارة',
        cta: 'اكتشف',
      },
      {
        title: 'المنزل',
        desc: 'طفاية 6 كغ لحماية عائلتك',
        cta: 'اكتشف',
      },
      {
        title: 'المحل / المصنع',
        desc: 'طفايات 6-9 كغ + خدمة تركيب',
        cta: 'طلب عرض سعر',
      },
    ],
  },
  fr: {
    title: "Pour chaque espace... l'extincteur adapté",
    cases: [
      {
        title: 'La voiture',
        desc: 'Extincteur 1-2 kg idéal pour voiture',
        cta: 'Explorer',
      },
      {
        title: 'La maison',
        desc: 'Extincteur 6 kg pour protéger votre famille',
        cta: 'Explorer',
      },
      {
        title: 'Commerce / Usine',
        desc: 'Extincteurs 6-9 kg + service installation',
        cta: 'Demander un devis',
      },
    ],
  },
  en: {
    title: 'For every space... the right extinguisher',
    cases: [
      {
        title: 'Car',
        desc: '1-2 kg extinguisher ideal for vehicles',
        cta: 'Explore',
      },
      {
        title: 'Home',
        desc: '6 kg extinguisher to protect your family',
        cta: 'Explore',
      },
      {
        title: 'Business / Factory',
        desc: '6-9 kg extinguishers + installation service',
        cta: 'Get a quote',
      },
    ],
  },
};

const icons = [
  /* Car */
  <svg
    key="car"
    viewBox="0 0 48 48"
    fill="none"
    className="h-12 w-12"
    aria-hidden="true"
  >
    <path
      d="M8 28l4-12h24l4 12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="6"
      y="28"
      width="36"
      height="12"
      rx="4"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <circle cx="14" cy="40" r="3" fill="currentColor" />
    <circle cx="34" cy="40" r="3" fill="currentColor" />
  </svg>,
  /* Home */
  <svg
    key="home"
    viewBox="0 0 48 48"
    fill="none"
    className="h-12 w-12"
    aria-hidden="true"
  >
    <path
      d="M6 22L24 6l18 16"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 18v22h10V28h8v12h10V18"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  /* Building */
  <svg
    key="building"
    viewBox="0 0 48 48"
    fill="none"
    className="h-12 w-12"
    aria-hidden="true"
  >
    <rect
      x="6"
      y="10"
      width="36"
      height="32"
      rx="2"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <path d="M6 20h36" stroke="currentColor" strokeWidth="2" />
    <path d="M6 30h36" stroke="currentColor" strokeWidth="2" />
    <path d="M18 42V30" stroke="currentColor" strokeWidth="2" />
    <path d="M30 42V30" stroke="currentColor" strokeWidth="2" />
    <rect
      x="14"
      y="12"
      width="6"
      height="6"
      rx="1"
      fill="currentColor"
      fillOpacity="0.3"
    />
    <rect
      x="28"
      y="12"
      width="6"
      height="6"
      rx="1"
      fill="currentColor"
      fillOpacity="0.3"
    />
  </svg>,
];

const ctaLinks = [ROUTES_MAP.products, ROUTES_MAP.products, ROUTES_MAP.devis];

export function UseCasesSection({ locale }: UseCasesSectionProps) {
  const t = copy[locale as keyof typeof copy] ?? copy.fr;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <h2 className="mb-10 text-center font-[Rubik] text-2xl font-bold text-gray-900 md:text-3xl">
        {t.title}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {t.cases.map((c, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-[#ec4130]">{icons[i]}</span>
            <h3 className="font-[Rubik] text-lg font-semibold text-gray-900">
              {c.title}
            </h3>
            <p className="text-sm text-gray-500">{c.desc}</p>
            <Link
              href={ctaLinks[i]}
              className="mt-auto rounded-lg border border-[#ec4130] px-4 py-2 text-sm font-medium text-[#ec4130] transition-colors hover:bg-[#ec4130] hover:text-white focus-visible:ring-2 focus-visible:ring-[#ec4130] focus-visible:outline-none"
            >
              {c.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
