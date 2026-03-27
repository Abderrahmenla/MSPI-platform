declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function pageView() {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
}

export function viewContent(params: {
  content_ids: string[];
  content_name: string;
  content_type: string;
  value: number;
  currency: string;
}) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'ViewContent', params);
}

export function addToCart(params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'AddToCart', params);
}

export function initiateCheckout(params: { value: number; currency: string }) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'InitiateCheckout', params);
}

export function lead(params: { content_name: string }) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Lead', params);
}
