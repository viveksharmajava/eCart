import type { AnalyticsEvent } from '@/types/commerce';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;

  const payload = { ...event };

  if (window.gtag && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    window.gtag('event', event.name, payload);
  }

  if (window.dataLayer) {
    window.dataLayer.push({ event: event.name, ...payload });
  }

  if (window.fbq && event.name === 'purchase') {
    window.fbq('track', 'Purchase', payload);
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', event);
  }
}
