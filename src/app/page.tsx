import { Suspense } from 'react';
import Link from 'next/link';
import { getHomePageData } from '@/features/catalog/home-data';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { SectionHeading } from '@/components/home/section-heading';
import { ProductGrid } from '@/components/product/product-grid';
import { CategoryStrip } from '@/components/home/category-strip';
import { BrandStrip } from '@/components/home/brand-strip';
import { ReviewsSection } from '@/components/home/reviews-section';
import { RecentlyViewedSection } from '@/components/home/recently-viewed-section';
import { ROUTES } from '@/constants';
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton';

export const revalidate = 60;

function ProductSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function BestSellersSection() {
  const { bestSellers } = await getHomePageData();
  return (
    <section className="container-store py-12 lg:py-16">
      <SectionHeading
        title="Best Sellers"
        subtitle="Top picks loved by athletes across India"
        href={ROUTES.products}
      />
      <ProductGrid products={bestSellers} />
    </section>
  );
}

async function TrendingSection() {
  const { trending } = await getHomePageData();
  return (
    <section className="bg-secondary/40 py-12 lg:py-16">
      <div className="container-store">
        <SectionHeading
          title="Trending Now"
          subtitle="What&apos;s hot this season"
          href={`${ROUTES.products}?sort=trending`}
        />
        <ProductGrid products={trending} />
      </div>
    </section>
  );
}

async function CategoriesSection() {
  const { categories } = await getHomePageData();
  return (
    <section className="container-store py-12 lg:py-16">
      <SectionHeading title="Shop by Category" href={ROUTES.products} />
      <CategoryStrip categories={categories} />
    </section>
  );
}

export default async function HomePage() {
  const { heroSlides } = await getHomePageData();

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PlayPro',
    url: process.env.NEXT_PUBLIC_APP_URL,
    description: 'Premium sports gear and apparel',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HeroCarousel slides={heroSlides} />

      <Suspense fallback={<div className="container-store py-12"><ProductSectionSkeleton /></div>}>
        <BestSellersSection />
      </Suspense>

      <Suspense fallback={<div className="container-store py-12"><ProductSectionSkeleton /></div>}>
        <CategoriesSection />
      </Suspense>

      <Suspense fallback={<div className="container-store py-12"><ProductSectionSkeleton /></div>}>
        <TrendingSection />
      </Suspense>

      <section className="container-store py-12 lg:py-16">
        <SectionHeading title="Top Brands" subtitle="Official gear from leading sports brands" />
        <BrandStrip />
      </section>

      <section className="container-store py-12 lg:py-16">
        <SectionHeading title="Athletes Love Us" subtitle="Real reviews from real players" />
        <ReviewsSection />
      </section>

      <RecentlyViewedSection />

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container-store text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Join the PlayPro Club
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
            Get early access to drops, exclusive offers, and training tips from pro athletes.
          </p>
          <Link
            href={ROUTES.signup}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Create Account
          </Link>
        </div>
      </section>
    </>
  );
}
