'use client';



import Image from 'next/image';

import { useCallback, useState } from 'react';

import { Play, ZoomIn } from 'lucide-react';

import type { GallerySlide } from '@/lib/product-images';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';



interface ProductGalleryProps {

  gallery: GallerySlide[];

  videoUrl?: string;

  alt: string;

}



export function ProductGallery({ gallery, videoUrl, alt }: ProductGalleryProps) {

  const [selected, setSelected] = useState(0);

  const [zooming, setZooming] = useState(false);

  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const [showVideo, setShowVideo] = useState(false);



  const slide = gallery[selected];

  const hoverSrc = slide?.zoomUrl ?? slide?.displayUrl;



  const handleMouseMove = useCallback(

    (e: React.MouseEvent<HTMLDivElement>) => {

      if (!zooming) return;

      const rect = e.currentTarget.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;

      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setZoomPos({ x, y: y });

    },

    [zooming],

  );



  return (

    <div>

      <div

        className="relative aspect-square overflow-hidden rounded-lg bg-secondary"

        onMouseEnter={() => setZooming(true)}

        onMouseLeave={() => setZooming(false)}

        onMouseMove={handleMouseMove}

      >

        {showVideo && videoUrl ? (

          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">

            <Play className="h-16 w-16 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">

              Product video placeholder — wire CDN/YouTube URL when media API is available.

            </p>

            <Button variant="outline" size="sm" onClick={() => setShowVideo(false)}>

              Back to images

            </Button>

          </div>

        ) : slide ? (

          <>

            <Image

              src={zooming ? hoverSrc : slide.displayUrl}

              alt={alt}

              fill

              sizes="(max-width: 1024px) 100vw, 50vw"

              className={cn(

                'object-cover transition-transform duration-150',

                zooming && 'scale-[2.5]',

              )}

              style={

                zooming

                  ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }

                  : undefined

              }

              priority

            />

            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/80 p-2 shadow">

              <ZoomIn className="h-4 w-4" aria-hidden />

            </div>

          </>

        ) : (

          <div className="flex h-full items-center justify-center text-muted-foreground">

            No image

          </div>

        )}

      </div>



      {gallery.length > 1 && (

        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">

          {gallery.map((item, i) => (

            <button

              key={item.id}

              type="button"

              onClick={() => {

                setShowVideo(false);

                setSelected(i);

              }}

              className={cn(

                'relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2',

                i === selected && !showVideo ? 'border-foreground' : 'border-transparent',

              )}

            >

              <Image src={item.thumbUrl} alt="" fill sizes="80px" className="object-cover" />

            </button>

          ))}

          {videoUrl && (

            <button

              type="button"

              onClick={() => setShowVideo(true)}

              className={cn(

                'flex h-20 w-20 shrink-0 items-center justify-center rounded-md border-2 bg-muted',

                showVideo ? 'border-foreground' : 'border-transparent',

              )}

              aria-label="Play product video"

            >

              <Play className="h-6 w-6" />

            </button>

          )}

        </div>

      )}

    </div>

  );

}

