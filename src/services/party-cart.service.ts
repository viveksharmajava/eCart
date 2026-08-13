import type { CartItem } from '@/types/commerce';
import { httpClient } from './http.client';

export interface PartyCartDto {
  partyId?: string;
  items: CartItem[];
}

function itemKey(productId: string, variantId?: string) {
  return variantId ? `${productId}:${variantId}` : productId;
}

export function mergeCartItems(serverItems: CartItem[], localItems: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of serverItems) {
    map.set(itemKey(item.productId, item.variantId), { ...item });
  }
  for (const item of localItems) {
    const key = itemKey(item.productId, item.variantId);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item });
    } else {
      map.set(key, {
        ...existing,
        ...item,
        quantity: Math.max(existing.quantity, item.quantity),
      });
    }
  }
  return [...map.values()];
}

export async function fetchPartyCart(partyId: string, authHeader: string): Promise<PartyCartDto> {
  return httpClient<PartyCartDto>(`/party/persons/${encodeURIComponent(partyId)}/cart`, {
    authHeader,
  });
}

export async function savePartyCart(
  partyId: string,
  items: CartItem[],
  authHeader: string,
): Promise<PartyCartDto> {
  return httpClient<PartyCartDto>(`/party/persons/${encodeURIComponent(partyId)}/cart`, {
    method: 'PUT',
    authHeader,
    body: { partyId, items },
  });
}

export async function clearPartyCart(partyId: string, authHeader: string): Promise<void> {
  await httpClient<void>(`/party/persons/${encodeURIComponent(partyId)}/cart`, {
    method: 'DELETE',
    authHeader,
  });
}
