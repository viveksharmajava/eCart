import { cache } from 'react';
import { STORE_CONFIG } from '@/constants';
import {
  findProducts,
  getCatalogCategories,
  getCategoryProducts,
  getProductImages,
  getProductsByCatalogSectionType,
} from '@/services/catalog.service';
import { getProductPrices } from '@/services/pricing.service';
import { pickPrimaryProductImageUrl } from '@/lib/product-images';
import { resolveCatalogHeaderImageUrl } from '@/lib/catalog-header-images';
import { productsCatalogHref } from '@/lib/category-links';
import { getStorefrontCatalogs } from '@/features/catalog/store-catalogs';
import { attachPrice, type PricedProduct } from '@/utils/pricing';
import type { HeroSlide, ProductSummary, ProdCatalogSummary } from '@/types/catalog';

const EMPTY_HOME_DATA = {
  heroSlides: [] as HeroSlide[],
  bestSellers: [] as Array<PricedProduct & { imageUrl?: string }>,
  trending: [] as Array<PricedProduct & { imageUrl?: string }>,
  catalogs: [] as ProdCatalogSummary[],
  catalogCategories: [] as Awaited<ReturnType<typeof getCatalogCategories>>,
};

async function loadHeroSlidesFromCatalogs(): Promise<HeroSlide[]> {
  try {
    const catalogs = await getStorefrontCatalogs();

    return catalogs.flatMap((catalog) => {
      const imageUrl = resolveCatalogHeaderImageUrl(catalog.prodCatalogId, catalog.headerLogo);
      if (!imageUrl) return [];

      const title = catalog.catalogName?.trim() || catalog.prodCatalogId;
      return [
        {
          id: catalog.prodCatalogId,
          title,
          subtitle: `Explore the latest from ${title}.`,
          ctaLabel: `Shop ${title}`,
          ctaHref: productsCatalogHref(catalog.prodCatalogId),
          imageUrl,
          imageAlt: `${title} catalog`,
        } satisfies HeroSlide,
      ];
    });
  } catch (error) {
    console.error('[home] Failed to load catalog hero slides', error);
    return [];
  }
}

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
    const [heroSlides, bestSellers, trending, catalogs, catalogCategories] =
      await Promise.all([
        loadHeroSlidesFromCatalogs(),
        loadSectionProducts(STORE_CONFIG.bestSellerType, STORE_CONFIG.bestSellerFallback),
        loadSectionProducts(STORE_CONFIG.trendingType, STORE_CONFIG.trendingFallback),
        getStorefrontCatalogs(),
        getCatalogCategories().catch(() => []),
      ]);

    return {
      heroSlides,
      bestSellers,
      trending,
      catalogs,
      catalogCategories,
    };
  } catch (error) {
    console.error('[home] getHomePageData failed — is catalog running on port 8085?', error);
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
