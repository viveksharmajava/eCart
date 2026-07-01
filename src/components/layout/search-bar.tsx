'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Search } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useSearchHistoryStore } from '@/store/search-history.store';
import type { SearchSuggestion } from '@/types/filters';
import { ProductPriceDisplay } from '@/components/product/product-price-display';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const POPULAR_SEARCHES = ['Badminton Racket', 'Cricket Bat', 'Running Shoes', 'Sports Jersey'];

interface SearchBarProps {
  onClose?: () => void;
  variant?: 'default' | 'header';
  className?: string;
}

export function SearchBar({ onClose, variant = 'default', className }: SearchBarProps) {
  const isHeader = variant === 'header';
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const { queries, add: addHistory } = useSearchHistoryStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isHeader) {
      inputRef.current?.focus();
    }
  }, [isHeader]);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = (await res.json()) as { suggestions: SearchSuggestion[] };
        setSuggestions(data.suggestions);
        setOpen(true);
      }
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  function navigateToSearch(term: string) {
    addHistory(term);
    setOpen(false);
    onClose?.();
    router.push(`${ROUTES.products}?q=${encodeURIComponent(term)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigateToSearch(trimmed);
  }

  return (
    <div className={className ?? 'relative'}>
      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 150);
            }}
            placeholder={isHeader ? 'Search...' : 'Search products, brands, sports...'}
            className={isHeader ? 'h-9 pl-9 text-sm' : 'pl-10'}
            aria-label="Search products"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
        </div>
        {!isHeader && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Voice search (coming soon)"
              disabled
              title="Voice search coming soon"
            >
              <Mic />
            </Button>
            <Button type="submit">Search</Button>
          </>
        )}
      </form>

      {open && (suggestions.length > 0 || queries.length > 0 || query.length < 2) && (
        <div
          id="search-suggestions"
          role="listbox"
          className={cn(
            'absolute top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border bg-popover p-2 shadow-lg',
            isHeader ? 'left-0 right-0 w-full' : 'left-0 right-0',
          )}
        >
          {suggestions.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">Products</p>
              {suggestions.map((s) =>
                s.type === 'product' && s.slug ? (
                  <Link
                    key={s.productId ?? s.label}
                    href={ROUTES.product(s.slug)}
                    role="option"
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                    onClick={() => {
                      setOpen(false);
                      onClose?.();
                    }}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-secondary">
                      {s.imageUrl ? (
                        <Image src={s.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.label}</p>
                      {s.price != null && (
                        <ProductPriceDisplay
                          salePrice={s.price}
                          listPrice={s.mrp}
                          currency={s.currency}
                          discountPercent={s.discountPercent}
                          size="sm"
                          className="mt-0.5"
                        />
                      )}
                    </div>
                  </Link>
                ) : (
                  <button
                    key={s.label}
                    type="button"
                    role="option"
                    className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => navigateToSearch(s.label)}
                  >
                    Search for &ldquo;{s.label}&rdquo;
                  </button>
                ),
              )}
            </div>
          )}
          {query.length < 2 && (
            <>
              <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">Popular</p>
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => navigateToSearch(s)}
                >
                  {s}
                </button>
              ))}
            </>
          )}
          {queries.length > 0 && query.length < 2 && (
            <>
              <p className="mt-2 px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">Recent</p>
              {queries.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => navigateToSearch(s)}
                >
                  {s}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
