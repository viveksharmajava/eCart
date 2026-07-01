import type { CartItem } from '@/types/commerce';
import { STORE_CONFIG } from '@/constants';

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING = 99;
export const EXPRESS_SHIPPING = 199;

export interface CartTotals {
  subtotal: number;
  couponDiscount: number;
  shipping: number;
  grandTotal: number;
  currency: string;
}

export function computeCartTotals(
  items: CartItem[],
  couponDiscount = 0,
  shippingMethod: 'standard' | 'express' = 'standard',
): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = Math.min(couponDiscount, subtotal);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping =
    afterDiscount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : shippingMethod === 'express'
        ? EXPRESS_SHIPPING
        : STANDARD_SHIPPING;
  const currency = items[0]?.currency ?? STORE_CONFIG.defaultCurrency;

  return {
    subtotal,
    couponDiscount: discount,
    shipping,
    grandTotal: afterDiscount + shipping,
    currency,
  };
}

export function applyCouponCode(code: string, subtotal: number): number {
  const normalized = code.trim().toUpperCase();
  if (normalized === 'PLAY10') return subtotal * 0.1;
  if (normalized === 'FLAT100') return 100;
  return 0;
}

export interface CreateOrderPayload {
  partyId: string;
  currencyUom: string;
  productStoreId: string;
  orderName?: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

export function cartToOrderPayload(
  items: CartItem[],
  partyId: string,
  orderName?: string,
): CreateOrderPayload {
  return {
    partyId,
    currencyUom: items[0]?.currency ?? STORE_CONFIG.defaultCurrency,
    productStoreId: STORE_CONFIG.productStoreId,
    orderName,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

export function guestPartyId(email: string): string {
  return `GUEST-${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`;
}
