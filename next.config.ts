import type { NextConfig } from 'next';

const catalogBase = process.env.CATALOG_PROXY_TARGET ?? 'http://localhost:8085';
const pricingBase = process.env.PRICING_PROXY_TARGET ?? 'http://localhost:8081';
const partyBase = process.env.PARTY_PROXY_TARGET ?? 'http://localhost:8082';
const ordersBase = process.env.ORDERS_PROXY_TARGET ?? 'http://localhost:8083';
const facilityBase = process.env.FACILITY_PROXY_TARGET ?? 'http://localhost:8084';

const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '10.30.169.213')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Required for the slim production Docker image (copies .next/standalone).
  output: 'standalone',
  allowedDevOrigins,
  images: {
    // Local SVG heroes + catalog images; skip optimizer for SVG / blocked external CDNs
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8085', pathname: '/catalog/product-images/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8085', pathname: '/catalog/product-images/**' },
      { protocol: 'http', hostname: 'localhost', port: '8085', pathname: '/catalog/category-images/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8085', pathname: '/catalog/category-images/**' },
      { protocol: 'http', hostname: 'localhost', port: '8085', pathname: '/catalog/catalog-images/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8085', pathname: '/catalog/catalog-images/**' },
      {
        protocol: 'https',
        hostname: 'catalog-1089274910156.asia-south1.run.app',
        pathname: '/catalog/**',
      },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      { source: '/catalog/:path*', destination: `${catalogBase}/catalog/:path*` },
      { source: '/pricing/:path*', destination: `${pricingBase}/pricing/:path*` },
      { source: '/party/:path*', destination: `${partyBase}/party/:path*` },
      { source: '/orders/:path*', destination: `${ordersBase}/orders/:path*` },
      { source: '/facility/:path*', destination: `${facilityBase}/facility/:path*` },
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
