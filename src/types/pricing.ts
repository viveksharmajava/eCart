export interface ProductPrice {
  productId: string;
  productPriceTypeId: string;
  productPricePurposeId?: string;
  currencyUomId?: string;
  productStoreGroupId?: string;
  price?: number;
  taxPercentage?: number;
  taxInPrice?: string;
  fromDate?: string;
  thruDate?: string;
}
