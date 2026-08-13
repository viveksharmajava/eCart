export interface ProductSummary {
  productId: string;
  productTypeId?: string;
  internalName?: string;
  brandName?: string;
  productName?: string;
  description?: string;
  statusId?: string;
  requireInventory?: boolean;
  sku?: string;
  weight?: number;
  weightUomId?: string;
  smallImageUrl?: string;
  mediumImageUrl?: string;
  largeImageUrl?: string;
  detailImageUrl?: string;
}

export interface ProductAttribute {
  attrName?: string;
  attrValue?: string;
  attrType?: string;
  attrDescription?: string;
}

export interface ProductDetail extends ProductSummary {
  longDescription?: string;
  attributes?: ProductAttribute[];
}

/** Matches catalog ProductImageInfoDto from GET /catalog/products/{id}/images */
export interface ProductImageInfo {
  size?: string;
  label?: string;
  url?: string;
  storagePath?: string;
  fileName?: string;
  uploaded?: boolean;
}

/** @deprecated Use ProductImageInfo — kept for backward compatibility */
export type ProductImage = ProductImageInfo;

export interface CategoryNode {
  categoryId: string;
  categoryName?: string;
  description?: string;
  parentCategoryId?: string;
  children?: CategoryNode[];
  productCount?: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName?: string;
  description?: string;
  categoryTypeId?: string;
}

export interface ProdCatalogSummary {
  prodCatalogId: string;
  catalogName?: string;
  useQuickAdd?: string;
  /** Catalog Image (Header Logo) public URL from catalog service. */
  headerLogo?: string;
  isCartEnabled?: boolean;
}

export interface ProdCatalogCategory {
  prodCatalogId: string;
  categoryId: string;
  prodCatalogCategoryTypeId: string;
  fromDate?: string;
  sequenceNum?: number;
  categoryName?: string;
  categoryImageUrl?: string;
}

export interface FieldSearchCriteria {
  value?: string;
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'empty' | 'notEmpty';
  ignoreCase?: boolean;
}

export interface ProductSearchRequest {
  productId?: FieldSearchCriteria;
  productName?: FieldSearchCriteria;
  internalName?: FieldSearchCriteria;
  brandName?: FieldSearchCriteria;
  noConditionFind?: boolean;
  page?: number;
  size?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
}
