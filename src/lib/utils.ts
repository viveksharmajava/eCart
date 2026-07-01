import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'INR',
  locale = 'en-IN',
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
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
  const encodedId = encodeURIComponent(id.toLowerCase());
  if (name) {
    const nameSlug = slugify(name);
    return nameSlug ? `${nameSlug}--${encodedId}` : encodedId;
  }
  return encodedId;
}

/**
 * Extracts catalog product ID from a URL slug.
 * New format: {name-slug}--{encoded-product-id}
 * Legacy format: {name-slug}-{id} (still supported for older links)
 */
export function parseProductSlug(slug: string): string {
  const decoded = decodeURIComponent(slug.trim());

  const sepIndex = decoded.indexOf('--');
  if (sepIndex >= 0) {
    const idPart = decoded.slice(sepIndex + 2);
    try {
      return decodeURIComponent(idPart).toUpperCase();
    } catch {
      return idPart.toUpperCase();
    }
  }

  return parseLegacyProductSlug(decoded);
}

function parseLegacyProductSlug(slug: string): string {
  const lower = slug.toLowerCase();
  const prodIdx = lower.lastIndexOf('prod-');
  if (prodIdx >= 0) {
    return slug.slice(prodIdx).toUpperCase();
  }

  const parts = slug.split('-');
  const last = parts[parts.length - 1];
  if (last && /^[a-z0-9]+$/i.test(last)) {
    return last.toUpperCase();
  }

  return slug.toUpperCase();
}

export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
