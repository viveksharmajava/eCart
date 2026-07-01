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
          <div key={spec.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-muted-foreground">{spec.label}</dt>
            <dd className="text-right">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
