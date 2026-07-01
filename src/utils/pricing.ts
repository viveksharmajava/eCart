import type { ProductPrice } from '@/types/pricing';
import type { ProductSummary } from '@/types/catalog';

const PURCHASE_PURPOSE = 'PURCHASE';
const DEFAULT_SALE_TYPE = 'DEFAULT_PRICE';
const MRP_TYPE = 'MAXIMUM_PRICE';
const LEGACY_LIST_TYPE = 'LIST_PRICE';

function isPriceEffective(row: ProductPrice, at = Date.now()): boolean {
  if (row.fromDate) {
    const from = new Date(row.fromDate).getTime();
    if (!Number.isNaN(from) && from > at) return false;
  }
  if (row.thruDate) {
    const thru = new Date(row.thruDate).getTime();
    if (!Number.isNaN(thru) && thru < at) return false;
  }
  return true;
}

function matchesPurpose(row: ProductPrice): boolean {
  return !row.productPricePurposeId || row.productPricePurposeId === PURCHASE_PURPOSE;
}

/** Pick the current effective row for a price type (latest fromDate wins). */
export function pickPriceByType(
  prices: ProductPrice[],
  typeId: string,
): ProductPrice | undefined {
  const effective = prices
    .filter((p) => p.productPriceTypeId === typeId && matchesPurpose(p) && isPriceEffective(p))
    .sort((a, b) => {
      const ta = a.fromDate ? new Date(a.fromDate).getTime() : 0;
      const tb = b.fromDate ? new Date(b.fromDate).getTime() : 0;
      return tb - ta;
    });

  if (effective.length > 0) return effective[0];

  return prices.find((p) => p.productPriceTypeId === typeId && matchesPurpose(p));
}

/** Storefront sale price: DEFAULT_PRICE, then LIST_PRICE fallback. */
export function pickSalePriceRow(prices: ProductPrice[]): ProductPrice | undefined {
  return (
    pickPriceByType(prices, DEFAULT_SALE_TYPE) ?? pickPriceByType(prices, LEGACY_LIST_TYPE)
  );
}

/** MRP for discount display: MAXIMUM_PRICE only (do not reuse LIST_PRICE as MRP). */
export function pickMrpPriceRow(prices: ProductPrice[]): ProductPrice | undefined {
  return pickPriceByType(prices, MRP_TYPE);
}

/** @deprecated Use pickSalePriceRow or pickMrpPriceRow */
export function pickListPrice(prices: ProductPrice[]): ProductPrice | undefined {
  return pickPriceByType(prices, LEGACY_LIST_TYPE);
}

export function priceWithTax(priceRow: ProductPrice | undefined): number | null {
  if (!priceRow || priceRow.price == null) return null;
  const base = Number(priceRow.price);
  if (Number.isNaN(base)) return null;
  const taxInPrice = String(priceRow.taxInPrice ?? 'N').toUpperCase();
  if (taxInPrice === 'Y') return roundMoney(base);
  const taxPct = Number(priceRow.taxPercentage);
  const rate = Number.isNaN(taxPct) ? 0 : taxPct;
  return roundMoney(base * (1 + rate / 100));
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function computeDiscountPercent(mrp: number, sale: number): number {
  if (mrp <= 0 || sale >= mrp) return 0;
  return Math.round(((mrp - sale) / mrp) * 100);
}

export interface PricedProduct extends ProductSummary {
  /** MRP (MAXIMUM_PRICE, tax-inclusive when applicable). */
  listPrice?: number;
  /** Sale price (DEFAULT_PRICE, tax-inclusive when applicable). */
  salePrice?: number;
  currency?: string;
  discountPercent?: number;
}

export function attachPrice(product: ProductSummary, prices: ProductPrice[]): PricedProduct {
  const saleRow = pickSalePriceRow(prices);
  const mrpRow = pickMrpPriceRow(prices);

  const salePrice = priceWithTax(saleRow) ?? undefined;
  const mrp = priceWithTax(mrpRow) ?? undefined;

  const discountPercent =
    mrp != null && salePrice != null ? computeDiscountPercent(mrp, salePrice) : undefined;

  return {
    ...product,
    listPrice: mrp,
    salePrice,
    currency: saleRow?.currencyUomId ?? mrpRow?.currencyUomId,
    discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
  };
}
