export const APP_NAME = 'PlayPro';
export const APP_TAGLINE = 'Performance. Passion. Play.';

export const ROUTES = {
  home: '/',
  products: '/products',
  product: (slug: string) => `/products/${slug}`,
  search: '/search',
  cart: '/cart',
  /** Cart page with post–add-to-cart confirmation for the given item name. */
  cartWithAdded: (itemName: string) =>
    `/cart?added=${encodeURIComponent(itemName)}`,
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  wishlist: '/wishlist',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyOtp: '/verify-otp',
  account: '/account',
  accountOrders: '/account/orders',
  accountAddresses: '/account/addresses',
  accountProfile: '/account/profile',
  accountResetPassword: '/account/reset-password',
  help: '/help',
  contact: '/contact',
  about: '/pages/about-us',
  privacy: '/pages/privacy-policy',
  terms: '/pages/terms-and-conditions',
  refund: '/pages/refund-policy',
  shipping: '/pages/shipping-policy',
} as const;

export const STORE_CONFIG = {
  productStoreId: process.env.NEXT_PUBLIC_PRODUCT_STORE_ID ?? 'OFBIZ_STORE',
  defaultCatalogId: process.env.NEXT_PUBLIC_DEFAULT_CATALOG_ID ?? 'DEMO_CATALOG',
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'INR',
  browseRootCategoryId: process.env.NEXT_PUBLIC_BROWSE_ROOT_CATEGORY_ID ?? 'CAT-ROOT',
  bestSellerType: process.env.NEXT_PUBLIC_BEST_SELLER_CATALOG_TYPE ?? 'BEST_SELLER',
  trendingType: process.env.NEXT_PUBLIC_TRENDING_CATALOG_TYPE ?? 'TRENDING_CATALOG',
  bestSellerFallback: process.env.NEXT_PUBLIC_BEST_SELLER_FALLBACK_TYPE ?? 'PCCT_MOST_POPULAR',
  trendingFallback: process.env.NEXT_PUBLIC_TRENDING_FALLBACK_TYPE ?? 'PCCT_WHATS_NEW',
  imageBase: process.env.NEXT_PUBLIC_CATALOG_IMAGE_BASE ?? '',
} as const;

export const QUERY_KEYS = {
  products: 'products',
  product: 'product',
  categories: 'categories',
  categoryTree: 'categoryTree',
  catalogSections: 'catalogSections',
  prices: 'prices',
  search: 'search',
  orders: 'orders',
} as const;
