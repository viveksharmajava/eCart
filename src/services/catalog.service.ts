import { STORE_CONFIG } from '@/constants';
import type {
  CategoryNode,
  PageResponse,
  ProdCatalogCategory,
  ProdCatalogSummary,
  ProductDetail,
  ProductImageInfo,
  ProductSearchRequest,
  ProductSummary,
  ProductVariantConfig,
} from '@/types/catalog';
import { getServiceAuthHeader, httpClient } from './http.client';
import {
  type ApiCategoryProductMemberDto,
  type ApiCategoryProdCatalogDto,
  type ApiProductCategoryDto,
  mapCategoryTree,
  mapProdCatalogCategory,
  mapProductMembers,
} from './catalog.mappers';

const AUTH = () => getServiceAuthHeader();

export async function findProducts(
  request: ProductSearchRequest,
): Promise<PageResponse<ProductSummary>> {
  return httpClient('/catalog/products/find', {
    method: 'POST',
    body: request,
    authHeader: AUTH(),
  });
}

export async function searchProducts(keyword: string): Promise<ProductSummary[]> {
  return httpClient(`/catalog/products/search?keyword=${encodeURIComponent(keyword)}`, {
    authHeader: AUTH(),
  });
}

export async function getProduct(productId: string): Promise<ProductDetail> {
  return httpClient(`/catalog/products/${encodeURIComponent(productId)}`, {
    authHeader: AUTH(),
  });
}

export async function getProductBySku(sku: string): Promise<ProductDetail> {
  return httpClient(`/catalog/products/sku/${encodeURIComponent(sku)}`, {
    authHeader: AUTH(),
  });
}

export async function getProductImages(productId: string): Promise<ProductImageInfo[]> {
  return httpClient(`/catalog/products/${encodeURIComponent(productId)}/images`, {
    authHeader: AUTH(),
  });
}

export async function getProductVariants(productId: string): Promise<ProductSummary[]> {
  return httpClient(`/catalog/products/${encodeURIComponent(productId)}/variants`, {
    authHeader: AUTH(),
  });
}

export async function getProductVariantConfig(
  productId: string,
  productStoreId: string = STORE_CONFIG.productStoreId,
): Promise<ProductVariantConfig> {
  const params = new URLSearchParams();
  if (productStoreId) params.set('productStoreId', productStoreId);
  const qs = params.toString();
  return httpClient(
    `/catalog/products/${encodeURIComponent(productId)}/variant-config${qs ? `?${qs}` : ''}`,
    { authHeader: AUTH() },
  );
}

export async function getCategoryTree(
  root = STORE_CONFIG.browseRootCategoryId,
): Promise<CategoryNode[]> {
  const raw = await httpClient<ApiProductCategoryDto[]>(
    `/catalog/categories/tree?root=${encodeURIComponent(root)}&excludeEmpty=false`,
    { authHeader: AUTH() },
  );
  return mapCategoryTree(raw ?? []);
}

export async function getCatalogCategories(
  catalogId = STORE_CONFIG.defaultCatalogId,
): Promise<ProdCatalogCategory[]> {
  const raw = await httpClient<ApiCategoryProdCatalogDto[]>(
    `/catalog/prod-catalogs/${encodeURIComponent(catalogId)}/categories`,
    { authHeader: AUTH() },
  );
  return (raw ?? [])
    .map(mapProdCatalogCategory)
    .filter((c): c is ProdCatalogCategory => c != null);
}

export async function findProdCatalogs(
  request: {
    noConditionFind?: boolean;
    page?: number;
    size?: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    cartEnabledOnly?: boolean;
  } = {},
): Promise<PageResponse<ProdCatalogSummary>> {
  return httpClient('/catalog/prod-catalogs/find', {
    method: 'POST',
    body: {
      noConditionFind: request.noConditionFind ?? true,
      page: request.page ?? 0,
      size: request.size ?? 20,
      sortField: request.sortField ?? 'catalogName',
      sortDirection: request.sortDirection ?? 'asc',
      cartEnabledOnly: request.cartEnabledOnly,
    },
    authHeader: AUTH(),
  });
}

/** Catalogs enabled for the eCart storefront (isCartEnabled = true). */
export async function findCartEnabledProdCatalogs(
  size = 24,
): Promise<ProdCatalogSummary[]> {
  const response = await findProdCatalogs({
    noConditionFind: true,
    page: 0,
    size,
    sortField: 'catalogName',
    sortDirection: 'asc',
    cartEnabledOnly: true,
  });
  return response.content ?? [];
}

export async function getCategoryProducts(categoryId: string): Promise<ProductSummary[]> {
  const raw = await httpClient<ApiCategoryProductMemberDto[]>(
    `/catalog/categories/${encodeURIComponent(categoryId)}/products`,
    { authHeader: AUTH() },
  );
  return mapProductMembers(raw ?? []);
}

export function productImageUrl(productId: string, fileName: string): string {
  const base = STORE_CONFIG.imageBase;
  const path = `/catalog/product-images/${encodeURIComponent(productId)}/${encodeURIComponent(fileName)}`;
  return base ? `${base}${path}` : path;
}

export async function getProductsByCatalogSectionType(
  typeId: string,
  limit = 8,
): Promise<ProductSummary[]> {
  const catalogs = await findCartEnabledProdCatalogs();
  const catalogList =
    catalogs.length > 0
      ? catalogs
      : [{ prodCatalogId: STORE_CONFIG.defaultCatalogId } as ProdCatalogSummary];

  for (const catalog of catalogList) {
    const catalogCategories = await getCatalogCategories(catalog.prodCatalogId);
    const section = catalogCategories.find((c) => c.prodCatalogCategoryTypeId === typeId);
    if (!section?.categoryId) continue;
    const products = await getCategoryProducts(section.categoryId);
    if (products.length > 0) {
      return products.slice(0, limit);
    }
  }
  return [];
}
