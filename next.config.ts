import type { NextConfig } from 'next';

const catalogBase = process.env.CATALOG_PROXY_TARGET ?? 'http://localhost:8080';
const pricingBase = process.env.PRICING_PROXY_TARGET ?? 'http://localhost:8081';
const partyBase = process.env.PARTY_PROXY_TARGET ?? 'http://localhost:8082';
const ordersBase = process.env.ORDERS_PROXY_TARGET ?? 'http://localhost:8083';

const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '10.30.169.213')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    // Local SVG heroes + catalog images; skip optimizer for SVG / blocked external CDNs
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/catalog/product-images/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/catalog/product-images/**' },
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/catalog/category-images/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/catalog/category-images/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      { source: '/catalog/:path*', destination: `${catalogBase}/catalog/:path*` },
      { source: '/pricing/:path*', destination: `${pricingBase}/pricing/:path*` },
      { source: '/party/:path*', destination: `${partyBase}/party/:path*` },
      { source: '/orders/:path*', destination: `${ordersBase}/orders/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
