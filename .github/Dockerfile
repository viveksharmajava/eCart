# syntax=docker/dockerfile:1

# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public + rewrite targets (override via --build-arg in CI).
# Rewrites are baked into the Next.js build — must be production URLs here.
ARG NEXT_PUBLIC_APP_URL=https://ecart-ui-1089274910156.asia-south1.run.app
ARG NEXT_PUBLIC_CATALOG_IMAGE_BASE=https://catalog-1089274910156.asia-south1.run.app
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=1089274910156-ofgjjpbhfesklqf2qns8mrbotkm0jr64.apps.googleusercontent.com
ARG NEXT_PUBLIC_PRODUCT_STORE_ID=OFBIZ_STORE
ARG NEXT_PUBLIC_DEFAULT_CATALOG_ID=DEMO_CATALOG
ARG NEXT_PUBLIC_DEFAULT_CURRENCY=INR
ARG CATALOG_PROXY_TARGET=https://catalog-1089274910156.asia-south1.run.app
ARG PRICING_PROXY_TARGET=https://pricing-1089274910156.asia-south1.run.app
ARG PARTY_PROXY_TARGET=https://party-service-1089274910156.asia-south1.run.app
ARG ORDERS_PROXY_TARGET=https://orders-service-1089274910156.asia-south1.run.app
ARG FACILITY_PROXY_TARGET=https://facility-service-1089274910156.asia-south1.run.app
ARG CATALOG_API_BASE=https://catalog-1089274910156.asia-south1.run.app
ARG PRICING_API_BASE=https://pricing-1089274910156.asia-south1.run.app
ARG PARTY_API_BASE=https://party-service-1089274910156.asia-south1.run.app
ARG ORDERS_API_BASE=https://orders-service-1089274910156.asia-south1.run.app
ARG FACILITY_API_BASE=https://facility-service-1089274910156.asia-south1.run.app

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_CATALOG_IMAGE_BASE=$NEXT_PUBLIC_CATALOG_IMAGE_BASE \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_PRODUCT_STORE_ID=$NEXT_PUBLIC_PRODUCT_STORE_ID \
    NEXT_PUBLIC_DEFAULT_CATALOG_ID=$NEXT_PUBLIC_DEFAULT_CATALOG_ID \
    NEXT_PUBLIC_DEFAULT_CURRENCY=$NEXT_PUBLIC_DEFAULT_CURRENCY \
    NEXT_PUBLIC_BYPASS_STOCK_CHECK=false \
    CATALOG_PROXY_TARGET=$CATALOG_PROXY_TARGET \
    PRICING_PROXY_TARGET=$PRICING_PROXY_TARGET \
    PARTY_PROXY_TARGET=$PARTY_PROXY_TARGET \
    ORDERS_PROXY_TARGET=$ORDERS_PROXY_TARGET \
    FACILITY_PROXY_TARGET=$FACILITY_PROXY_TARGET \
    CATALOG_API_BASE=$CATALOG_API_BASE \
    PRICING_API_BASE=$PRICING_API_BASE \
    PARTY_API_BASE=$PARTY_API_BASE \
    ORDERS_API_BASE=$ORDERS_API_BASE \
    FACILITY_API_BASE=$FACILITY_API_BASE \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0 \
    CATALOG_API_BASE=https://catalog-1089274910156.asia-south1.run.app \
    PRICING_API_BASE=https://pricing-1089274910156.asia-south1.run.app \
    PARTY_API_BASE=https://party-service-1089274910156.asia-south1.run.app \
    ORDERS_API_BASE=https://orders-service-1089274910156.asia-south1.run.app \
    FACILITY_API_BASE=https://facility-service-1089274910156.asia-south1.run.app \
    CATALOG_PROXY_TARGET=https://catalog-1089274910156.asia-south1.run.app \
    PRICING_PROXY_TARGET=https://pricing-1089274910156.asia-south1.run.app \
    PARTY_PROXY_TARGET=https://party-service-1089274910156.asia-south1.run.app \
    ORDERS_PROXY_TARGET=https://orders-service-1089274910156.asia-south1.run.app \
    FACILITY_PROXY_TARGET=https://facility-service-1089274910156.asia-south1.run.app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
