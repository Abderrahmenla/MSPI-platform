interface HowItWorksSectionProps {
  locale: string;
}

const copy = {
  ar: {
    title: 'كيف تطلب؟',
    steps: [
      {
        num: '١',
        title: 'اختر منتجك',
        desc: 'تصفح كتالوجنا وأضف منتجك للسلة',
      },
      {
        num: '٢',
        title: 'أكد طلبك',
        desc: 'سنتصل بك لتأكيد الطلب عبر الهاتف أو واتساب',
      },
      {
        num: '٣',
        title: 'استلم وادفع',
        desc: 'الدفع عند الاستلام — بدون بطاقة بنكية',
      },
    ],
  },
  fr: {
    title: 'Comment commander ?',
    steps: [
      {
        num: '1',
        title: 'Choisissez votre produit',
        desc: 'Parcourez notre catalogue et ajoutez au panier',
      },
      {
        num: '2',
        title: 'Confirmez votre commande',
        desc: 'Nous vous appelons pour confirmer par téléphone ou WhatsApp',
      },
      {
        num: '3',
        title: 'Recevez et payez',
        desc: 'Paiement à la livraison — aucune carte bancaire requise',
      },
    ],
  },
  en: {
    title: 'How to order?',
    steps: [
      {
        num: '1',
        title: 'Choose your product',
        desc: 'Browse our catalog and add to cart',
      },
      {
        num: '2',
        title: 'Confirm your order',
        desc: 'We call to confirm via phone or WhatsApp',
      },
      {
        num: '3',
        title: 'Receive & pay',
        desc: 'Pay cash on delivery — no card needed',
      },
    ],
  },
};

const stepIcons = [
  /* Cart */
  <svg
    key="cart"
    viewBox="0 0 32 32"
    fill="none"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path
      d="M4 6h3l3 14h12l3-10H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="13" cy="24" r="2" fill="currentColor" />
    <circle cx="21" cy="24" r="2" fill="currentColor" />
  </svg>,
  /* Phone */
  <svg
    key="phone"
    viewBox="0 0 32 32"
    fill="none"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path
      d="M6 4h6l3 7-3 2a18 18 0 0 0 7 7l2-3 7 3v6c0 2-2 4-4 3C10 26 6 16 6 8c-1-2 1-4 3-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  /* Truck */
  <svg
    key="truck"
    viewBox="0 0 32 32"
    fill="none"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="8"
      width="20"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M22 12h4l4 6v4h-8V12z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="24" r="2.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="24" cy="24" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>,
];

export function HowItWorksSection({ locale }: HowItWorksSectionProps) {
  const t = copy[locale as keyof typeof copy] ?? copy.fr;

  return (
    <section className="bg-gray-50 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center font-[Rubik] text-2xl font-bold text-gray-900 md:text-3xl">
          {t.title}
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-4 text-center"
            >
              {/* Number circle */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ec4130] font-[Rubik] text-lg font-bold text-white">
                {step.num}
              </div>
              {/* Icon */}
              <span className="text-gray-400">{stepIcons[i]}</span>
              <h3 className="font-[Rubik] text-base font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
              {/* Connector line (hidden on last) */}
              {i < 2 && (
                <div
                  className="hidden h-px w-full bg-gray-200 md:block"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
