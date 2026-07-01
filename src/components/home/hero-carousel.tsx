'use client';

import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { HeroSlide } from '@/types/catalog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true }),
  ]);

  return (
    <section className="relative overflow-hidden bg-primary" aria-label="Featured promotions">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[16/9] min-h-[420px] w-full sm:aspect-[21/9] lg:min-h-[520px]">
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageAlt}
                  fill
                  priority={slide.id === slides[0]?.id}
                  sizes="100vw"
                  unoptimized={slide.imageUrl.startsWith('/')}
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="container-store absolute inset-0 flex items-center">
                  <div className="max-w-xl text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-sm">
                      New Season
                    </p>
                    <h1 className="mt-3 text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl lg:text-7xl">
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="mt-4 text-base text-white/90 sm:text-lg">{slide.subtitle}</p>
                    )}
                    <Button variant="accent" size="lg" className="mt-8" asChild>
                      <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={cn('h-1.5 w-8 rounded-full bg-white/40 transition-colors')}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
