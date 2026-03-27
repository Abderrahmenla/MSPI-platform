import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mspi.tn';
const LOCALES = ['ar', 'fr', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/products', '/devis'];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : 0.8,
      });
    }
  }

  return entries;
}
