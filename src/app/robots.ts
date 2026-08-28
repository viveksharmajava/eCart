import type { MetadataRoute } from 'next';
import { getAppUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account/', '/checkout/'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
