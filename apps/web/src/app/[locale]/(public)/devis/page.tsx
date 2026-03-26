import { QuoteForm } from '@/modules/quotes/components';

export const metadata = {
  title: 'Demande de devis — MSPI Fire Safety',
  description:
    "Obtenez un devis gratuit pour vos besoins en sécurité incendie. Notre équipe d'experts vous répond sous 24h.",
};

export default function DevisPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-white px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#ec4130] ring-1 ring-red-100">
            Réponse sous 24h
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Demandez un devis gratuit
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-500">
            Décrivez votre projet de sécurité incendie — installation,
            maintenance ou conformité — et notre équipe d&apos;experts en
            Tunisie vous propose une offre personnalisée.
          </p>
        </div>
      </section>

      {/* Form + Trust signals */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <QuoteForm />
        </div>

        {/* Trust signals */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-4 w-4 text-[#ec4130]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Réponse rapide
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Sous 24h ouvrables</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-4 w-4 text-[#ec4130]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Expertise certifiée
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Normes tunisiennes &amp; internationales
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-4 w-4 text-[#ec4130]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Devis gratuit
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Sans engagement</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
