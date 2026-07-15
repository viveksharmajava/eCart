import { Skeleton } from '@/components/ui/skeleton';
interface ProductCardSkeletonProps {
  variant?: 'default' | 'amazon';
}

export function ProductCardSkeleton({ variant = 'default' }: ProductCardSkeletonProps) {
  if (variant === 'amazon') {
    return (
      <div className="amazon-product-card">
        <Skeleton className="aspect-square w-full rounded-none bg-[#f0f2f2]" />
        <Skeleton className="mt-3 h-4 w-24" />
        <Skeleton className="mt-1 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-4/5" />
        <Skeleton className="mt-2 h-6 w-20" />
        <Skeleton className="mt-1 h-3 w-32" />
        <Skeleton className="mt-3 h-8 w-full rounded-full bg-[#ffe08a]" />
      </div>
    );
  }

  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-lg" />
      <Skeleton className="mt-3 h-4 w-24" />
      <Skeleton className="mt-1 h-4 w-16" />
      <Skeleton className="mt-1 h-4 w-28" />
      <Skeleton className="mt-3 h-8 w-full rounded-full bg-[#ffe08a]" />
    </div>
  );
}
