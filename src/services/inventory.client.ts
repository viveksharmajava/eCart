import type { CartItem } from '@/types/commerce';

export interface UnavailableCartItem {
  productId: string;
  requested: number;
  availableToPromise: number;
}

export async function checkCartInventory(
  items: CartItem[],
): Promise<UnavailableCartItem[]> {
  if (items.length === 0) return [];

  const res = await fetch('/api/inventory/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? 'Inventory check failed');
  }

  return (data.unavailable ?? []) as UnavailableCartItem[];
}

/** Extract product ids from orders/facility inventory failure messages. */
export function parseInventoryFailureProductIds(message: string): string[] {
  if (!message) return [];
  const ids = new Set<string>();
  const patterns = [
    /No inventory found for product\s+([A-Za-z0-9._-]+)/gi,
    /Insufficient inventory for product\s+([A-Za-z0-9._-]+)/gi,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(message)) !== null) {
      if (match[1]) ids.add(match[1]);
    }
  }
  return [...ids];
}
