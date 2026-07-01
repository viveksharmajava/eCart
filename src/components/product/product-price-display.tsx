import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface ProductPriceFields {
  salePrice?: number;
  listPrice?: number;
  currency?: string;
  discountPercent?: number;
}

interface ProductPriceDisplayProps extends ProductPriceFields {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'inline' | 'stacked';
  showLabels?: boolean;
  showOffer?: boolean;
  className?: string;
}

function displaySalePrice(product: ProductPriceFields): number | undefined {
  return product.salePrice ?? product.listPrice;
}

function showMrp(product: ProductPriceFields): boolean {
  const sale = product.salePrice;
  const mrp = product.listPrice;
  return mrp != null && sale != null && mrp > sale;
}

export function ProductPriceDisplay({
  salePrice,
  listPrice,
  currency,
  discountPercent,
  size = 'sm',
  layout = 'inline',
  showLabels = false,
  showOffer = true,
  className,
}: ProductPriceDisplayProps) {
  const fields = { salePrice, listPrice, currency, discountPercent };
  const price = displaySalePrice(fields);
  const mrpVisible = showMrp(fields);
  const offer =
    discountPercent != null && discountPercent > 0
      ? discountPercent
      : mrpVisible && salePrice != null && listPrice != null
        ? Math.round(((listPrice - salePrice) / listPrice) * 100)
        : undefined;

  if (price == null) {
    return <span className={cn('text-sm text-muted-foreground', className)}>Price on request</span>;
  }

  const saleClass =
    size === 'lg' ? 'text-2xl font-bold' : size === 'md' ? 'text-lg font-semibold' : 'text-sm font-semibold';
  const mrpClass =
    size === 'lg' ? 'text-lg text-muted-foreground line-through' : 'text-sm text-muted-foreground line-through';

  const saleBlock = (
    <span className={saleClass}>
      {showLabels && <span className="mr-1 text-xs font-medium uppercase text-muted-foreground">Price </span>}
      {formatCurrency(salePrice ?? price, currency)}
    </span>
  );

  const mrpBlock = mrpVisible && (
    <span className={mrpClass}>
      {showLabels && <span className="mr-1 text-xs font-normal uppercase">MRP </span>}
      {formatCurrency(listPrice, currency)}
    </span>
  );

  const offerBlock =
    showOffer && offer != null && offer > 0 ? (
      <Badge variant="accent" className={size === 'sm' ? 'text-xs' : undefined}>
        {offer}% OFF
      </Badge>
    ) : null;

  if (layout === 'stacked') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div className="flex flex-wrap items-baseline gap-2">
          {saleBlock}
          {mrpBlock}
        </div>
        {offerBlock}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      {saleBlock}
      {mrpBlock}
      {offerBlock}
    </div>
  );
}
