'use client';

import { useState } from 'react';

interface FaqSectionProps {
  locale: string;
}

const copy = {
  ar: {
    title: 'أسئلة شائعة',
    items: [
      {
        q: 'هل الدفع عند الاستلام فقط؟',
        a: 'نعم، جميع طلباتنا تُدفع نقداً عند الاستلام. لا حاجة لبطاقة بنكية.',
      },
      {
        q: 'كم مدة التوصيل؟',
        a: 'التوصيل خلال 24 إلى 72 ساعة في معظم ولايات تونس.',
      },
      {
        q: 'هل الطفايات معتمدة؟',
        a: 'نعم، جميع منتجاتنا معتمدة ومطابقة للمعايير الأوروبية والتونسية.',
      },
      {
        q: 'كيف أطلب عرض سعر للمؤسسات؟',
        a: 'استخدم نموذج "طلب عرض سعر" في الموقع أو تواصل معنا عبر واتساب. سنتواصل معك خلال 24 ساعة.',
      },
      {
        q: 'هل يمكنني إرجاع المنتج؟',
        a: 'نعم، يمكن إرجاع المنتج خلال 7 أيام إذا كان في حالته الأصلية غير مستخدم.',
      },
    ],
  },
  fr: {
    title: 'Questions fréquentes',
    items: [
      {
        q: 'Le paiement est-il uniquement à la livraison ?',
        a: 'Oui, tous nos paiements se font en espèces à la livraison. Aucune carte bancaire requise.',
      },
      {
        q: 'Quel est le délai de livraison ?',
        a: 'Livraison sous 24 à 72 heures dans la plupart des gouvernorats de Tunisie.',
      },
      {
        q: 'Les extincteurs sont-ils certifiés ?',
        a: 'Oui, tous nos produits sont certifiés conformes aux normes européennes et tunisiennes.',
      },
      {
        q: 'Comment demander un devis pour les entreprises ?',
        a: 'Utilisez le formulaire de devis sur le site ou contactez-nous via WhatsApp. Nous vous répondons sous 24 heures.',
      },
      {
        q: 'Puis-je retourner un produit ?',
        a: "Oui, retour possible sous 7 jours si le produit est dans son état d'origine non utilisé.",
      },
    ],
  },
  en: {
    title: 'Frequently Asked Questions',
    items: [
      {
        q: 'Is payment only on delivery?',
        a: 'Yes, all payments are cash on delivery. No credit card needed.',
      },
      {
        q: 'What is the delivery time?',
        a: 'Delivery within 24 to 72 hours in most Tunisian regions.',
      },
      {
        q: 'Are the extinguishers certified?',
        a: 'Yes, all our products are certified and comply with European and Tunisian standards.',
      },
      {
        q: 'How do I request a business quote?',
        a: 'Use the quote form on the site or contact us via WhatsApp. We respond within 24 hours.',
      },
      {
        q: 'Can I return a product?',
        a: 'Yes, returns accepted within 7 days if the product is unused and in original condition.',
      },
    ],
  },
};

export function FaqSection({ locale }: FaqSectionProps) {
  const t = copy[locale as keyof typeof copy] ?? copy.fr;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-gray-50 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-8 text-center font-[Rubik] text-2xl font-bold text-gray-900 md:text-3xl">
          {t.title}
        </h2>
        <dl className="space-y-2">
          {t.items.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <dt>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-center justify-between px-5 py-4 text-start text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#ec4130] focus-visible:outline-none focus-visible:ring-inset"
                >
                  <span>{item.q}</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </dt>
              {open === i && (
                <dd className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600">
                  {item.a}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
