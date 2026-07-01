import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeading({ title, subtitle, href, linkLabel = 'View All' }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Button variant="ghost" asChild className="w-fit gap-2 font-semibold uppercase tracking-wide">
          <Link href={href}>
            {linkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
