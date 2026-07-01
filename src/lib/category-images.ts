/** Map a stored category image path or URL to an app-relative image URL. */
export function resolveCategoryImageUrl(
  categoryId: string,
  raw?: string | null,
): string | undefined {
  if (!raw?.trim()) return undefined;

  const trimmed = raw.trim().replace(/\\/g, '/');

  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/\/catalog\/category-images\/([^/]+)\/([^/?#]+)/);
    if (match) {
      return `/catalog/category-images/${encodeURIComponent(match[1])}/${encodeURIComponent(match[2])}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith('/catalog/category-images/')) {
    return trimmed;
  }

  const parts = trimmed.replace(/^\/+/, '').split('/');
  if (parts.length >= 2) {
    const id = parts[0];
    const fileName = parts[parts.length - 1];
    return `/catalog/category-images/${encodeURIComponent(id)}/${encodeURIComponent(fileName)}`;
  }

  return `/catalog/category-images/${encodeURIComponent(categoryId)}/${encodeURIComponent(trimmed)}`;
}
