'use client';

import Link from 'next/link';
import { Heart, Share2, ShoppingBag, Zap } from 'lucide-react';
import type { ProductAttribute, ProductDetail, ProductVariantConfig } from '@/types/catalog';
import type { PricedProduct } from '@/utils/pricing';
import { attachPriceWithParentFallback } from '@/utils/pricing';
import type { EnrichedListProduct } from '@/types/filters';
import type { GallerySlide } from '@/lib/product-images';
import { ROUTES, STORE_CONFIG } from '@/constants';
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
import { getProductPrices } from '@/services/pricing.service';
import { getProductInventory } from '@/services/facility.service';
import type { ProductPrice } from '@/types/pricing';

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

function selectionsMatch(
  left: Record<string, string> | undefined,
  right: Record<string, string>,
): boolean {
  if (!left) return false;
  const keys = Object.keys(right);
  if (keys.length === 0) return false;
  return keys.every((k) => left[k] === right[k]) && Object.keys(left).length === keys.length;
}

interface ProductDetailViewProps {
  product: PricedProduct & ProductDetail;
  gallery: GallerySlide[];
  variantConfig?: ProductVariantConfig | null;
  parentPrices?: ProductPrice[];
  videoUrl?: string;
  availableToPromise?: number;
}

export function ProductDetailView({
  product,
  gallery,
  variantConfig,
  parentPrices = [],
  videoUrl,
  availableToPromise,
}: ProductDetailViewProps) {
  const optionTypes = useMemo(() => {
    const types = variantConfig?.types ?? [];
    return types
      .filter((t) => (t.selectedValueIds?.length ?? 0) > 0)
      .map((t) => ({
        ...t,
        values: (t.values ?? []).filter(
          (v) => v.selected || t.selectedValueIds?.includes(v.variantValueId),
        ),
      }))
      .filter((t) => (t.values?.length ?? 0) > 0);
  }, [variantConfig]);

  const hasVariantOptions = optionTypes.length > 0;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [variantError, setVariantError] = useState('');
  const [resolvedPrice, setResolvedPrice] = useState<PricedProduct>(product);
  const [variantAtp, setVariantAtp] = useState<number | undefined>(availableToPromise);
  const [resolvingVariant, setResolvingVariant] = useState(false);

  const attributeGroups = useMemo(
    () => groupAttributes(product.attributes),
    [product.attributes],
  );

  const matchedVariant = useMemo(() => {
    if (!hasVariantOptions) return null;
    const required = optionTypes.map((t) => t.name);
    if (!required.every((name) => selectedOptions[name])) return null;
    const fromConfig =
      (variantConfig?.generatedVariants ?? []).find((v) =>
        selectionsMatch(v.selections, selectedOptions),
      ) ?? null;
    if (fromConfig) return fromConfig;
    // Fallback: build child id the same way as catalog (parent-value-value)
    const slug = (raw: string) =>
      raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const childId = [product.productId, ...optionTypes.map((t) => slug(selectedOptions[t.name]))].join(
      '-',
    );
    return { productId: childId, selections: selectedOptions };
  }, [hasVariantOptions, optionTypes, selectedOptions, variantConfig, product.productId]);

  const allOptionsSelected =
    !hasVariantOptions ||
    (optionTypes.length > 0 && optionTypes.every((t) => Boolean(selectedOptions[t.name])));

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.productId));
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add);

  const displayName = product.productName ?? product.internalName ?? product.productId;
  const sellProductId = matchedVariant?.productId ?? product.productId;
  const inStock = isInStock(product, variantAtp);
  const purchasable = canPurchase(product, variantAtp);
  const primaryImage = gallery[0]?.displayUrl;

  const enriched: EnrichedListProduct = useMemo(
    () => ({
      ...product,
      imageUrl: primaryImage,
      inStock,
      availableToPromise: variantAtp,
    }),
    [product, primaryImage, inStock, variantAtp],
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

  useEffect(() => {
    if (!hasVariantOptions) {
      setResolvedPrice(product);
      setVariantAtp(availableToPromise);
      return;
    }
    if (!matchedVariant) {
      setResolvedPrice(product);
      setVariantAtp(undefined);
      return;
    }

    let cancelled = false;
    setResolvingVariant(true);
    setVariantError('');

    (async () => {
      try {
        const [prices, inventory] = await Promise.all([
          getProductPrices(matchedVariant.productId).catch(() => [] as ProductPrice[]),
          product.requireInventory
            ? getProductInventory(matchedVariant.productId, STORE_CONFIG.productStoreId).catch(
                () => null,
              )
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setResolvedPrice(
          attachPriceWithParentFallback(
            { ...product, productId: matchedVariant.productId },
            prices,
            parentPrices,
          ),
        );
        setVariantAtp(inventory?.availableToPromise);
      } catch {
        if (!cancelled) {
          setResolvedPrice(attachPriceWithParentFallback(product, [], parentPrices));
        }
      } finally {
        if (!cancelled) setResolvingVariant(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasVariantOptions, matchedVariant, product, parentPrices, availableToPromise]);

  function handleAddToCart() {
    setVariantError('');
    if (hasVariantOptions) {
      if (!allOptionsSelected) {
        setVariantError('Please select all variant options before adding to cart.');
        return;
      }
      if (!matchedVariant) {
        setVariantError('Selected combination is not available.');
        return;
      }
    }

    const unitPrice = resolvedPrice.salePrice ?? resolvedPrice.listPrice ?? 0;
    const currency = resolvedPrice.currency ?? STORE_CONFIG.defaultCurrency ?? 'INR';
    addItem({
      productId: sellProductId,
      productName: matchedVariant
        ? `${displayName} (${Object.values(selectedOptions).join(' / ')})`
        : displayName,
      brandName: product.brandName,
      imageUrl: primaryImage,
      quantity: 1,
      unitPrice,
      listPrice: resolvedPrice.listPrice,
      currency,
      attributes: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
    });
    trackEvent({
      name: 'add_to_cart',
      productId: sellProductId,
      quantity: 1,
      value: unitPrice,
    });
    router.push(ROUTES.cartWithAdded(displayName));
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_APP_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
      },
      { '@type': 'ListItem', position: 3, name: displayName },
    ],
  };

  const addDisabled =
    !purchasable ||
    (hasVariantOptions && (!allOptionsSelected || !matchedVariant)) ||
    resolvingVariant;

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
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight lg:text-4xl">
              {displayName}
            </h1>

            <ProductPriceDisplay
              salePrice={resolvedPrice.salePrice}
              listPrice={resolvedPrice.listPrice}
              currency={resolvedPrice.currency}
              discountPercent={resolvedPrice.discountPercent}
              size="lg"
              layout="stacked"
              showLabels
              className="mt-6"
            />

            {hasVariantOptions && matchedVariant && (
              <p className="mt-1 text-xs text-muted-foreground">
                SKU: <code>{matchedVariant.productId}</code>
              </p>
            )}

            <p
              className={cn(
                'mt-2 text-sm font-medium',
                inStock ? 'text-green-700' : 'text-destructive',
              )}
            >
              {hasVariantOptions && !matchedVariant
                ? 'Select options to check availability'
                : inStock
                  ? 'In stock'
                  : 'Out of stock'}
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

            {hasVariantOptions && optionTypes.length > 0 && (
              <div className="mt-8 space-y-6">
                {optionTypes.map((type) => (
                  <div key={type.variantTypeId}>
                    <p className="text-sm font-semibold uppercase tracking-wide">{type.name}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(type.values ?? []).map((value) => (
                        <button
                          key={value.variantValueId}
                          type="button"
                          onClick={() => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [type.name]: value.value,
                            }));
                            setVariantError('');
                          }}
                          className={cn(
                            'flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',
                            selectedOptions[type.name] === value.value
                              ? 'border-foreground bg-foreground text-background'
                              : 'hover:border-foreground',
                          )}
                        >
                          {value.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!hasVariantOptions &&
              [...attributeGroups.entries()].map(([name, values]) => (
                <div key={name} className="mt-8">
                  <p className="text-sm font-semibold uppercase tracking-wide">{name}</p>
                  {values.length === 1 ? (
                    <p className="mt-2 text-sm text-muted-foreground">{values[0]}</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {values.map((value) => (
                        <span
                          key={value}
                          className="flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {variantError && (
              <p className="mt-4 text-sm font-medium text-destructive" role="alert">
                {variantError}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={addDisabled}
              >
                <ShoppingBag className="h-5 w-5" />
                {resolvingVariant ? 'Checking…' : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                variant="accent"
                className="flex-1 gap-2"
                disabled={addDisabled}
                onClick={() => {
                  setVariantError('');
                  if (hasVariantOptions) {
                    if (!allOptionsSelected) {
                      setVariantError('Please select all variant options before buying.');
                      return;
                    }
                    if (!matchedVariant) {
                      setVariantError('Selected combination is not available.');
                      return;
                    }
                  }
                  const unitPrice = resolvedPrice.salePrice ?? resolvedPrice.listPrice ?? 0;
                  const currency = resolvedPrice.currency ?? STORE_CONFIG.defaultCurrency ?? 'INR';
                  addItem({
                    productId: sellProductId,
                    productName: matchedVariant
                      ? `${displayName} (${Object.values(selectedOptions).join(' / ')})`
                      : displayName,
                    brandName: product.brandName,
                    imageUrl: primaryImage,
                    quantity: 1,
                    unitPrice,
                    listPrice: resolvedPrice.listPrice,
                    currency,
                    attributes: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
                  });
                  router.push(ROUTES.checkout);
                }}
              >
                <Zap className="h-5 w-5" />
                Buy Now
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
