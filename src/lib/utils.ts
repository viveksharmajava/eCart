import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Canonical public site URL. Treats blank env as missing (Docker ARG defaults can be ""). */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
}

export function formatCurrency(
  amount: number,
  currency?: string | null,
  locale = 'en-IN',
): string {
  const code =
    currency && /^[A-Za-z]{3}$/.test(currency.trim())
      ? currency.trim().toUpperCase()
      : (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'INR');
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(value);
}

export function slugify(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function productSlug(productId?: string | null, name?: string): string {
  const id = productId?.trim();
  if (!id) return 'product';
  // Preserve original productId case — catalog IDs are case-sensitive (e.g. s-10 ≠ S-10).
  const encodedId = encodeURIComponent(id);
  if (name) {
    const nameSlug = slugify(name);
    return nameSlug ? `${nameSlug}--${encodedId}` : encodedId;
  }
  return encodedId;
}

/**
 * Extracts catalog product ID from a URL slug.
 * Preferred format: {name-slug}--{encoded-product-id}
 * Also supports a bare product id (e.g. /products/s-10) and legacy PROD-… links.
 */
export function parseProductSlug(slug: string): string {
  const decoded = decodeURIComponent(slug.trim());
  if (!decoded) return '';

  const sepIndex = decoded.indexOf('--');
  if (sepIndex >= 0) {
    const idPart = decoded.slice(sepIndex + 2);
    try {
      return decodeURIComponent(idPart);
    } catch {
      return idPart;
    }
  }

  return parseLegacyProductSlug(decoded);
}

function parseLegacyProductSlug(slug: string): string {
  const lower = slug.toLowerCase();
  const prodIdx = lower.lastIndexOf('prod-');
  if (prodIdx >= 0) {
    return slug.slice(prodIdx);
  }

  // Bare product id in the path (cart links, short ids like s-10, sg-100-5-red).
  // Do not take only the last hyphen segment — that breaks ids that contain '-'.
  if (!slug.includes('--') && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug)) {
    return slug;
  }

  return slug;
}

export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
