import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ProductImageInfo, ProductVariantConfig } from '@/types/catalog';
import type { ProductPrice } from '@/types/pricing';
import {
  getProduct,
  getProductImages,
  getProductVariantConfig,
} from '@/services/catalog.service';
import { getProductPrices } from '@/services/pricing.service';
import { getProductInventory } from '@/services/facility.service';
import { attachPrice } from '@/utils/pricing';
import { isInStock } from '@/features/catalog/product-enrichment';
import { buildProductGallery } from '@/lib/product-images';
import { parseProductSlug } from '@/lib/utils';
import { ProductDetailView } from '@/features/catalog/product-detail-view';
import { STORE_CONFIG } from '@/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const productId = parseProductSlug(slug);

  try {
    const product = await getProduct(productId);
    return {
      title: product.productName ?? product.internalName ?? productId,
      description: product.description,
      openGraph: {
        title: product.productName ?? productId,
        description: product.description,
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const productId = parseProductSlug(slug);

  try {
    const [product, prices, images] = await Promise.all([
      getProduct(productId),
      getProductPrices(productId).catch(() => [] as ProductPrice[]),
      getProductImages(productId).catch(() => [] as ProductImageInfo[]),
    ]);

    let variantConfig: ProductVariantConfig | null = null;
    try {
      variantConfig = await getProductVariantConfig(productId, STORE_CONFIG.productStoreId);
      const hasOptions =
        (variantConfig.generatedVariants?.length ?? 0) > 0 ||
        (variantConfig.types ?? []).some((t) => (t.selectedValueIds?.length ?? 0) > 0);
      if (!hasOptions) {
        variantConfig = null;
      }
    } catch {
      variantConfig = null;
    }

    const priced = attachPrice(product, prices);
    const gallery = buildProductGallery(productId, images, product);
    const hasVariantOptions = Boolean(variantConfig);
    const inventory =
      !hasVariantOptions && product.requireInventory
        ? await getProductInventory(productId)
        : null;
    const availableToPromise = inventory?.availableToPromise;
    const inStock = isInStock(product, availableToPromise);

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.productName ?? product.internalName,
      sku: productId,
      brand: product.brandName ? { '@type': 'Brand', name: product.brandName } : undefined,
      offers: priced.salePrice
        ? {
            '@type': 'Offer',
            price: priced.salePrice,
            priceCurrency: priced.currency ?? 'INR',
            availability: inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          }
        : undefined,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <ProductDetailView
          product={priced}
          gallery={gallery}
          variantConfig={variantConfig}
          parentPrices={prices}
          availableToPromise={availableToPromise}
        />
      </>
    );
  } catch {
    notFound();
  }
}
