import { cache } from 'react';
import { STORE_CONFIG } from '@/constants';
import {
  findProducts,
  getCatalogCategories,
  getCategoryProducts,
  getCategoryTree,
  getProductImages,
  getProductsByCatalogSectionType,
} from '@/services/catalog.service';
import { getProductPrices } from '@/services/pricing.service';
import { pickPrimaryProductImageUrl } from '@/lib/product-images';
import { attachPrice, type PricedProduct } from '@/utils/pricing';
import type { CategoryNode, HeroSlide, ProductSummary } from '@/types/catalog';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    title: 'Own The Court',
    subtitle: 'Pro-grade badminton gear engineered for champions.',
    ctaLabel: 'Shop Badminton',
    ctaHref: '/products?category=badminton',
    imageUrl: '/images/hero/hero-badminton.svg',
    imageAlt: 'Badminton player in action',
  },
  {
    id: 'hero-2',
    title: 'Play Bold',
    subtitle: 'Cricket bats, pads and kits — built for match day.',
    ctaLabel: 'Shop Cricket',
    ctaHref: '/products?category=cricket',
    imageUrl: '/images/hero/hero-cricket.svg',
    imageAlt: 'Cricket batsman',
  },
  {
    id: 'hero-3',
    title: 'Run Faster',
    subtitle: 'Performance sports shoes for every surface.',
    ctaLabel: 'Shop Shoes',
    ctaHref: '/products?category=sports-shoes',
    imageUrl: '/images/hero/hero-shoes.svg',
    imageAlt: 'Red running shoe',
  },
];

const EMPTY_HOME_DATA = {
  heroSlides: HERO_SLIDES,
  bestSellers: [] as Array<PricedProduct & { imageUrl?: string }>,
  trending: [] as Array<PricedProduct & { imageUrl?: string }>,
  categories: [] as CategoryNode[],
  catalogCategories: [] as Awaited<ReturnType<typeof getCatalogCategories>>,
};

async function enrichProducts(
  products: ProductSummary[],
): Promise<Array<PricedProduct & { imageUrl?: string }>> {
  const valid = products.filter((p) => p?.productId);
  if (valid.length === 0) return [];

  return Promise.all(
    valid.map(async (product) => {
      try {
        const [prices, images] = await Promise.all([
          getProductPrices(product.productId).catch(() => []),
          getProductImages(product.productId).catch(() => []),
        ]);
        const priced = attachPrice(product, prices);
        const imageUrl = pickPrimaryProductImageUrl(product.productId, images, product);
        return { ...priced, imageUrl };
      } catch {
        return { ...attachPrice(product, []), imageUrl: undefined };
      }
    }),
  );
}

async function loadSectionProducts(
  typeId: string,
  fallbackTypeId: string,
): Promise<Array<PricedProduct & { imageUrl?: string }>> {
  try {
    let products = await getProductsByCatalogSectionType(typeId).catch(() => []);
    if (products.length === 0 && fallbackTypeId !== typeId) {
      products = await getProductsByCatalogSectionType(fallbackTypeId).catch(() => []);
    }
    if (products.length === 0) {
      const page = await findProducts({ noConditionFind: true, page: 0, size: 8 }).catch(
        () => ({ content: [] as ProductSummary[] }),
      );
      products = page.content ?? [];
    }
    return enrichProducts(products);
  } catch (error) {
    console.error('[home] Failed to load section products:', error);
    return [];
  }
}

export const getHomePageData = cache(async function getHomePageData() {
  try {
    const [bestSellers, trending, categoryTree, catalogCategories] = await Promise.all([
      loadSectionProducts(STORE_CONFIG.bestSellerType, STORE_CONFIG.bestSellerFallback),
      loadSectionProducts(STORE_CONFIG.trendingType, STORE_CONFIG.trendingFallback),
      getCategoryTree().catch(() => [] as CategoryNode[]),
      getCatalogCategories().catch(() => []),
    ]);

    const mappedCategories = categoryTree;

    return {
      heroSlides: HERO_SLIDES,
      bestSellers,
      trending,
      categories: mappedCategories,
      catalogCategories,
    };
  } catch (error) {
    console.error('[home] getHomePageData failed — is catalog running on port 8080?', error);
    return EMPTY_HOME_DATA;
  }
});

export async function getProductsWithPricing(
  products: ProductSummary[],
): Promise<Array<PricedProduct & { imageUrl?: string }>> {
  return enrichProducts(products);
}

export async function loadCategoryProducts(categoryId: string) {
  const products = await getCategoryProducts(categoryId).catch(() => []);
  return enrichProducts(products);
}
