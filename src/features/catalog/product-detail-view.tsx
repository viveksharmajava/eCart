'use client';



import Link from 'next/link';

import { Heart, Share2, ShoppingBag, Zap } from 'lucide-react';

import type { ProductAttribute, ProductSummary, ProductDetail } from '@/types/catalog';

import type { PricedProduct } from '@/utils/pricing';

import type { EnrichedListProduct } from '@/types/filters';

import type { GallerySlide } from '@/lib/product-images';

import { ROUTES } from '@/constants';

import { productSlug } from '@/lib/utils';

import { isInStock, canPurchase } from '@/features/catalog/product-enrichment';

import { useCartStore } from '@/store/cart.store';

import { useWishlistStore } from '@/store/wishlist.store';

import { useRecentlyViewedStore } from '@/store/recently-viewed.store';

import { trackEvent } from '@/lib/analytics';

import { Button } from '@/components/ui/button';

import { ProductPriceDisplay } from '@/components/product/product-price-display';

import { ProductGallery } from '@/components/product/product-gallery';

import { ProductSpecifications } from '@/components/product/product-specifications';

import { RelatedProducts } from '@/components/product/related-products';

import { FrequentlyBoughtTogether } from '@/components/product/frequently-bought-together';

import { ProductRecommendations } from '@/components/product/product-recommendations';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';



function groupAttributes(attributes?: ProductAttribute[]): Map<string, string[]> {

  const groups = new Map<string, string[]>();

  for (const attr of attributes ?? []) {

    const name = attr.attrName?.trim();

    const value = attr.attrValue?.trim();

    if (!name || !value) continue;

    const existing = groups.get(name) ?? [];

    if (!existing.includes(value)) existing.push(value);

    groups.set(name, existing);

  }

  return groups;

}



interface ProductDetailViewProps {

  product: PricedProduct & ProductDetail;

  gallery: GallerySlide[];

  variants: ProductSummary[];

  videoUrl?: string;

  availableToPromise?: number;

}



