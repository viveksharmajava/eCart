import Link from 'next/link';
import { ROUTES } from '@/constants';

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Go to My Account → Orders to view your order status and tracking updates.',
  },
  {
    q: 'What is your return policy?',
    a: 'Sports goods are not returnable. You can raise a replacement request within 7 days of delivery if you do not like the color, or if the item was delivered damaged. See our Returns page for full details.',
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Yes — free standard shipping on eligible orders over ₹999. See our Shipping Policy for timelines and charges.',
  },
  {
    q: 'How can I contact support?',
    a: 'Email playprosportz@gmail.com or call 8431776905 (Monday–Saturday, 10:00 AM – 6:00 PM IST). You can also use the Contact Us page.',
  },
];

export default function HelpPage() {
  return (
    <div className="container-store max-w-3xl py-12">
      <h1 className="text-3xl font-black uppercase">Help Center</h1>
      <p className="mt-3 text-muted-foreground">
        Quick answers to common questions about orders, shipping, and replacements.
      </p>
      <div className="mt-8 space-y-6">
        {FAQS.map((faq) => (
          <div key={faq.q} className="rounded-lg border p-6">
            <h2 className="font-semibold">{faq.q}</h2>
            <p className="mt-2 text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Need more help?{' '}
        <Link href={ROUTES.contact} className="underline">
          Contact us
        </Link>{' '}
        at playprosportz@gmail.com or 8431776905.
      </p>
    </div>
  );
}
