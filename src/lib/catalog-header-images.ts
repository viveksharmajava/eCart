/** Map a stored catalog header-logo path or URL to an app-relative image URL. */
export function resolveCatalogHeaderImageUrl(
  prodCatalogId: string,
  raw?: string | null,
): string | undefined {
  if (!raw?.trim()) return undefined;

  const trimmed = raw.trim().replace(/\\/g, '/');

  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/\/catalog\/catalog-images\/([^/]+)\/([^/?#]+)/);
    if (match) {
      return `/catalog/catalog-images/${encodeURIComponent(match[1])}/${encodeURIComponent(match[2])}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith('/catalog/catalog-images/')) {
    return trimmed;
  }

  const parts = trimmed.replace(/^\/+/, '').split('/');
  if (parts.length >= 2) {
    const id = parts[0];
    const fileName = parts[parts.length - 1];
    return `/catalog/catalog-images/${encodeURIComponent(id)}/${encodeURIComponent(fileName)}`;
  }

  return `/catalog/catalog-images/${encodeURIComponent(prodCatalogId)}/${encodeURIComponent(trimmed)}`;
}
