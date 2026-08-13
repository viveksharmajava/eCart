import type {
  CategoryNode,
  ProdCatalogCategory,
  ProductSummary,
} from '@/types/catalog';

/** Raw shapes returned by the catalog microservice (OFBiz field names). */
export interface ApiProductCategoryDto {
  productCategoryId?: string;
  categoryName?: string;
  primaryParentCategoryId?: string;
  description?: string;
  children?: ApiProductCategoryDto[];
  memberCount?: number;
  childCategoryCount?: number;
}

export interface ApiCategoryProdCatalogDto {
  prodCatalogId?: string;
  productCategoryId?: string;
  categoryName?: string;
  categoryImageUrl?: string;
  prodCatalogCategoryTypeId?: string;
  fromDate?: string;
  sequenceNum?: number | string;
}

export interface ApiCategoryProductMemberDto {
  productCategoryId?: string;
  productId?: string;
  productName?: string;
  internalName?: string;
  brandName?: string;
}

export function mapCategoryNode(dto: ApiProductCategoryDto): CategoryNode | null {
  const categoryId = dto.productCategoryId?.trim();
  if (!categoryId) return null;

  return {
    categoryId,
    categoryName: dto.categoryName,
    description: dto.description,
    parentCategoryId: dto.primaryParentCategoryId,
    productCount: dto.memberCount,
    children: (dto.children ?? [])
      .map(mapCategoryNode)
      .filter((c): c is CategoryNode => c != null),
  };
}

export function mapCategoryTree(nodes: ApiProductCategoryDto[]): CategoryNode[] {
  return nodes.map(mapCategoryNode).filter((c): c is CategoryNode => c != null);
}

export function mapProdCatalogCategory(dto: ApiCategoryProdCatalogDto): ProdCatalogCategory | null {
  const categoryId = dto.productCategoryId?.trim();
  if (!categoryId || !dto.prodCatalogId) return null;

  return {
    prodCatalogId: dto.prodCatalogId,
    categoryId,
    categoryName: dto.categoryName,
    categoryImageUrl: dto.categoryImageUrl,
    prodCatalogCategoryTypeId: dto.prodCatalogCategoryTypeId ?? '',
    fromDate: dto.fromDate,
    sequenceNum:
      dto.sequenceNum != null && dto.sequenceNum !== '' ? Number(dto.sequenceNum) : undefined,
  };
}

export function mapProductMemberToSummary(dto: ApiCategoryProductMemberDto): ProductSummary | null {
  const productId = dto.productId?.trim();
  if (!productId) return null;

  return {
    productId,
    productName: dto.productName,
    internalName: dto.internalName,
    brandName: dto.brandName,
  };
}

export function mapProductMembers(members: ApiCategoryProductMemberDto[]): ProductSummary[] {
  return members.map(mapProductMemberToSummary).filter((p): p is ProductSummary => p != null);
}
