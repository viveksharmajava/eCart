export interface NavCategoryItem {
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  href: string;
}

export interface CatalogNavItem {
  prodCatalogId: string;
  label: string;
  href: string;
  categories: NavCategoryItem[];
}
