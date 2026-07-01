import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const REVIEWS = [
  {
    id: '1',
    name: 'Arjun M.',
    sport: 'Badminton',
    rating: 5,
    text: 'Lightning-fast delivery and authentic gear. The racket feels pro-grade straight out of the box.',
  },
  {
    id: '2',
    name: 'Priya S.',
    sport: 'Cricket',
    rating: 5,
    text: 'Best cricket bat purchase I have made online. Great packaging and competitive pricing.',
  },
  {
    id: '3',
    name: 'Rahul K.',
    sport: 'Running',
    rating: 4,
    text: 'Shoes fit perfectly. Returns process was smooth when I needed a size exchange.',
  },
];

export function ReviewsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {REVIEWS.map((review) => (
        <Card key={review.id} className="border-0 bg-secondary/60 shadow-none">
          <CardContent className="p-6">
            <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
            <p className="mt-4 text-sm font-semibold">{review.name}</p>
            <p className="text-xs text-muted-foreground">{review.sport}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
