export interface CmsSection {
  heading: string;
  body: string;
}

export interface CmsPage {
  slug: string;
  title: string;
  sections: CmsSection[];
}

const PAGES: Record<string, CmsPage> = {
  'about-us': {
    slug: 'about-us',
    title: 'About Us',
    sections: [
      {
        heading: 'Our Mission',
        body: 'PlayPro delivers performance sports gear to athletes at every level. From weekend warriors to competitive players, we source authentic equipment from the world\'s leading brands.',
      },
      {
        heading: 'Why PlayPro',
        body: '100% authentic products, competitive pricing, fast delivery, and hassle-free returns. We are built by athletes, for athletes.',
      },
    ],
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Data We Collect',
        body: 'We collect information you provide during registration, checkout, and support interactions. This includes name, email, phone, shipping address, and order history.',
      },
      {
        heading: 'How We Use Data',
        body: 'Your data is used to process orders, improve our services, and send relevant communications. We never sell your personal information to third parties.',
      },
    ],
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    sections: [
      {
        heading: 'Use of Service',
        body: 'By using PlayPro, you agree to these terms. You must be 18 or older to make purchases. Product availability and pricing are subject to change.',
      },
    ],
  },
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Refund Policy',
    sections: [
      {
        heading: '30-Day Returns',
        body: 'Unused items with original tags may be returned within 30 days of delivery. Refunds are processed within 5–7 business days after inspection.',
      },
    ],
  },
  'shipping-policy': {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    sections: [
      {
        heading: 'Delivery',
        body: 'Standard delivery takes 3–7 business days. Free shipping on orders over ₹999. Express delivery available in select cities.',
      },
    ],
  },
};

export function getCmsPage(slug: string): CmsPage | undefined {
  return PAGES[slug];
}

export function getAllCmsSlugs(): string[] {
  return Object.keys(PAGES);
}
