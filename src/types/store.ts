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

/** Public payment option from catalog (secrets omitted). */
export interface StorefrontPaymentMethod {
  paymentMethodId: string;
  paymentType: string;
  displayName: string;
  gatewayProvider?: string | null;
  publishableKey?: string | null;
  sequenceNum?: number;
}

export type StoreContentField =
  | 'contactUsContent'
  | 'aboutUsContent'
  | 'shippingPolicyContent'
  | 'returnsContent'
  | 'privacyPolicyContent'
  | 'termsAndConditionsContent';
