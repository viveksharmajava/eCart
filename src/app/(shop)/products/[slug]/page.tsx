import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import type { ProductImageInfo } from '@/types/catalog';

import { getProduct, getProductImages, getProductVariants } from '@/services/catalog.service';

import { getProductPrices } from '@/services/pricing.service';

import { getProductInventory } from '@/services/facility.service';

import { attachPrice } from '@/utils/pricing';

import { isInStock } from '@/features/catalog/product-enrichment';

import { buildProductGallery } from '@/lib/product-images';

import { parseProductSlug } from '@/lib/utils';

import { ProductDetailView } from '@/features/catalog/product-detail-view';



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

    const [product, prices, images, variants] = await Promise.all([

      getProduct(productId),

      getProductPrices(productId).catch(() => []),

      getProductImages(productId).catch(() => [] as ProductImageInfo[]),

      getProductVariants(productId).catch(() => []),

    ]);



    const priced = attachPrice(product, prices);

    const gallery = buildProductGallery(productId, images, product);

    const inventory = product.requireInventory
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

          variants={variants}

          availableToPromise={availableToPromise}

        />

      </>

    );

  } catch {

    notFound();

  }

}

