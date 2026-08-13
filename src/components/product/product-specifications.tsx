import type { ProductDetail } from '@/types/catalog';
import type { PricedProduct } from '@/utils/pricing';

interface ProductSpecificationsProps {
  product: ProductDetail & PricedProduct;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const specs = [
    { label: 'Product ID', value: product.productId },
    { label: 'SKU', value: product.sku },
    { label: 'Brand', value: product.brandName },
    { label: 'Type', value: product.productTypeId },
    { label: 'Status', value: product.statusId },
    { label: 'Weight', value: product.weight ? `${product.weight} ${product.weightUomId ?? ''}` : undefined },
    ...(product.attributes ?? [])
      .filter((a) => a.attrName && a.attrValue)
      .map((a) => ({ label: a.attrName!, value: a.attrValue! })),
  ].filter((s) => s.value);

  if (specs.length === 0) return null;

  return (
    <section className="mt-12" id="specifications">
      <h2 className="text-xl font-black uppercase tracking-tight">Specifications</h2>
      <dl className="mt-4 divide-y rounded-lg border">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-0 px-0 text-sm"
          >
            <dt className="px-4 py-3 font-medium text-muted-foreground">{spec.label}</dt>
            <div className="w-px self-stretch bg-border" aria-hidden="true" />
            <dd className="px-4 py-3 text-left">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
