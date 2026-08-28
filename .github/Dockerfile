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

# Build-time public env (override via --build-arg in CI / Cloud Build).
# Empty APP_URL breaks `new URL('')` during Next.js page data collection — always default.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_CATALOG_IMAGE_BASE=
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ARG NEXT_PUBLIC_PRODUCT_STORE_ID=OFBIZ_STORE
ARG NEXT_PUBLIC_DEFAULT_CATALOG_ID=DEMO_CATALOG
ARG NEXT_PUBLIC_DEFAULT_CURRENCY=INR

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_CATALOG_IMAGE_BASE=$NEXT_PUBLIC_CATALOG_IMAGE_BASE \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_PRODUCT_STORE_ID=$NEXT_PUBLIC_PRODUCT_STORE_ID \
    NEXT_PUBLIC_DEFAULT_CATALOG_ID=$NEXT_PUBLIC_DEFAULT_CATALOG_ID \
    NEXT_PUBLIC_DEFAULT_CURRENCY=$NEXT_PUBLIC_DEFAULT_CURRENCY \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
