import type { ProductDetail, ProductImageInfo } from '@/types/catalog';

export interface GallerySlide {
  id: string;
  label?: string;
  thumbUrl: string;
  displayUrl: string;
  zoomUrl: string;
}

const SIZE_ORDER = ['detail', 'large', 'medium', 'small'] as const;
const THUMB_SIZE_ORDER = ['small', 'medium', 'large', 'detail'] as const;

/** Map a stored catalog image path or URL to an app-relative image URL. */
export function resolveCatalogImageUrl(
  productId: string,
  raw?: string | null,
): string | undefined {
  if (!raw?.trim()) return undefined;

  const trimmed = raw.trim().replace(/\\/g, '/');

  if (/^https?:\/\//i.test(trimmed)) {
    const catalogMatch = trimmed.match(/\/catalog\/product-images\/([^/]+)\/([^/?#]+)/);
    if (catalogMatch) {
      return `/catalog/product-images/${encodeURIComponent(catalogMatch[1])}/${encodeURIComponent(catalogMatch[2])}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith('/catalog/product-images/')) {
    return trimmed;
  }

  const parts = trimmed.replace(/^\/+/, '').split('/');
  if (parts.length >= 2) {
    const pid = parts[0];
    const fileName = parts[parts.length - 1];
    return `/catalog/product-images/${encodeURIComponent(pid)}/${encodeURIComponent(fileName)}`;
  }

  return `/catalog/product-images/${encodeURIComponent(productId)}/${encodeURIComponent(trimmed)}`;
}

/** Resolve a single image entry from the catalog images API. */
export function resolveProductImageInfo(
  productId: string,
  info: ProductImageInfo,
): string | undefined {
  if (info.uploaded && info.fileName) {
    return `/catalog/product-images/${encodeURIComponent(productId)}/${encodeURIComponent(info.fileName)}`;
  }
  if (info.url) {
    return resolveCatalogImageUrl(productId, info.url);
  }
  return undefined;
}

function pickUrl(
  bySize: Map<string, string>,
  sizes: readonly string[],
): string | undefined {
  for (const size of sizes) {
    const url = bySize.get(size);
    if (url) return url;
  }
  return undefined;
}

/** Build PDP gallery slides from catalog image metadata and product image fields. */
export function buildProductGallery(
  productId: string,
  apiImages: ProductImageInfo[],
  product?: Pick<
    ProductDetail,
    'smallImageUrl' | 'mediumImageUrl' | 'largeImageUrl' | 'detailImageUrl'
  >,
): GallerySlide[] {
  const bySize = new Map<string, string>();

  for (const info of apiImages) {
    const resolved = resolveProductImageInfo(productId, info);
    if (resolved && info.size) {
      bySize.set(info.size.toLowerCase(), resolved);
    }
  }

  const fieldFallback: Record<string, string | undefined> = {
    small: product?.smallImageUrl,
    medium: product?.mediumImageUrl,
    large: product?.largeImageUrl,
    detail: product?.detailImageUrl,
  };

  for (const [size, raw] of Object.entries(fieldFallback)) {
    if (bySize.has(size)) continue;
    const resolved = resolveCatalogImageUrl(productId, raw);
    if (resolved) bySize.set(size, resolved);
  }

  const zoomUrl =
    pickUrl(bySize, ['detail', 'large']) ??
    pickUrl(bySize, ['medium', 'small']) ??
    undefined;
  const defaultDisplay =
    pickUrl(bySize, ['large', 'detail', 'medium', 'small']) ?? zoomUrl;
  const defaultThumb =
    pickUrl(bySize, THUMB_SIZE_ORDER) ?? defaultDisplay;

  if (!defaultDisplay) return [];

  const seen = new Set<string>();
  const slides: GallerySlide[] = [];

  for (const size of SIZE_ORDER) {
    const url = bySize.get(size);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    slides.push({
      id: size,
      label: size,
      thumbUrl: bySize.get('small') ?? bySize.get('medium') ?? url,
      displayUrl: url,
      zoomUrl: zoomUrl ?? url,
    });
  }

  if (slides.length === 0) {
    slides.push({
      id: 'primary',
      thumbUrl: defaultThumb ?? defaultDisplay,
      displayUrl: defaultDisplay,
      zoomUrl: zoomUrl ?? defaultDisplay,
    });
  }

  return slides;
}

/** Best list-card image URL from catalog image metadata. */
export function pickPrimaryProductImageUrl(
  productId: string,
  apiImages: ProductImageInfo[],
  product?: Pick<
    ProductDetail,
    'smallImageUrl' | 'mediumImageUrl' | 'largeImageUrl' | 'detailImageUrl'
  >,
): string | undefined {
  const gallery = buildProductGallery(productId, apiImages, product);
  if (gallery.length === 0) return undefined;
  return gallery[0].displayUrl;
}
