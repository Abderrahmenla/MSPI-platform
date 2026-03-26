import Link from 'next/link';
import { ROUTES_MAP } from '@/modules/core/constants/routes-map.constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const FACEBOOK_AUTH_URL = `${API_URL}/api/v1/auth/facebook`;

export const metadata = {
  title: 'Connexion — MSPI Fire Safety',
};

export default function LoginPage() {
  return (
    <main className="w-full max-w-sm">
      <div className="rounded-2xl bg-white px-8 py-10 shadow-md ring-1 ring-gray-100">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span
            className="font-rubik text-3xl font-bold"
            style={{ color: '#ec4130' }}
          >
            MSPI
          </span>
          <span className="font-rubik text-sm font-medium tracking-widest text-gray-400 uppercase">
            Fire Safety
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-rubik mb-1 text-center text-xl font-semibold text-gray-900">
          Connectez-vous pour continuer
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Accédez à votre compte, commandes et devis.
        </p>

        {/* Facebook SSO button */}
        <a
          href={FACEBOOK_AUTH_URL}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2]"
          style={{ backgroundColor: '#1877F2' }}
        >
          {/* Facebook "f" SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 flex-shrink-0 fill-white"
          >
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          Continuer avec Facebook
        </a>

        {/* Privacy note */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Nous utilisons uniquement votre nom et votre photo de profil Facebook.
        </p>

        {/* Divider */}
        <hr className="my-6 border-gray-100" />

        {/* Back to home */}
        <div className="text-center">
          <Link
            href={ROUTES_MAP.home}
            className="text-sm text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
