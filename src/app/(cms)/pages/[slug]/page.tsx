import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StoreSettingsPageView } from '@/features/store/store-settings-page-view';
import { STORE_PAGE_SLUGS, STORE_PAGE_TITLES } from '@/features/store/store-content';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const contentKey = STORE_PAGE_SLUGS[slug];
  if (!contentKey) {
    return { title: 'Page' };
  }
  return { title: STORE_PAGE_TITLES[contentKey] };
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const contentKey = STORE_PAGE_SLUGS[slug];

  if (!contentKey) {
    notFound();
  }

  return <StoreSettingsPageView contentKey={contentKey} />;
}
