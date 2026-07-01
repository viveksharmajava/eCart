export interface StorefrontSettings {
  productStoreId: string;
  storeName?: string;
  defaultCurrencyUomId?: string;
  contactUsContent?: string;
  aboutUsContent?: string;
  shippingPolicyContent?: string;
  returnsContent?: string;
  privacyPolicyContent?: string;
  termsAndConditionsContent?: string;
  catalogIds?: string[];
}

export type StoreContentField =
  | 'contactUsContent'
  | 'aboutUsContent'
  | 'shippingPolicyContent'
  | 'returnsContent'
  | 'privacyPolicyContent'
  | 'termsAndConditionsContent';
