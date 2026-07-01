import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  if (q) {
    redirect(`${ROUTES.products}?q=${encodeURIComponent(q)}`);
  }
  redirect(ROUTES.products);
}