export function ProductDetailView({
  product,
  gallery,
  variants,
  videoUrl,
  availableToPromise,
}: ProductDetailViewProps) {

  const attributeGroups = useMemo(

    () => groupAttributes(product.attributes),

    [product.attributes],

  );

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const router = useRouter();

  const addItem = useCartStore((s) => s.addItem);

  const toggle = useWishlistStore((s) => s.toggle);

  const inWishlist = useWishlistStore((s) => s.has(product.productId));

  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add);



  const displayName = product.productName ?? product.internalName ?? product.productId;

  const inStock = isInStock(product, availableToPromise);
  const purchasable = canPurchase(product, availableToPromise);

  const primaryImage = gallery[0]?.displayUrl;



  const enriched: EnrichedListProduct = useMemo(

    () => ({

      ...product,

      imageUrl: primaryImage,

      inStock,

      availableToPromise,

    }),

    [product, primaryImage, inStock, availableToPromise],

  );



  useEffect(() => {

    addRecentlyViewed({

      productId: product.productId,

      productName: product.productName,

      internalName: product.internalName,

      brandName: product.brandName,

      sku: product.sku,

      salePrice: product.salePrice,

      listPrice: product.listPrice,

      currency: product.currency,

      discountPercent: product.discountPercent,

      imageUrl: primaryImage,

    });

    trackEvent({ name: 'product_view', productId: product.productId });

  }, [

    product.productId,

    product.productName,

    product.internalName,

    product.brandName,

    product.sku,

    product.salePrice,

    product.listPrice,

    product.currency,

    product.discountPercent,

    primaryImage,

    addRecentlyViewed,

  ]);



  function handleAddToCart() {

    addItem({

      productId: product.productId,

      productName: displayName,

      brandName: product.brandName,

      imageUrl: primaryImage,

      quantity: 1,

      unitPrice: product.salePrice ?? product.listPrice ?? 0,

      listPrice: product.listPrice,

      currency: product.currency,

      attributes: Object.keys(selectedAttributes).length > 0 ? selectedAttributes : undefined,

    });

    router.push(ROUTES.cartWithAdded(displayName));

  }



  const breadcrumbJsonLd = {

    '@context': 'https://schema.org',

    '@type': 'BreadcrumbList',

    itemListElement: [

      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_APP_URL },

      { '@type': 'ListItem', position: 2, name: 'Products', item: `${process.env.NEXT_PUBLIC_APP_URL}/products` },

      { '@type': 'ListItem', position: 3, name: displayName },

    ],

  };



  return (

    <>

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}

      />

      <div className="container-store py-8 lg:py-12">

        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">

          <Link href={ROUTES.home}>Home</Link>

          <span className="mx-2">/</span>

          <Link href={ROUTES.products}>Products</Link>

          <span className="mx-2">/</span>

          <span className="text-foreground">{displayName}</span>

        </nav>



        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          <ProductGallery gallery={gallery} videoUrl={videoUrl} alt={displayName} />



          <div>

            {product.brandName && (

              <Link

                href={`${ROUTES.products}?brand=${encodeURIComponent(product.brandName.toLowerCase())}`}

                className="text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"

              >

                {product.brandName}

              </Link>

            )}

            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight lg:text-4xl">{displayName}</h1>



            <ProductPriceDisplay

              salePrice={product.salePrice}

              listPrice={product.listPrice}

              currency={product.currency}

              discountPercent={product.discountPercent}

              size="lg"

              layout="stacked"

              showLabels

              className="mt-6"

            />



            <p

              className={cn(

                'mt-2 text-sm font-medium',

                inStock ? 'text-green-700' : 'text-destructive',

              )}

            >

              {inStock ? 'In stock' : 'Out of stock'}

              {!inStock && purchasable && (

                <span className="ml-2 text-xs font-normal text-muted-foreground">

                  (checkout enabled for testing)

                </span>

              )}

            </p>



            {product.description && (

              <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

            )}



            {product.longDescription && (

              <div

                className="prose prose-sm mt-6 max-w-none text-muted-foreground"

                dangerouslySetInnerHTML={{ __html: product.longDescription }}

              />

            )}



            {[...attributeGroups.entries()].map(([name, values]) => (

              <div key={name} className="mt-8">

                <p className="text-sm font-semibold uppercase tracking-wide">{name}</p>

                {values.length > 1 ? (

                  <div className="mt-3 flex flex-wrap gap-2">

                    {values.map((value) => (

                      <button

                        key={value}

                        type="button"

                        onClick={() =>

                          setSelectedAttributes((prev) => ({ ...prev, [name]: value }))

                        }

                        className={cn(

                          'flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',

                          selectedAttributes[name] === value

                            ? 'border-foreground bg-foreground text-background'

                            : 'hover:border-foreground',

                        )}

                      >

                        {value}

                      </button>

                    ))}

                  </div>

                ) : (

                  <p className="mt-2 text-sm text-muted-foreground">{values[0]}</p>

                )}

              </div>

            ))}



            {variants.length > 0 && (

              <div className="mt-8">

                <p className="text-sm font-semibold uppercase tracking-wide">Variants</p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {variants.map((v) => (

                    <Link

                      key={v.productId}

                      href={ROUTES.product(productSlug(v.productId, v.productName ?? v.internalName))}

                    >

                      <Badge variant={v.productId === product.productId ? 'default' : 'outline'}>

                        {v.internalName ?? v.productId}

                      </Badge>

                    </Link>

                  ))}

                </div>

              </div>

            )}



            <div className="mt-10 flex flex-col gap-3 sm:flex-row">

              <Button

                size="lg"

                className="flex-1 gap-2"

                onClick={handleAddToCart}

                disabled={!purchasable}

              >

                <ShoppingBag className="h-5 w-5" />

                Add to Cart

              </Button>

              <Button size="lg" variant="accent" className="flex-1 gap-2" asChild disabled={!purchasable}>

                <Link href={ROUTES.checkout}>

                  <Zap className="h-5 w-5" />

                  Buy Now

                </Link>

              </Button>

            </div>



            <div className="mt-4 flex gap-2">

              <Button variant="outline" size="sm" className="gap-2" onClick={() => toggle(product)}>

                <Heart className={inWishlist ? 'fill-accent text-accent' : ''} />

                Wishlist

              </Button>

              <Button

                variant="outline"

                size="sm"

                className="gap-2"

                onClick={() => navigator.share?.({ title: displayName, url: window.location.href })}

              >

                <Share2 className="h-4 w-4" />

                Share

              </Button>

            </div>

          </div>

        </div>



        <ProductSpecifications product={product} />

        <FrequentlyBoughtTogether productId={product.productId} currentProduct={enriched} />

        <RelatedProducts productId={product.productId} />

        <ProductRecommendations excludeProductId={product.productId} />

      </div>

    </>

  );

}

