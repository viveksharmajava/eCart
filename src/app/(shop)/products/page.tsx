import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse sports gear, apparel and equipment. Filter by brand, price, rating and more.',
  alternates: {
    canonical: '/products',
  },
};

export { default } from './products-page';
