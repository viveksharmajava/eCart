export type ProductSortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'newest'
  | 'rating'
  | 'discount';

export interface ProductFilters {
  q?: string;
  /** Display slug for category title (legacy browse links). */
  category?: string;
  /** Catalog category id — loads products via category membership API. */
  categoryId?: string;
  /** Display slug for catalog title. */
  catalog?: string;
  /** Prod catalog id — reserved for catalog-scoped browse. */
  catalogId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: ProductSortOption;
}

export interface ProductFacets {
  brands: Array<{ value: string; label: string; count: number }>;
  categories: Array<{ value: string; label: string; count: number }>;
  priceRange: { min: number; max: number };
  ratings: Array<{ value: number; label: string; count: number }>;
}

export interface EnrichedListProduct {
  productId: string;
  productTypeId?: string;
  internalName?: string;
  brandName?: string;
  productName?: string;
  description?: string;
  statusId?: string;
  listPrice?: number;
  salePrice?: number;
  currency?: string;
  discountPercent?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export interface SearchSuggestion {
  type: 'product' | 'keyword';
  productId?: string;
  label: string;
  slug?: string;
  imageUrl?: string;
  price?: number;
  mrp?: number;
  discountPercent?: number;
  currency?: string;
}
