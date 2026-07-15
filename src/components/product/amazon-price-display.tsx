import { cn } from '@/lib/utils';

interface AmazonPriceDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

function splitPrice(amount: number, currency = 'INR') {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const symbolMatch = formatted.match(/^[^\d]+/);
  const symbol = symbolMatch?.[0]?.trim() ?? '₹';
  const numeric = formatted.replace(/[^\d.,]/g, '');
  const [whole = '0', fraction = '00'] = numeric.split('.');
  const wholeDisplay = whole.replace(/,/g, ',');

  return { symbol, whole: wholeDisplay, fraction: fraction.padEnd(2, '0').slice(0, 2) };
}

export function AmazonPriceDisplay({ amount, currency, className }: AmazonPriceDisplayProps) {
  const { symbol, whole, fraction } = splitPrice(amount, currency);

  return (
    <div className={cn('amazon-product-card__price-row', className)} aria-label={`${symbol}${whole}.${fraction}`}>
      <span className="amazon-product-card__price-symbol" aria-hidden="true">
        {symbol}
      </span>
      <span className="amazon-product-card__price-whole" aria-hidden="true">
        {whole}
        <span className="amazon-product-card__price-fraction">.{fraction}</span>
      </span>
    </div>
  );
}

interface AmazonMrpRowProps {
  mrp: number;
  currency?: string;
  discountPercent?: number;
  className?: string;
}

export function AmazonMrpRow({ mrp, currency, discountPercent, className }: AmazonMrpRowProps) {
  const mrpFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency ?? 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(mrp);

  return (
    <p className={cn('amazon-product-card__mrp-row', className)}>
      M.R.P.:{' '}
      <span className="amazon-product-card__mrp-strike">{mrpFormatted}</span>
      {discountPercent != null && discountPercent > 0 && (
        <span className="amazon-product-card__discount"> ({discountPercent}% off)</span>
      )}
    </p>
  );
}
