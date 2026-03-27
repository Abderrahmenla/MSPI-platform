interface TestimonialsSectionProps {
  locale: string;
}

const copy = {
  ar: {
    title: 'ماذا يقول عملاؤنا',
    reviews: [
      {
        text: 'توصيل سريع وجودة ممتازة. شكراً MSPI',
        name: 'أحمد',
        city: 'صفاقس',
      },
      {
        text: 'طفاية ممتازة للمنزل، وصلت في يومين. سعر معقول.',
        name: 'فاطمة',
        city: 'تونس العاصمة',
      },
      {
        text: 'خدمة احترافية للمصنع، التركيب كان سريع ومحكم.',
        name: 'سامي',
        city: 'سوسة',
      },
    ],
  },
  fr: {
    title: 'Ce que disent nos clients',
    reviews: [
      {
        text: 'Livraison rapide et excellente qualité. Merci MSPI !',
        name: 'Ahmed',
        city: 'Sfax',
      },
      {
        text: 'Extincteur parfait pour la maison, livré en 2 jours. Prix raisonnable.',
        name: 'Fatima',
        city: 'Tunis',
      },
      {
        text: 'Service professionnel pour notre usine. Installation rapide et soignée.',
        name: 'Sami',
        city: 'Sousse',
      },
    ],
  },
  en: {
    title: 'What our clients say',
    reviews: [
      {
        text: 'Fast delivery and excellent quality. Thank you MSPI!',
        name: 'Ahmed',
        city: 'Sfax',
      },
      {
        text: 'Perfect home extinguisher, delivered in 2 days. Reasonable price.',
        name: 'Fatima',
        city: 'Tunis',
      },
      {
        text: 'Professional service for our factory. Quick and neat installation.',
        name: 'Sami',
        city: 'Sousse',
      },
    ],
  },
};

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 text-[#ec4130]"
          aria-hidden="true"
        >
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  const t = copy[locale as keyof typeof copy] ?? copy.fr;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <h2 className="mb-10 text-center font-[Rubik] text-2xl font-bold text-gray-900 md:text-3xl">
        {t.title}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {t.reviews.map((r, i) => (
          <figure
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <Stars />
            <blockquote className="flex-1 text-sm text-gray-700 italic">
              &ldquo;{r.text}&rdquo;
            </blockquote>
            <figcaption className="text-xs text-gray-400">
              — {r.name}, {r.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
