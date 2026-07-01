import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-lg" />
      <Skeleton className="mt-3 h-3 w-16" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-3 h-5 w-20" />
    </div>
  );
}
