import type { ProductSummary } from '@/types/catalog';
import type { ProductPrice } from '@/types/pricing';
import { getProductImages } from '@/services/catalog.service';
import { getProductPrices } from '@/services/pricing.service';
import { pickPrimaryProductImageUrl } from '@/lib/product-images';
import { attachPrice, type PricedProduct } from '@/utils/pricing';
import type { EnrichedListProduct } from '@/types/filters';
import { productSlug } from '@/lib/utils';

/** Deterministic mock rating from product id (until reviews API exists). */
export function mockRating(productId: string): { rating: number; reviewCount: number } {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash << 5) - hash + productId.charCodeAt(i);
    hash |= 0;
  }
  const rating = 3.5 + (Math.abs(hash) % 15) / 10;
  const reviewCount = 10 + (Math.abs(hash) % 490);
  return { rating: Math.round(rating * 10) / 10, reviewCount };
}

export function isInStock(statusId?: string): boolean {
  return !statusId || statusId === 'PRODUCT_ACTIVE' || statusId.includes('ACTIVE');
}

/** When true, Add to Cart / Buy Now work regardless of stock (testing only). */
export function bypassStockCheck(): boolean {
  const flag = process.env.NEXT_PUBLIC_BYPASS_STOCK_CHECK;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

export function canPurchase(statusId?: string): boolean {
  return bypassStockCheck() || isInStock(statusId);
}

export async function enrichProduct(
  product: ProductSummary,
): Promise<EnrichedListProduct> {
  const [prices, images] = await Promise.all([
    getProductPrices(product.productId).catch(() => [] as ProductPrice[]),
    getProductImages(product.productId).catch(() => []),
  ]);
  const priced = attachPrice(product, prices);
  const imageUrl = pickPrimaryProductImageUrl(product.productId, images, product);
  const { rating, reviewCount } = mockRating(product.productId);
  return {
    ...priced,
    imageUrl,
    rating,
    reviewCount,
    inStock: isInStock(product.statusId),
  };
}

export async function enrichProducts(
  products: ProductSummary[],
): Promise<EnrichedListProduct[]> {
  return Promise.all(products.map(enrichProduct));
}

export function sortProducts(
  products: EnrichedListProduct[],
  sort: string = 'relevance',
): EnrichedListProduct[] {
  const list = [...products];
  switch (sort) {
    case 'price_asc':
      return list.sort((a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0));
    case 'price_desc':
      return list.sort((a, b) => (b.salePrice ?? 0) - (a.salePrice ?? 0));
    case 'name_asc':
      return list.sort((a, b) =>
        (a.productName ?? a.internalName ?? '').localeCompare(
          b.productName ?? b.internalName ?? '',
        ),
      );
    case 'name_desc':
      return list.sort((a, b) =>
        (b.productName ?? b.internalName ?? '').localeCompare(
          a.productName ?? a.internalName ?? '',
        ),
      );
    case 'rating':
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'discount':
      return list.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    case 'newest':
      return list.sort((a, b) => b.productId.localeCompare(a.productId));
    default:
      return list;
  }
}

export function filterProducts(
  products: EnrichedListProduct[],
  filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    onSale?: boolean;
    brand?: string;
    category?: string;
    categoryId?: string;
    q?: string;
  },
): EnrichedListProduct[] {
  return products.filter((p) => {
    const price = p.salePrice ?? p.listPrice ?? 0;
    if (filters.minPrice != null && price < filters.minPrice) return false;
    if (filters.maxPrice != null && price > filters.maxPrice) return false;
    if (filters.minRating != null && (p.rating ?? 0) < filters.minRating) return false;
    if (filters.inStock && !p.inStock) return false;
    if (filters.onSale && !(p.discountPercent && p.discountPercent > 0)) return false;
    if (filters.brand) {
      const brand = filters.brand.toLowerCase();
      if (!(p.brandName ?? '').toLowerCase().includes(brand)) return false;
    }
    if (filters.category && !filters.categoryId) {
      const cat = filters.category.toLowerCase().replace(/-/g, ' ');
      const haystack = [
        p.productName,
        p.internalName,
        p.description,
        p.productId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(cat)) return false;
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const haystack = [
        p.productId,
        p.productName,
        p.internalName,
        p.brandName,
        p.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function buildFacets(products: EnrichedListProduct[]) {
  const brandMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const ratingBuckets = [4, 3, 2, 1];
  const ratingCounts = new Map<number, number>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of products) {
    const price = p.salePrice ?? p.listPrice ?? 0;
    if (price > 0) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
    if (p.brandName) {
      const key = p.brandName.toLowerCase();
      brandMap.set(key, (brandMap.get(key) ?? 0) + 1);
    }
    const catGuess =
      p.internalName?.split(' ')[0]?.toLowerCase() ??
      p.productName?.split(' ')[0]?.toLowerCase() ??
      'general';
    categoryMap.set(catGuess, (categoryMap.get(catGuess) ?? 0) + 1);
    for (const bucket of ratingBuckets) {
      if ((p.rating ?? 0) >= bucket) {
        ratingCounts.set(bucket, (ratingCounts.get(bucket) ?? 0) + 1);
      }
    }
  }

  return {
    brands: [...brandMap.entries()]
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count),
    categories: [...categoryMap.entries()]
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count),
    priceRange: {
      min: minPrice === Infinity ? 0 : Math.floor(minPrice),
      max: maxPrice === 0 ? 10000 : Math.ceil(maxPrice),
    },
    ratings: ratingBuckets.map((value) => ({
      value,
      label: `${value}★ & above`,
      count: ratingCounts.get(value) ?? 0,
    })),
  };
}

export function toPricedProduct(p: EnrichedListProduct): PricedProduct & { imageUrl?: string } {
  return p;
}

export function suggestionFromProduct(p: EnrichedListProduct) {
  const name = p.productName ?? p.internalName ?? p.productId;
  return {
    type: 'product' as const,
    productId: p.productId,
    label: name,
    slug: productSlug(p.productId, name),
    imageUrl: p.imageUrl,
    price: p.salePrice,
    mrp: p.listPrice,
    discountPercent: p.discountPercent,
    currency: p.currency,
  };
}
