import type { StoreContentField } from '@/types/store';
import { ROUTES } from '@/constants';

export const STORE_PAGE_SLUGS: Record<string, StoreContentField> = {
  'about-us': 'aboutUsContent',
  'shipping-policy': 'shippingPolicyContent',
  'refund-policy': 'returnsContent',
  'privacy-policy': 'privacyPolicyContent',
  'terms-and-conditions': 'termsAndConditionsContent',
};

export const STORE_PAGE_ROUTES: Record<StoreContentField, string> = {
  contactUsContent: ROUTES.contact,
  aboutUsContent: ROUTES.about,
  shippingPolicyContent: ROUTES.shipping,
  returnsContent: ROUTES.refund,
  privacyPolicyContent: ROUTES.privacy,
  termsAndConditionsContent: ROUTES.terms,
};

export const STORE_PAGE_TITLES: Record<StoreContentField, string> = {
  contactUsContent: 'Contact Us',
  aboutUsContent: 'About Us',
  shippingPolicyContent: 'Shipping Policy',
  returnsContent: 'Returns',
  privacyPolicyContent: 'Privacy Policy',
  termsAndConditionsContent: 'Terms & Conditions',
};
