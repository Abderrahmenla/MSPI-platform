const BADGES = [
  {
    key: 'cod',
    labelAr: 'الدفع عند الاستلام',
    labelFr: 'Paiement à la livraison',
    labelEn: 'Cash on Delivery',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  {
    key: 'delivery',
    labelAr: 'توصيل لكامل تونس',
    labelFr: 'Livraison dans toute la Tunisie',
    labelEn: 'Tunisia-wide Delivery',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="1" />
        <circle cx="12" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
      </svg>
    ),
  },
  {
    key: 'certified',
    labelAr: 'منتجات معتمدة',
    labelFr: 'Produits certifiés',
    labelEn: 'Certified Products',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    key: 'support',
    labelAr: 'دعم واتساب مباشر',
    labelFr: 'Support WhatsApp direct',
    labelEn: 'WhatsApp Support',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
] as const;

function getLabel(badge: (typeof BADGES)[number], locale: string): string {
  if (locale === 'ar') return badge.labelAr;
  if (locale === 'fr') return badge.labelFr;
  return badge.labelEn;
}

interface TrustBadgesProps {
  locale: string;
  className?: string;
}

export function TrustBadges({ locale, className }: TrustBadgesProps) {
  return (
    <div
      className={[
        'flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-x-visible md:pb-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {BADGES.map((badge) => (
        <div
          key={badge.key}
          className="flex min-w-[9rem] flex-1 flex-col items-center gap-2 rounded-xl bg-gray-50 px-4 py-4 text-center md:min-w-0"
        >
          <span className="text-brand-500">{badge.icon}</span>
          <span className="text-xs leading-snug font-medium text-gray-700">
            {getLabel(badge, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}
