# PlayPro Storefront (ecart)

Customer-facing e-commerce web application built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

Design inspired by Nike.com and one8.com — bold, sport-first, mobile-responsive.

## Prerequisites

- **Node.js 20.19+** (or 22 LTS) — [https://nodejs.org](https://nodejs.org)
- During install on Windows, enable **“Add to PATH”**
- Running backend services:
  - catalog → `http://localhost:8080`
  - pricing → `http://localhost:8081`
  - party → `http://localhost:8082`
  - orders → `http://localhost:8083`

## Quick Start

### Option A — Setup script (Windows, recommended)

```powershell
cd C:\vivek\project\ecart
.\scripts\setup.ps1
npm run dev
```

### Option B — Manual

```powershell
cd C:\vivek\project\ecart
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### `npm` / `node` not recognized?

Node is often installed but **not on PATH**. Quick fix for the current terminal:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
node --version
npm install
```

**Permanent fix (Windows):**

1. Press `Win + R` → type `sysdm.cpl` → Enter  
2. **Advanced** → **Environment Variables**  
3. Under **User variables** or **System variables**, edit **Path**  
4. **New** → add: `C:\Program Files\nodejs`  
5. OK → **close and reopen** PowerShell / Cursor terminal  

Verify:

```powershell
node --version   # should show v20.x or v22.x
npm --version
```

### Other install issues

| Error | Fix |
|-------|-----|
| `EBADENGINE` warning | Upgrade Node to **20.19+** from nodejs.org |
| `EPERM` / cleanup failed | Close dev servers/IDE locks, delete `node_modules`, run `npm install` again |
| Corporate proxy | `npm config set proxy http://...` or use `npm install --registry https://registry.npmjs.org` |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:

- System context & API contracts
- Folder structure & routing
- State management (TanStack Query + Zustand)
- Authentication flow
- Payment abstraction
- SEO, analytics, security
- Implementation roadmap (Phases 1–6)

## Phase 1 (Implemented)

- Project scaffold & enterprise folder structure
- API integration layer with BFF routes (`/api/products`, `/api/search/suggest`)
- Next.js rewrites to backend microservices
- Shop layout (header, footer, mobile nav, global search)
- Home page (hero carousel, best sellers, trending, categories, brands, reviews)
- Product listing (infinite scroll via Load More)
- Product detail page (gallery, pricing, add to cart, wishlist)
- Cart with coupon mock (PLAY10, FLAT100)
- Auth pages (login, signup, OTP placeholder)
- CMS static pages (About, Privacy, Terms, Refund, Shipping)
- SEO (metadata, JSON-LD, sitemap, robots)

## Environment

Copy `.env.example` to `.env.local`. Key variables:

| Variable | Purpose |
|----------|---------|
| `CATALOG_SERVICE_AUTH_HEADER` | Server-side auth for BFF → catalog API |
| `NEXT_PUBLIC_DEFAULT_CATALOG_ID` | Homepage catalog sections |
| `NEXT_PUBLIC_APP_URL` | Canonical URL for SEO |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Phase 2 (Implemented)

- **PLP:** Sidebar + mobile filters (brand, price slider, rating, in stock, on sale)
- **Sort:** Relevance, price, rating, discount, newest, name
- **URL state:** All filters in query string (`/products?brand=nike&minPrice=500&sort=price_asc`)
- **Active filter chips** with clear all
- **Infinite scroll** via Intersection Observer
- **PDP:** Zoom gallery, video tab, size/color pickers, specs, reviews, related + FBT bundles
- **Search:** Product image autocomplete with prices

## Phase 3 (Implemented)

- Multi-step checkout (Address → Delivery → Payment → Review)
- Guest checkout with optional account creation
- Order creation via BFF → orders service
- Checkout success page
- Shared cart totals (shipping, coupons)

## Phase 4 (Implemented)

- Customer registration & login (party service `/party/auth/register`, `/party/auth/customer/login`)
- HttpOnly session cookie + Zustand auth state
- Account dashboard, profile, orders, order detail
- Saved addresses (local persistence until party address API)
- Protected `/account/*` routes

## Next Phases

- **Phase 5:** Reviews, help center, live chat
- **Phase 6:** Live payment providers, analytics, performance audit
