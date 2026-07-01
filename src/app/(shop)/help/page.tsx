import Link from 'next/link';
import { ROUTES } from '@/constants';

const FAQS = [
  { q: 'How do I track my order?', a: 'Go to My Account → Orders to view tracking status.' },
  { q: 'What is your return policy?', a: '30-day returns on unused items. See our Refund Policy for details.' },
  { q: 'Do you offer free shipping?', a: 'Yes, on orders over ₹999.' },
];

export default function HelpPage() {
  return (
    <div className="container-store max-w-3xl py-12">
      <h1 className="text-3xl font-black uppercase">Help Center</h1>
      <div className="mt-8 space-y-6">
        {FAQS.map((faq) => (
          <div key={faq.q} className="rounded-lg border p-6">
            <h2 className="font-semibold">{faq.q}</h2>
            <p className="mt-2 text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Need more help? <Link href={ROUTES.contact} className="underline">Contact us</Link> or raise a support ticket (Phase 5).
      </p>
    </div>
  );
}
