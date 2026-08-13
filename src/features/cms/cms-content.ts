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
        body: 'PlayPro delivers performance sports gear to athletes at every level. From weekend players to competitive athletes, we source authentic equipment from leading brands.',
      },
      {
        heading: 'Why PlayPro',
        body: '100% authentic products, competitive pricing, fast delivery, and dedicated customer support. Built by sports enthusiasts, for sports enthusiasts.',
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
      {
        heading: 'Contact',
        body: 'For privacy questions, email playprosportz@gmail.com or call 8431776905.',
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
      {
        heading: 'Returns',
        body: 'Sports goods are not returnable. Replacement requests may be raised within 7 days of delivery for color preference issues or damaged deliveries only.',
      },
    ],
  },
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Returns',
    sections: [
      {
        heading: 'Non-returnable products',
        body: 'Sports goods sold on PlayPro are not returnable.',
      },
      {
        heading: 'Replacement eligibility',
        body: 'You may raise a replacement request only if: (1) you do not like the color, or (2) the item was delivered in damaged condition. Requests must be submitted within 7 days of order delivery.',
      },
    ],
  },
  'shipping-policy': {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    sections: [
      {
        heading: 'Delivery',
        body: 'Standard delivery takes 3–7 business days. Free shipping on eligible orders over ₹999. Express delivery is available in select cities.',
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
