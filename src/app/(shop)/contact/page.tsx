import type { Metadata } from 'next';
import { StoreSettingsPageView } from '@/features/store/store-settings-page-view';
import { ContactForm } from '@/features/store/contact-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us',
};

export default function ContactPage() {
  return (
    <StoreSettingsPageView contentKey="contactUsContent" className="container-store max-w-xl py-12">
      <ContactForm />
    </StoreSettingsPageView>
  );
}
