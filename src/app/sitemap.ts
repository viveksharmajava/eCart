import type { MetadataRoute } from 'next';
import { getAllCmsSlugs } from '@/features/cms/cms-content';
import { getAppUrl } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const staticRoutes = ['', '/products', '/cart', '/help', '/contact', '/login', '/signup'];
  const cmsRoutes = getAllCmsSlugs().map((slug) => `/pages/${slug}`);

  return [...staticRoutes, ...cmsRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
