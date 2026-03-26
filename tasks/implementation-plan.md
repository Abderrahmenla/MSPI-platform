# MSPI Platform — Implementation Plan

> **Version:** 1.0
> **Created:** 2026-03-25
> **Scope:** Full MVP build — storefront, admin CRM, NestJS API
> **Team Roles:** Backend Developer (BE), Frontend Developer (FE), UI/UX Designer (UX), QA Tester (QA)

---

## Architecture Overview

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                        IMPLEMENTATION FLOW                       │
  │                                                                  │
  │  M0: Foundation ──► M1: Backend Core ──► M2: Catalog & Cart     │
  │       (Week 1)          (Week 1-2)           (Week 2-3)         │
  │                                                 │                │
  │                                                 ▼                │
  │  M5: Polish ◄── M4: Admin CRM ◄── M3: Orders & Quotes          │
  │   (Week 5)       (Week 4-5)          (Week 3-4)                 │
  │                                                                  │
  │  ════════════════════════════════════════════════════════════    │
  │  PARALLEL TRACKS:                                                │
  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐       │
  │  │ Backend │  │ Frontend │  │  UI/UX   │  │    QA     │       │
  │  │   API   │  │ Web+Admin│  │  Design  │  │  Testing  │       │
  │  └─────────┘  └──────────┘  └──────────┘  └───────────┘       │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Milestone 0: Project Foundation

**Duration:** Days 1–3
**Goal:** Monorepo scaffolded, tooling configured, local dev environment running, all team members can `pnpm dev`.

### Dependency Graph

```
  M0-T01 (Monorepo) ──► M0-T02 (API Skeleton)
       │                      │
       ├──► M0-T03 (Web Shell)│
       │                      │
       ├──► M0-T04 (Admin Shell)
       │
       ├──► M0-T05 (Shared Packages)
       │
       └──► M0-T06 (Tooling)
                │
                └──► M0-T07 (Docker + DB)
                       │
                       └──► M0-T08 (Review)
```

### Tasks

| ID     | Task                                                                                                                                                                                                                                                                                                                                                                                           | Type   | Role | Priority | Depends On  | Est |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- | -------- | ----------- | --- |
| M0-T01 | **Initialize pnpm + Turborepo monorepo** — Create `pnpm-workspace.yaml`, `turbo.json` with build/dev/lint pipelines, root `package.json` with workspace scripts (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm format`, `pnpm test`). Create `.env.example` with all env vars from TDD §7.                                                                                                      | build  | BE   | P0       | —           | 2h  |
| M0-T02 | **Scaffold NestJS API** — `nest new api` under `apps/api`. Configure: `main.ts` with global prefix `/api/v1`, global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform), Helmet, CORS (web+admin origins from ConfigModule), `@nestjs/throttler`. Create `app.module.ts` importing ConfigModule with env validation. Health endpoint `GET /api/v1/health`.                          | build  | BE   | P0       | M0-T01      | 3h  |
| M0-T03 | **Scaffold Next.js 15 web app** — `apps/web` with App Router. Configure: `[locale]` segment with `next-intl` (ar default, fr, en), route groups `(public)`, `(protected)`, `(auth)`. Root layout with fonts (Rubik + Nunito Sans), `dir` attribute for RTL. Path alias `@/*`. Tailwind config with brand colors from PRD §5.4 and UX Blueprint §0.1. Empty pages for all routes from PRD §2.1. | build  | FE   | P0       | M0-T01      | 4h  |
| M0-T04 | **Scaffold Next.js 15 admin app** — `apps/admin` with App Router. Route groups `(public)` for `/login`, `(app)` for authenticated shell. Tailwind config matching brand. Empty pages for all routes from PRD §2.2. No i18n initially (French single lang).                                                                                                                                     | build  | FE   | P0       | M0-T01      | 2h  |
| M0-T05 | **Create shared packages** — `packages/shared-types` (enums: OrderStatus, QuoteStatus, AdminRole, StockReason, Language; DTO interfaces; route constants; WhatsApp template types). `packages/config` (shared ESLint, TypeScript base, Prettier configs). `packages/ui` (placeholder for shared components).                                                                                   | build  | BE   | P0       | M0-T01      | 2h  |
| M0-T06 | **Configure code quality tooling** — ESLint (`eslint-config-next` + `@tanstack/eslint-plugin-query`), Prettier (`prettier-plugin-tailwindcss`, width 80, 2 spaces), Husky pre-commit hook, lint-staged, Commitlint (`@commitlint/config-conventional`). Verify `pnpm lint` and `pnpm format` work across all apps.                                                                             | build  | BE   | P0       | M0-T01      | 2h  |
| M0-T07 | **Docker Compose + Prisma setup** — `docker-compose.yml` for PostgreSQL 16. Create `prisma/schema.prisma` with full schema from TDD §3 (all 15 models, enums, indexes). Run `prisma migrate dev` to generate initial migration. Create `PrismaModule` + `PrismaService` in `apps/api/src/database/`. Verify `prisma studio` connects.                                                          | build  | BE   | P0       | M0-T02      | 3h  |
| M0-T08 | **Foundation review & smoke test** — Verify: `pnpm dev` starts all 3 apps, health endpoint returns 200, Prisma studio shows tables, `pnpm lint` passes, `pnpm build` succeeds, commit hooks work. Document any blockers.                                                                                                                                                                       | review | QA   | P0       | M0-T02..T07 | 2h  |

### M0 Acceptance Criteria

- [ ] `pnpm dev` starts web (:3000), admin (:3001), api (:4000) concurrently
- [ ] `GET /api/v1/health` returns `{ status: 'ok', db: 'connected' }`
- [ ] All 15 Prisma models migrated to PostgreSQL
- [ ] `pnpm lint` and `pnpm build` pass with zero errors
- [ ] Commitlint rejects non-conventional commits
- [ ] `.env.example` documents all required environment variables

---

## Milestone 1: Authentication & Core Backend

**Duration:** Days 3–7
**Goal:** Both auth flows working (Facebook OAuth for customers, email/password JWT for admin), guards protecting routes, core modules bootstrapped.

### Auth Flow Diagram

```
  CUSTOMER AUTH (Facebook OAuth)
  ═══════════════════════════════
  Browser ──► POST /auth/facebook ──► Redirect to Facebook
                                          │
  Browser ◄── Set-Cookie: token=JWT ◄─── GET /auth/facebook/callback
              (HttpOnly, Secure,          │
               SameSite=Lax)              Upsert user (facebook_id)
                                          Generate JWT { sub, type: 'customer' }
                                          Expiry: 24h

  ADMIN AUTH (Email/Password)
  ═══════════════════════════
  POST /admin/auth/login ──► Find admin by email
  { email, password }        │
                             ├── Check lockout (5 fails / 15 min)
                             ├── bcrypt.compare(password, hash)
                             ├── Generate JWT { sub, type: 'admin', role }
                             └── Set-Cookie: admin_token=JWT (60 min)
```

### Tasks

| ID     | Task                                                                                                                                                                                                                                                                                                                                                                               | Type   | Role | Priority | Depends On     | Est |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- | -------- | -------------- | --- |
| M1-T01 | **Plan auth architecture** — Document: Passport strategies (Facebook + JWT), guard hierarchy (CustomerAuthGuard vs AdminAuthGuard vs RolesGuard), cookie configuration (HttpOnly, Secure, SameSite), token payloads, refresh strategy, session expiry handling. Write to `tasks/auth-design.md`.                                                                                   | plan   | BE   | P0       | M0-T07         | 2h  |
| M1-T02 | **Implement ConfigModule with env validation** — Create `apps/api/src/config/env.validation.ts` validating all env vars (DATABASE_URL, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, JWT_SECRET, JWT_ADMIN_SECRET, WEB_URL, ADMIN_URL, etc.). Use class-validator or Joi. Inject via `ConfigService` everywhere — no raw `process.env`.                                                    | build  | BE   | P0       | M0-T07         | 2h  |
| M1-T03 | **Implement Facebook OAuth flow** — `auth.module.ts` with Passport Facebook strategy. `facebook-auth.controller.ts`: `POST /auth/facebook` (redirect), `GET /auth/facebook/callback` (handle code, upsert user, issue JWT, set cookie, redirect to returnUrl). `auth.service.ts`: `validateFacebookUser()`, `generateCustomerJwt()`. Handle edge cases: no email, cancelled login. | build  | BE   | P0       | M1-T01, M1-T02 | 6h  |
| M1-T04 | **Implement Admin auth** — `admin-auth.controller.ts`: `POST /admin/auth/login`, `POST /admin/auth/logout`. `auth.service.ts`: `validateAdmin()`, `generateAdminJwt()`. Brute force protection: track failed attempts, lock after 5 in 15 min. bcrypt password hashing. Seed initial super_admin user via Prisma seed script.                                                      | build  | BE   | P0       | M1-T01, M1-T02 | 4h  |
| M1-T05 | **Implement auth guards** — `CustomerAuthGuard` (validates customer JWT, extracts user), `AdminAuthGuard` (validates admin JWT, extracts admin), `RolesGuard` (checks `@Roles()` decorator against admin.role). `@CurrentUser()` param decorator. Apply guards globally where appropriate.                                                                                         | build  | BE   | P0       | M1-T03, M1-T04 | 3h  |
| M1-T06 | **Implement Users module** — `users.module.ts`, `users.service.ts`, `users.repository.ts`. Customer profile CRUD: `GET /customer/profile`, `PATCH /customer/profile` (name, phone, email, langPref). Address CRUD: `GET/POST/PATCH/DELETE /customer/addresses`. DTOs with class-validator. Ownership scoping (user can only access own data).                                      | build  | BE   | P0       | M1-T05         | 4h  |
| M1-T07 | **Implement global exception filter** — `common/filters/global-exception.filter.ts`. Map Prisma errors (not found, unique constraint) to appropriate HTTP codes. Strip stack traces in production. Consistent error envelope: `{ statusCode, message, error }`.                                                                                                                    | build  | BE   | P1       | M1-T02         | 2h  |
| M1-T08 | **Implement audit log interceptor** — `common/interceptors/audit-log.interceptor.ts`. Auto-log all admin mutations (POST, PATCH, DELETE on admin routes). Store: adminId, action, resource, before/after JSON, timestamp. Apply to all admin controllers.                                                                                                                          | build  | BE   | P1       | M1-T05         | 3h  |
| M1-T09 | **Write auth unit tests** — Test: Facebook user upsert (new user, returning user, no email), admin login (success, wrong password, locked account, inactive), JWT generation/validation, guard rejection on invalid/expired token, role guard (operator denied manager endpoint). Target: 80%+ coverage on auth.service.                                                           | test   | BE   | P0       | M1-T03..T05    | 4h  |
| M1-T10 | **Write auth integration tests (e2e)** — Supertest: full Facebook callback flow (mock Facebook API), admin login flow, protected route access/rejection, cookie handling, session expiry.                                                                                                                                                                                          | test   | QA   | P0       | M1-T09         | 4h  |
| M1-T11 | **Auth security review** — Review: JWT secrets separation (customer vs admin), cookie flags, CORS config, rate limiting on auth endpoints, no leaked credentials in responses, brute force protection, token expiry. Check OWASP auth guidelines.                                                                                                                                  | review | BE   | P0       | M1-T09         | 2h  |

### M1 Acceptance Criteria

- [ ] Facebook OAuth flow: redirect → callback → JWT cookie → redirect to app
- [ ] Admin login: email/password → JWT cookie → access admin routes
- [ ] CustomerAuthGuard blocks unauthenticated access to `/customer/*`
- [ ] AdminAuthGuard blocks unauthenticated access to `/admin/*`
- [ ] RolesGuard enforces RBAC (operator can't access manager endpoints)
- [ ] Brute force: 5 failed logins → 15 min lockout
- [ ] Customer can CRUD own profile and addresses
- [ ] 80%+ test coverage on auth module
- [ ] All admin mutations logged to audit_log table

---

## Milestone 2: Product Catalog & Cart

**Duration:** Days 7–12
**Goal:** Products API with images, public PLP/PDP, cart (localStorage + server-side), cart merge on login.

### Cart State Machine

```
  ANONYMOUS USER                    LOGGED-IN USER
  ══════════════                    ══════════════
  ┌──────────────┐                  ┌──────────────┐
  │ localStorage │                  │  Server Cart │
  │ [{sku, pid,  │   ──login──►    │  (PostgreSQL) │
  │   qty, date}]│   merge flow    │  cart + items │
  └──────┬───────┘                  └──────┬───────┘
         │                                 │
         ▼                                 ▼
  Validate stock                    Validate stock
  on page load                      on every operation
         │                                 │
         └────────► CART PAGE ◄────────────┘
                    │
                    ▼
              ┌──────────┐
              │ Checkout  │ (requires login)
              └──────────┘

  MERGE RULES:
  ┌────────────────────┬──────────────────────────────┐
  │ Local only         │ Add to server (if in stock)  │
  │ Server only        │ Keep as-is                   │
  │ Both (diff qty)    │ Server qty wins              │
  │ Local item OOS     │ Skip → toast notification    │
  │ Local price changed│ Add at current price → toast │
  └────────────────────┴──────────────────────────────┘
```

### Tasks

| ID                           | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Type   | Role | Priority | Depends On     | Est |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- | -------- | -------------- | --- |
| **Backend**                  |
| M2-T01                       | **Implement Products module (API)** — `products.module.ts`, `products.service.ts`, `products.repository.ts`. Public endpoints: `GET /products` (paginated, sortable), `GET /products/:slug` (with images), `GET /products/:slug/stock` (stock check). Admin endpoints: full CRUD `POST/PATCH /admin/products`, `POST /admin/products/:uuid/stock` (adjust with reason + history), image upload (multipart, local filesystem `/uploads/`), image delete, image reorder. Stock adjustment creates `StockHistory` entry. | build  | BE   | P0       | M1-T05         | 6h  |
| M2-T02                       | **Implement Cart module (API)** — `carts.module.ts`, `carts.service.ts`. Customer endpoints: `GET /customer/cart`, `POST /customer/cart/items`, `PATCH /customer/cart/items/:id`, `DELETE /customer/cart/items/:id`, `POST /customer/cart/merge`. Cart merge logic per PRD §10.5. Stock validation on add/update. Return `skipped[]` and `priceChanges[]` from merge.                                                                                                                                                 | build  | BE   | P0       | M2-T01         | 5h  |
| M2-T03                       | **Product seed data** — Prisma seed script with 5 initial products (Powder 1kg, 2kg, 6kg, 9kg; CO2 5kg) with Arabic/French/English names, descriptions, prices, stock counts, placeholder images.                                                                                                                                                                                                                                                                                                                     | build  | BE   | P1       | M2-T01         | 1h  |
| M2-T04                       | **Product & cart unit tests** — Test: product CRUD, stock adjustment (deduct, restore, history), stock validation (OOS, inactive, over-qty), cart add/update/remove, merge all scenarios (local-only, server-only, both, OOS, price-changed).                                                                                                                                                                                                                                                                         | test   | BE   | P0       | M2-T01, M2-T02 | 5h  |
| M2-T05                       | **Product & cart e2e tests** — Supertest: full PLP pagination, PDP by slug, stock check endpoint, cart CRUD as authenticated user, cart merge flow, image upload/delete.                                                                                                                                                                                                                                                                                                                                              | test   | QA   | P0       | M2-T04         | 4h  |
| **Frontend — Core Setup**    |
| M2-T06                       | **Implement core module (web)** — `src/modules/core/`: HTTP client (`axios` instance with base URL, auth cookie interceptor), `cn()` utility, theme tokens (CSS variables for brand colors, gradients), `QueryClientProvider`, TanStack Query devtools, `ROUTES_MAP` constants.                                                                                                                                                                                                                                       | build  | FE   | P0       | M0-T03         | 3h  |
| **Frontend — Design System** |
| M2-T07                       | **Install & configure shadcn/ui** — Install components in `apps/web`: Button, Input, Select, Textarea, Card, Badge, Dialog, Sheet, Skeleton, Toast, Accordion, Form. Configure with brand colors. Create `core/components/ui/` barrel exports.                                                                                                                                                                                                                                                                        | build  | FE   | P0       | M2-T06         | 2h  |
| M2-T08                       | **Design & build navigation system** — Mobile header (sticky, 56px, hamburger + logo + lang switcher + cart badge), mobile drawer (slide from RTL-aware side), desktop header (64px, full nav links). Language switcher (AR/FR/EN pill toggle). Cart icon with badge count. Transparent-on-hero → solid on scroll behavior. WhatsApp FAB (fixed, 56px circle, `#25D366`, z-index 90, hidden on checkout). Per UX Blueprint §1.                                                                                        | build  | FE   | P0       | M2-T07         | 5h  |
| M2-T09                       | **Design footer component** — Per UX Blueprint §4.1 Section 9. Logo, nav links, social icons, copyright. Dark background. RTL-aware.                                                                                                                                                                                                                                                                                                                                                                                  | build  | FE   | P1       | M2-T07         | 2h  |
| M2-T10                       | **Design trust badges component** — Reusable. 4 badges (COD, Delivery, Certified, Support) with SVG icons, i18n text. Horizontal scroll mobile, 4-col desktop. Per UX Blueprint §3.                                                                                                                                                                                                                                                                                                                                   | build  | UX   | P0       | M2-T07         | 2h  |
| **Frontend — Product Pages** |
| M2-T11                       | **Build Product Listing Page (PLP)** — `modules/products/`: API functions (`get-products.ts`), query key factory, `useProducts` hook. Page: H1 + product count, sort dropdown (default, price ↑, price ↓), product card grid (2-col mobile, 3-col tablet, 4-col desktop). Product card: image (1:1 lazy WebP), name (2-line clamp), price (Rubik 700, brand-500), stock badge (green/amber/grey pill), "Add to Cart" CTA. Skeleton loading (3 cards). Empty state. Per UX Blueprint §4.2.                             | build  | FE   | P0       | M2-T06, M2-T07 | 6h  |
| M2-T12                       | **Build Product Detail Page (PDP)** — Image gallery (swipe mobile, thumbnail desktop, 1:1 ratio, lazy load, skeleton), product info (H1 name, price, stock badge), trust badges strip, description + use cases tabs, quantity selector ([-][N][+], min 1, max stock), "Add to Cart" CTA, WhatsApp inquiry CTA. OOS state: greyed price, hidden quantity/CTA, WhatsApp fallback. Desktop: 2-column layout. Per UX Blueprint §4.3.                                                                                      | build  | FE   | P0       | M2-T11         | 6h  |
| M2-T13                       | **Build Cart Page** — `modules/cart/`: localStorage cart manager (add, update, remove, get), API functions, `useCart` hook. Cart page: line items (image, name, qty selector, unit price, subtotal, delete with undo toast), sticky summary bar (total, COD label, "Proceed to Checkout" CTA, "Continue Shopping" link). Stock re-validation on load. OOS item flagging (red border, alert, remove button). Empty cart state. Price change toasts. Per UX Blueprint §4.4.                                             | build  | FE   | P0       | M2-T11, M2-T12 | 6h  |
| M2-T14                       | **Implement cart merge on login** — When user authenticates: detect localStorage cart, call `POST /customer/cart/merge`, clear localStorage on success, show toasts for skipped/price-changed items, redirect to server-synced cart view.                                                                                                                                                                                                                                                                             | build  | FE   | P1       | M2-T13         | 3h  |
| **Testing & Review**         |
| M2-T15                       | **Frontend component tests (catalog)** — Testing Library + MSW: product card rendering (all stock states), PLP sort behavior, PDP gallery interaction, quantity selector limits, cart add/remove/update, cart summary calculation, stock badge logic.                                                                                                                                                                                                                                                                 | test   | QA   | P0       | M2-T11..T14    | 5h  |
| M2-T16                       | **UI/UX review — catalog pages** — Review against UX Blueprint: spacing, typography, colors, RTL layout, mobile responsiveness, stock badges, empty states, loading skeletons, animations (`prefers-reduced-motion`). Verify all 3 locales render correctly.                                                                                                                                                                                                                                                          | review | UX   | P0       | M2-T11..T14    | 3h  |

### M2 Acceptance Criteria

- [ ] PLP: displays products with correct stock badges, sorting works, skeleton loading
- [ ] PDP: image gallery, quantity selector, add to cart, WhatsApp CTA, OOS state
- [ ] Cart: localStorage for anon, server-side for logged in, merge on login
- [ ] Cart merge handles all 5 scenarios (local-only, server-only, both, OOS, price-changed)
- [ ] Stock validation prevents adding OOS/inactive products
- [ ] Admin can CRUD products, upload images, adjust stock with history
- [ ] All pages render correctly in AR (RTL), FR, EN
- [ ] Trust badges appear on PDP below price
- [ ] Product API returns paginated, sorted results

---

## Milestone 3: Checkout, Orders & Quotes

**Duration:** Days 12–19
**Goal:** Full checkout flow with COD, order lifecycle (5 statuses), customer order tracking, quote submission and pipeline.

### Order State Machine

```
  ┌─────────┐    confirm     ┌───────────┐     ship      ┌─────────┐    deliver    ┌───────────┐
  │ PENDING │───────────────►│ CONFIRMED │──────────────►│ SHIPPED │────────────►│ DELIVERED │
  └────┬────┘                └─────┬─────┘               └────┬────┘             └─────┬─────┘
       │                          │                           │                        │
       │ cancel                   │ cancel                    │ cancel                 │ reopen
       │                          │ (restore stock)           │ (restore stock)        │ (mgr only)
       ▼                          ▼                           ▼                        ▼
  ┌──────────────────────────────────────────────┐                               ┌─────────┐
  │                  CANCELLED                    │                               │ PENDING │
  │              (terminal state)                 │                               └─────────┘
  └──────────────────────────────────────────────┘

  Stock Impact:
    pending → confirmed:    stock -= qty (deduct)
    confirmed → cancelled:  stock += qty (restore)
    shipped → cancelled:    stock += qty (restore)
    all other transitions:  no stock change
```

### Quote State Machine

```
  ┌─────┐   contact    ┌───────────┐   send offer   ┌────────────┐
  │ NEW │─────────────►│ CONTACTED │───────────────►│ OFFER_SENT │
  └──┬──┘              └─────┬─────┘                └──┬───┬─────┘
     │                       │                         │   │
     │ expire                │ expire        won ──────┘   │ lost
     ▼                       ▼                  │          ▼
  ┌─────────┐           ┌─────────┐        ┌───┴─────┐  ┌────────┐
  │ EXPIRED │           │ EXPIRED │        │   WON   │  │  LOST  │
  │(reopen) │           │(reopen) │        │(→order) │  │        │
  └─────────┘           └─────────┘        └─────────┘  └────────┘
```

### Tasks

| ID                              | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Type   | Role | Priority | Depends On     | Est |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ---- | -------- | -------------- | --- |
| **Backend — Orders**            |
| M3-T01                          | **Implement Orders module (API)** — `orders.module.ts`, `orders.service.ts`, `orders.repository.ts`. Checkout: `POST /customer/orders` with full transactional flow from TDD §5.1 (idempotency check, load cart, lock products FOR UPDATE, validate stock, generate ref ORD-XXXX, create order + items with price snapshot, create status history, clear cart, COMMIT). Customer endpoints: `GET /customer/orders` (paginated, filterable by status), `GET /customer/orders/:uuid` (with timeline), `POST /customer/orders/:uuid/reorder`. | build  | BE   | P0       | M2-T02         | 8h  |
| M3-T02                          | **Implement order status transitions** — `ORDER_TRANSITIONS` map enforcing valid transitions. `PATCH /admin/orders/:uuid/status` with transactional stock impact: confirmed → deduct, cancelled from confirmed/shipped → restore. Create `OrderStatusHistory` entry. Create `AuditLog` entry. Rate limit: max 3 pending orders per user (COD fraud mitigation).                                                                                                                                                                            | build  | BE   | P0       | M3-T01         | 5h  |
| M3-T03                          | **Implement Quotes module (API)** — `quotes.module.ts`, `quotes.service.ts`. Customer: `POST /customer/quotes` (create with status NEW, generate ref QT-XXXX, duplicate detection within 5 min), `GET /customer/quotes`, `GET /customer/quotes/:uuid`. Admin: `GET/PATCH /admin/quotes`, status transitions, `POST /admin/quotes/:uuid/convert` (create order from won quote, link via FK). `QUOTE_TRANSITIONS` map.                                                                                                                       | build  | BE   | P0       | M1-T05         | 6h  |
| M3-T04                          | **Implement Notes module** — Polymorphic notes for orders, quotes, customers. `POST /admin/orders/:uuid/notes`, `POST /admin/quotes/:uuid/notes`, `POST /admin/customers/:uuid/notes`. Author tracking.                                                                                                                                                                                                                                                                                                                                    | build  | BE   | P1       | M3-T01, M3-T03 | 2h  |
| M3-T05                          | **Orders & quotes unit tests** — Test: checkout transaction (happy path, stock conflict, empty cart, idempotency), all order transitions (valid + invalid), stock deduction/restoration, reorder (full stock, partial OOS, all OOS, price changed), quote creation (happy, duplicate), quote transitions, convert-to-order. **Critical tests from TDD §10**: concurrent checkout race, cancel + stock restore.                                                                                                                             | test   | BE   | P0       | M3-T01..T03    | 8h  |
| M3-T06                          | **Orders & quotes e2e tests** — Supertest: full checkout flow, status change flow, reorder flow, quote submission, quote pipeline, convert to order. Verify stock integrity across operations.                                                                                                                                                                                                                                                                                                                                             | test   | QA   | P0       | M3-T05         | 6h  |
| **Frontend — Checkout**         |
| M3-T07                          | **Build Facebook SSO gate component** — Full-screen gate shown when unauthenticated user tries checkout or quote. Per UX Blueprint §4.5 Step 0: logo, H2 explanation, Facebook button (`#1877F2`), WhatsApp fallback CTA, trust icons ("won't post", "identity verification only"). Error states: SSO cancelled, Facebook API down.                                                                                                                                                                                                        | build  | FE   | P0       | M2-T06         | 4h  |
| M3-T08                          | **Build Checkout page** — Per UX Blueprint §4.5 Step 1. Single-page form: name (prefilled from FB), phone (required, +216 validation), saved address dropdown (returning customers) + new address option, city dropdown (Tunisian cities), notes (optional with helper text). Order summary (always visible): line items, total, "الدفع: عند الاستلام". Trust strip above submit. Submit: spinner, API stock validation, idempotency key. Yup schema validation. react-hook-form.                                                          | build  | FE   | P0       | M3-T07         | 8h  |
| M3-T09                          | **Build Checkout confirmation page** — Per UX Blueprint §4.5 Step 2. Checkmark animation (SVG draw-in 500ms), order ref, summary, "next steps" (3 steps), "Track Order" link, WhatsApp share button, "Continue Shopping" link. Fire Meta Pixel `Purchase` event.                                                                                                                                                                                                                                                                           | build  | FE   | P0       | M3-T08         | 3h  |
| M3-T10                          | **Build Quote form page (`/devis`)** — Per UX Blueprint §4.6. SSO gate (same component, different copy). Progressive disclosure form: Step 1 always visible (name, phone, city, service type dropdown, property type dropdown), Step 2 collapsed (surface/rooms, electrical toggle, notes with 2000 char limit). Trust message. Submit → confirmation page with quote ref + WhatsApp CTA. Fire Meta Pixel `Lead` event. Yup schema.                                                                                                        | build  | FE   | P0       | M3-T07         | 5h  |
| **Frontend — Customer Account** |
| M3-T11                          | **Build Account dashboard** — Per UX Blueprint §4.7. Welcome message + Facebook badge, stats row (total orders, total quotes), recent orders (last 3 cards with status badges), recent quotes (last 2), quick action links. Protected route (redirect to SSO if unauthenticated).                                                                                                                                                                                                                                                          | build  | FE   | P0       | M3-T07         | 4h  |
| M3-T12                          | **Build My Orders pages** — List: order cards (ref, date, item summary, total, status badge, "View" link). Filterable by status. Detail: tracking timeline stepper (placed → confirmed → shipped → delivered, with timestamps, cancelled state with cross icon in error color). Line items, total, delivery address, tracking number. Reorder button (on delivered, validates stock, shows skipped items). Cancel request (on pending, opens WhatsApp).                                                                                    | build  | FE   | P0       | M3-T11         | 6h  |
| M3-T13                          | **Build My Quotes pages** — List: quote cards (ID, service type, date, status badge — color-coded: new=blue, contacted=amber, offer_sent=purple, won=green, lost=grey). Detail: service/property details, status timeline stepper, associated order link (if converted), WhatsApp follow-up button. Empty state.                                                                                                                                                                                                                           | build  | FE   | P0       | M3-T11         | 4h  |
| M3-T14                          | **Build Profile page** — Editable: name, phone, email (optional). Language preference toggle (AR/FR/EN). Saved addresses list (edit, delete, add new, default marker). Facebook badge (non-editable). Yup validation.                                                                                                                                                                                                                                                                                                                      | build  | FE   | P0       | M3-T11         | 3h  |
| **Testing & Review**            |
| M3-T15                          | **Frontend tests (checkout + account)** — Testing Library + MSW: SSO gate render + actions, checkout form validation (phone format, required fields), checkout submit flow (success, stock error), confirmation page, quote form validation + submit, account dashboard data, order list filtering, timeline stepper states.                                                                                                                                                                                                               | test   | QA   | P0       | M3-T08..T14    | 6h  |
| M3-T16                          | **UI/UX review — checkout & account** — Review against UX Blueprint: SSO gate copy/trust messaging, checkout form layout (single page, prefilled, sticky submit), confirmation animation, quote progressive disclosure, account dashboard layout, timeline stepper styling, RTL rendering, mobile responsiveness, all 3 locales.                                                                                                                                                                                                           | review | UX   | P0       | M3-T08..T14    | 3h  |
| M3-T17                          | **Security review — checkout flow** — Review: idempotency implementation, stock locking (SELECT FOR UPDATE), ownership scoping (user A can't access user B's orders), rate limiting on checkout/quote endpoints, input validation (phone, address length, note length), CSRF protection, XSS in user-submitted notes.                                                                                                                                                                                                                      | review | BE   | P0       | M3-T05         | 3h  |

### M3 Acceptance Criteria

- [ ] Checkout: cart → SSO gate (if needed) → form → submit → confirmation with order ref
- [ ] Idempotency: double-click doesn't create duplicate orders
- [ ] Stock locking: concurrent checkout for last-1 stock → one succeeds, one gets 409
- [ ] All 5 order status transitions work with correct stock impact
- [ ] Reorder: adds available items to cart, shows skipped OOS items
- [ ] Quote form: progressive disclosure, submit creates quote with ref QT-XXXX
- [ ] Customer account: dashboard, orders list/detail with timeline, quotes list/detail, profile
- [ ] Cancel from confirmed/shipped restores stock
- [ ] Rate limit: max 3 pending orders per user
- [ ] Meta Pixel fires `Purchase` and `Lead` events

---

## Milestone 4: Admin CRM

**Duration:** Days 19–26
**Goal:** Full admin panel — dashboard, orders management, quotes pipeline (list + kanban), customer 360, product/inventory management, settings, audit log.

### Admin Module Map

```
  ┌─────────────────────────────────────────────────────────┐
  │                    ADMIN APP (apps/admin)                │
  │                                                         │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
  │  │Dashboard │  │ Orders   │  │ Quotes   │  │Customers│ │
  │  │          │  │          │  │          │  │         │ │
  │  │• KPIs    │  │• List    │  │• List    │  │• Search │ │
  │  │• Queues  │  │• Detail  │  │• Kanban  │  │• 360    │ │
  │  │• Activity│  │• Actions │  │• Detail  │  │• Notes  │ │
  │  └──────────┘  │• Notes   │  │• Convert │  └────────┘ │
  │                │• Export  │  │• Notes   │              │
  │  ┌──────────┐  └──────────┘  │• Export  │  ┌────────┐ │
  │  │Products  │                └──────────┘  │Settings│ │
  │  │          │                               │        │ │
  │  │• List    │                               │• Team  │ │
  │  │• Edit    │                               │• Config│ │
  │  │• Stock   │                               │• Audit │ │
  │  │• Images  │                               │• Health│ │
  │  │• Import  │                               └────────┘ │
  │  └──────────┘                                          │
  └─────────────────────────────────────────────────────────┘
```

### Tasks

| ID                            | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Type   | Role | Priority | Depends On  | Est |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- | -------- | ----------- | --- |
| **Backend — Admin Endpoints** |
| M4-T01                        | **Implement Dashboard module** — `dashboard.controller.ts`, `dashboard.service.ts`. `GET /admin/dashboard/stats` (KPI aggregation from TDD §8.2, cached 60s): orders (24h/7d/30d counts, pending count, revenue, AOV), quotes (new, won, total), low stock count, customer stats (new, repeat). `GET /admin/dashboard/queues` (5 latest pending orders + 5 latest new quotes). `GET /admin/dashboard/activity` (last 10 audit log entries).                                                                                                                                                                                                                               | build  | BE   | P0       | M1-T08      | 5h  |
| M4-T02                        | **Implement admin Orders endpoints** — `GET /admin/orders` (filtered by status, date range, customer search, price range; paginated 20/page; sortable by date, status, amount), `GET /admin/orders/:uuid` (full detail with timeline + notes), `PATCH /admin/orders/:uuid/status`, `POST /admin/orders/:uuid/notes`, `GET /admin/orders/export` (CSV with order details and timestamps). Bulk actions: batch confirm/ship/cancel.                                                                                                                                                                                                                                         | build  | BE   | P0       | M3-T02      | 5h  |
| M4-T03                        | **Implement admin Quotes endpoints** — `GET /admin/quotes` (filtered by status, date, customer, service/property type; paginated), `GET /admin/quotes/:uuid`, `PATCH /admin/quotes/:uuid/status`, `POST /admin/quotes/:uuid/notes`, `POST /admin/quotes/:uuid/convert` (create order from won quote), `GET /admin/quotes/export` (CSV).                                                                                                                                                                                                                                                                                                                                   | build  | BE   | P0       | M3-T03      | 4h  |
| M4-T04                        | **Implement admin Customers endpoints** — `GET /admin/customers` (search by name/phone/email, filter by has orders/quotes/repeat, paginated), `GET /admin/customers/:uuid` (360 profile: basic info, engagement summary with revenue/conversion %, order history, quote history, addresses, notes).                                                                                                                                                                                                                                                                                                                                                                       | build  | BE   | P0       | M1-T06      | 4h  |
| M4-T05                        | **Implement admin Staff & Settings** — `GET/POST/PATCH /admin/users` (staff CRUD, role assignment, deactivate). `GET/PATCH /admin/settings` (WhatsApp number, Meta Pixel ID, Facebook App ID). `GET /admin/audit-log` (filtered by date, admin, action; paginated), `GET /admin/audit-log/export` (CSV).                                                                                                                                                                                                                                                                                                                                                                  | build  | BE   | P0       | M1-T05      | 4h  |
| M4-T06                        | **Admin endpoints unit + e2e tests** — Test: dashboard KPI calculation, order list filtering/pagination, quote status transitions via admin, convert quote to order, customer search, staff CRUD with role validation, audit log filtering, CSV export format.                                                                                                                                                                                                                                                                                                                                                                                                            | test   | BE   | P0       | M4-T01..T05 | 6h  |
| **Frontend — Admin Core**     |
| M4-T07                        | **Build admin core module** — `apps/admin/src/modules/core/`: HTTP client (admin JWT cookie), `cn()`, theme tokens, `QueryClientProvider`, `ROUTES_MAP`, shadcn/ui installation (Button, Input, Select, Table, Badge, Dialog, Sheet, Tabs, Toast, Card, DropdownMenu, DataTable patterns).                                                                                                                                                                                                                                                                                                                                                                                | build  | FE   | P0       | M0-T04      | 3h  |
| M4-T08                        | **Build admin auth (login page)** — Login form: email + password, Yup validation (min 8 chars, 1 uppercase, 1 number), error states (invalid credentials, locked account). Redirect to dashboard on success. Auth provider with JWT cookie management. Protected route wrapper.                                                                                                                                                                                                                                                                                                                                                                                           | build  | FE   | P0       | M4-T07      | 3h  |
| M4-T09                        | **Build admin layout shell** — Sidebar navigation (Dashboard, Orders, Quotes, Customers, Products, Settings — role-aware visibility), top bar (admin name + role, logout button), responsive: sidebar collapses to hamburger on tablet. Active page highlight. Notification badges on Orders/Quotes for pending items.                                                                                                                                                                                                                                                                                                                                                    | build  | FE   | P0       | M4-T07      | 4h  |
| **Frontend — Admin Pages**    |
| M4-T10                        | **Build Dashboard page** — KPI cards (24h/7d/30d tabs): orders count + pending + revenue + AOV, quotes count + converted + conversion rate, low stock alerts (hyperlinked to products), new customers + repeat. Pending orders queue (5 items, click to detail). New quotes queue (5 items). Recent activity feed (10 items, timestamps + actor).                                                                                                                                                                                                                                                                                                                         | build  | FE   | P0       | M4-T09      | 6h  |
| M4-T11                        | **Build Orders management pages** — List: data table with columns (ref, customer, phone, status badge, items, total, date, actions dropdown). Filters: status chips, date range picker, customer search input, price range. Server-side pagination (20/page). Bulk actions: select multiple → batch status change. CSV export button. Detail: header (ref, customer link, dates), line items table (read-only), order timeline (immutable), status action buttons (per state: "Confirm & Deduct", "Mark Shipped" + tracking field, "Mark Delivered", "Cancel" + required note), "Notify via WhatsApp" (opens wa.me with locale template), internal notes (add + history). | build  | FE   | P0       | M4-T09      | 8h  |
| M4-T12                        | **Build Quotes management pages** — List: data table (ID, customer, phone, service type, property type, status, updated, actions). Filters + pagination. Kanban view toggle: columns per status, cards (ID, customer, phone, updated), drag-to-move (optimistic update + DB sync). Detail: header, service/property details, timeline, status actions ("Mark Contacted", "Send Offer" → WhatsApp, "Mark Won" + note, "Mark Lost" + note, "Expire" / "Reopen"), convert-to-order button (on WON), internal notes. CSV export.                                                                                                                                              | build  | FE   | P0       | M4-T09      | 8h  |
| M4-T13                        | **Build Customers pages** — Search: input (name/phone/email), results table (name, phone, email, city, orders, quotes, spend, joined, last order). Filters: has orders, has quotes, repeat buyers, city. 360 profile: info card, engagement summary (revenue, quote conversion %, AOV, dates), order history table (linked), quote history table (linked), addresses list, admin notes (add + history).                                                                                                                                                                                                                                                                   | build  | FE   | P0       | M4-T09      | 6h  |
| M4-T14                        | **Build Products management pages** — List: data table (SKU, Arabic name, category, price, stock, threshold, active flag, updated, actions). Filters: active/inactive, low stock, category. Edit page: names (AR/FR/EN), description, category, price, images (upload/reorder/delete with drag), stock adjustment (qty delta + reason dropdown → creates history), low-stock threshold, active toggle. Stock history log (immutable). Bulk CSV import (with preview).                                                                                                                                                                                                     | build  | FE   | P0       | M4-T09      | 7h  |
| M4-T15                        | **Build Settings pages** — Integration config: WhatsApp number (masked), Meta Pixel ID, Facebook App ID. Team management: staff table (email, name, role, status, last login), add user form, edit role/deactivate. System health: API status indicator, DB status, last backup. Audit log: filterable table (date, admin, action, resource), expandable before/after JSON, CSV export. SuperAdmin-only access enforcement.                                                                                                                                                                                                                                               | build  | FE   | P0       | M4-T09      | 6h  |
| **Testing & Review**          |
| M4-T16                        | **Admin frontend tests** — Testing Library + MSW: login flow, dashboard KPI display, order list filtering/pagination, order detail status actions, quote kanban drag simulation, customer search, product edit form, settings RBAC (viewer can't see settings).                                                                                                                                                                                                                                                                                                                                                                                                           | test   | QA   | P0       | M4-T10..T15 | 6h  |
| M4-T17                        | **Admin UI/UX review** — Review: data table usability (columns, sorting, filtering), form layouts, mobile/tablet responsiveness, action button placement, kanban drag UX, dashboard information hierarchy, error states, loading states, empty states. Admin is desktop-first but must work on tablet.                                                                                                                                                                                                                                                                                                                                                                    | review | UX   | P0       | M4-T10..T15 | 3h  |
| M4-T18                        | **Admin security review** — Review: RBAC enforcement (every endpoint role-checked), no privilege escalation (operator can't access manager endpoints), staff deactivation prevents login, audit log immutability, sensitive data masking (WhatsApp number, passwords), CSV export doesn't include password hashes.                                                                                                                                                                                                                                                                                                                                                        | review | BE   | P0       | M4-T06      | 2h  |

### M4 Acceptance Criteria

- [ ] Dashboard shows accurate KPIs with 24h/7d/30d breakdown
- [ ] Pending orders and new quotes appear in dashboard queues
- [ ] Orders: list with full filtering, detail with timeline and status actions
- [ ] Confirm deducts stock, cancel restores stock, actions create audit entries
- [ ] WhatsApp notify opens wa.me with correct locale template
- [ ] Quotes: list + kanban toggle, drag-to-move updates status
- [ ] Convert won quote to order creates linked order
- [ ] Customer 360: full history, engagement stats, notes
- [ ] Products: full CRUD, image management, stock adjustment with history
- [ ] Settings: team CRUD (super_admin only), audit log with CSV export
- [ ] RBAC: viewer read-only, operator orders/quotes, manager full, super_admin settings

---

## Milestone 5: Integration, Polish & Launch Prep

**Duration:** Days 26–33
**Goal:** WhatsApp templates, Meta Pixel events, landing page, i18n polish, edge cases hardened, performance optimized, full QA pass.

### Tasks

| ID                         | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type   | Role  | Priority | Depends On     | Est |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----- | -------- | -------------- | --- |
| **Landing Page**           |
| M5-T01                     | **Build Landing Page** — Per UX Blueprint §4.1. 9 sections: (1) Hero — full-width gradient, H1 "احمِ ما يهمّك", subtitle, Shop Now + Get Quote CTAs, product image, Framer Motion fade-up animations. (2) Trust badges strip. (3) Product highlights grid (reuse product cards). (4) Use cases — 3 cards (Car, Home, Business) with icons. (5) How It Works — 3 numbered steps with icons, staggered scroll animation. (6) Quote CTA banner — gradient background, CTA + WhatsApp secondary. (7) Testimonials carousel (auto-scroll, manual swipe, 1/3 visible). (8) FAQ accordion (single-open, chevron animation). (9) Footer. Respect `prefers-reduced-motion`. | build  | FE    | P0       | M2-T07..T10    | 10h |
| M5-T02                     | **Landing page animation review** — Review Framer Motion animations: hero sequence timing, section reveal on scroll, stagger grid, `prefers-reduced-motion` gate, performance on low-end devices (throttle test), LCP impact.                                                                                                                                                                                                                                                                                                                                                                                                                                      | review | UX    | P1       | M5-T01         | 2h  |
| **WhatsApp Integration**   |
| M5-T03                     | **Implement WhatsApp template system** — Store templates per locale in DB `settings` table or constants. Template types per PRD §13.1: order confirmed/shipped/delivered/cancelled, quote follow-up/offer, customer support. Variable interpolation: `{name}`, `{orderRef}`, `{quoteRef}`, `{serviceType}`, `{trackingNumber}`. Generate `wa.me` deep links. Admin "Notify via WhatsApp" buttons use locale-aware templates. Store outbound payload in DB for ops tracking.                                                                                                                                                                                        | build  | BE    | P0       | M3-T02, M3-T03 | 4h  |
| M5-T04                     | **Integrate WhatsApp throughout frontend** — Admin: "Notify via WhatsApp" on order detail (per status), quote detail. Customer: WhatsApp support FAB (all pages), quote confirmation WhatsApp handoff, order cancel request via WhatsApp. Use customer's `langPref` for template language.                                                                                                                                                                                                                                                                                                                                                                         | build  | FE    | P0       | M5-T03         | 3h  |
| **Meta Pixel**             |
| M5-T05                     | **Implement Meta Pixel events** — Client-side Pixel integration in `apps/web`. Events per UX Blueprint §8: `PageView` (every page), `ViewContent` (PDP: sku, price, currency TND), `AddToCart` (add to cart: sku, price, qty), `InitiateCheckout` (checkout page: cart total, num_items), `Lead` (quote submit: service_type), `Purchase` (order confirmation: total, currency, content_ids, num_items). Consent-aware loading.                                                                                                                                                                                                                                    | build  | FE    | P1       | M3-T09, M3-T10 | 3h  |
| **i18n & RTL Polish**      |
| M5-T06                     | **Complete i18n translation files** — All UI strings in AR/FR/EN for web app. Translation keys organized by module (common, products, cart, checkout, quote, account, landing). Verify: Arabic numerals policy, currency formatting ("د.ت" after number in AR, before in FR), phone input LTR within RTL, date formatting per locale.                                                                                                                                                                                                                                                                                                                              | build  | FE    | P0       | M3-T14         | 4h  |
| M5-T07                     | **RTL layout audit** — Systematic review per UX Blueprint §6: text alignment, flex direction, drawer slide direction, back/chevron arrows, progress stepper direction, price alignment, WhatsApp FAB position, CSS logical properties usage, icon mirroring (directional flip, symmetric no-flip). Test all pages in AR locale.                                                                                                                                                                                                                                                                                                                                    | review | UX    | P0       | M5-T06         | 4h  |
| **Edge Cases & Hardening** |
| M5-T08                     | **Implement all edge cases from PRD §16** — Stock: OOS between PDP→cart, qty exceeds stock (clamp), product deactivated while in cart, OOS at checkout, price changed. Cart: empty→checkout disabled, merge scenarios, localStorage cleared. Checkout: double-click (idempotency), network timeout, phone validation, address validation, session expiry. SSO: cancelled, API down, no email, token expired. Quotes: duplicate detection, field validation. Reorder: full stock, partial OOS, all OOS, price changed.                                                                                                                                              | build  | FE+BE | P0       | M3-T05         | 6h  |
| M5-T09                     | **SEO implementation** — Localized meta titles/descriptions per page, OG images (use MSPI logo), hreflang tags across AR/FR/EN, canonical URLs, sitemap generation per locale, JSON-LD structured data (FAQ page, Product schema on PDP). `robots.txt`.                                                                                                                                                                                                                                                                                                                                                                                                            | build  | FE    | P1       | M5-T06         | 3h  |
| **Performance**            |
| M5-T10                     | **Performance optimization** — Frontend: Next.js Image for all product images (WebP, lazy load), font subsetting (Rubik + Nunito Sans), route prefetching on link hover/viewport, skeleton loading states. Backend: dashboard KPI query caching (60s TTL), pagination on all list endpoints, compound indexes per TDD §8.1. Target: LCP < 2.5s on mobile 4G.                                                                                                                                                                                                                                                                                                       | build  | FE+BE | P1       | M5-T01         | 4h  |
| M5-T11                     | **Security hardening** — Final review per PRD §18: CORS restricted to web+admin origins, Helmet enabled, rate limiting verified (5/min checkout, 10/min auth), all DTOs validated, no IDOR (UUID + ownership scoping), no leaked secrets in client bundle (`NEXT_PUBLIC_*` audit), HTTPS enforcement in production config, CSP headers.                                                                                                                                                                                                                                                                                                                            | review | BE    | P0       | M4-T18         | 3h  |
| **Comprehensive QA**       |
| M5-T12                     | **E2E test suite (Playwright)** — Critical paths: (1) Landing → PLP → PDP → add to cart → cart → SSO → checkout → confirmation. (2) Quote: landing → /devis → SSO → form → submit → confirmation. (3) Reorder: account → orders → reorder → cart. (4) Admin: login → dashboard → order confirm → WhatsApp notify. (5) Admin: quote kanban drag → status change. All tested in AR (RTL) + FR.                                                                                                                                                                                                                                                                       | test   | QA    | P0       | M5-T08         | 8h  |
| M5-T13                     | **Cross-browser & device testing** — Test on: Chrome (desktop + Android), Safari (desktop + iOS), Firefox. Real Arabic-locale device testing. Test: RTL rendering, sticky elements, image gallery swipe, form inputs (phone keyboard), WhatsApp deep links open correctly.                                                                                                                                                                                                                                                                                                                                                                                         | test   | QA    | P0       | M5-T12         | 4h  |
| M5-T14                     | **Accessibility audit** — Per UX Blueprint §10: color contrast ≥ 4.5:1, min 44×44px tap targets, focus rings (3px brand-500), skip-to-content link, image alt text, form labels + aria-live errors, `prefers-reduced-motion` respected, heading hierarchy (no skips), `lang` attribute per locale, semantic HTML (nav, main, section).                                                                                                                                                                                                                                                                                                                             | review | UX    | P0       | M5-T12         | 3h  |
| M5-T15                     | **Load testing & monitoring** — Verify: dashboard KPI query < 200ms with indexes, checkout transaction < 500ms, product list < 100ms. Set up: structured JSON logging, health check endpoint, Nginx reverse proxy config, PM2 process management for 3 Node apps.                                                                                                                                                                                                                                                                                                                                                                                                  | test   | BE    | P1       | M5-T10         | 3h  |
| M5-T15a                    | **Lightweight CI pipeline** — GitHub Actions workflow: on PR push → run `pnpm lint` across all apps → run `pnpm test` (unit + e2e) → block merge if either fails. No CD/deployment automation (manual deploy to VPS after merge). Catches regressions before code lands.                                                                                                                                                                                                                                                                                                                                                                                           | build  | BE    | P0       | M5-T15         | 3h  |
| **Deployment**             |
| M5-T16                     | **Deployment configuration** — Nginx reverse proxy config (web→3000, admin→3001, api→4000, /uploads/ static). PM2 ecosystem file. PostgreSQL backup cron (daily). `.env.production` template. SSL certificate setup guide. Deployment runbook documenting: server setup, DB migration, seed data, app start, health verification.                                                                                                                                                                                                                                                                                                                                  | plan   | BE    | P0       | M5-T15         | 4h  |
| M5-T17                     | **Launch smoke test** — Full manual walkthrough on production: all user journeys from PRD §3.2 (purchase, quote, reorder, admin ops). Verify: HTTPS, cookies, WhatsApp links, Pixel events (Facebook Events Manager), all 3 locales, order + quote full lifecycle.                                                                                                                                                                                                                                                                                                                                                                                                 | test   | QA    | P0       | M5-T16         | 4h  |

### M5 Acceptance Criteria

- [ ] Landing page: all 9 sections, animations, responsive, RTL, 3 locales
- [ ] LCP < 2.5s on mobile 4G
- [ ] WhatsApp templates work for all notification types in AR/FR/EN
- [ ] Meta Pixel fires all 6 events with correct parameters
- [ ] All edge cases from PRD §16 handled (stock, cart, checkout, SSO, quotes, reorder)
- [ ] E2E: 5 critical paths pass in Playwright (AR + FR)
- [ ] WCAG 2.1 AA compliance on all public pages
- [ ] All pages render correctly in AR (RTL), FR, EN
- [ ] SEO: sitemaps, hreflang, meta tags, JSON-LD
- [ ] Security: CORS, Helmet, rate limiting, no IDOR, no leaked secrets
- [ ] Deployment: Nginx, PM2, backup cron, SSL configured
- [ ] Production smoke test passes all 4 user journeys

---

## Summary: Task Counts by Role

```
  ┌───────────────────────────────────────────────────┐
  │           TASK DISTRIBUTION BY ROLE                │
  │                                                   │
  │  Backend Developer (BE)     │████████████████│ 28  │
  │  Frontend Developer (FE)   │███████████████│ 26   │
  │  UI/UX Designer (UX)       │██████│ 8              │
  │  QA Tester (QA)            │████████████│ 14       │
  │                                                   │
  │           TASK DISTRIBUTION BY TYPE               │
  │                                                   │
  │  Plan                      │██│ 2                  │
  │  Build                     │█████████████████│ 48  │
  │  Test                      │█████████│ 16          │
  │  Review                    │██████│ 10             │
  │                                                   │
  │  TOTAL TASKS: 76                                  │
  └───────────────────────────────────────────────────┘
```

### By Milestone

| Milestone                     | Plan  | Build  | Test   | Review | Total  |
| ----------------------------- | ----- | ------ | ------ | ------ | ------ |
| M0: Foundation                | 0     | 7      | 0      | 1      | 8      |
| M1: Auth & Core               | 1     | 7      | 2      | 1      | 11     |
| M2: Catalog & Cart            | 0     | 13     | 2      | 1      | 16     |
| M3: Checkout, Orders & Quotes | 0     | 10     | 3      | 2      | 15     |
| M4: Admin CRM                 | 0     | 14     | 2      | 2      | 18     |
| M5: Polish & Launch           | 1     | 8      | 5      | 4      | 18     |
| **Total**                     | **2** | **59** | **14** | **11** | **86** |

---

## NOT in Scope (Explicitly Deferred)

| Item                                 | Rationale                                                                       | Reference         |
| ------------------------------------ | ------------------------------------------------------------------------------- | ----------------- |
| S3 image storage                     | VPS with local filesystem is sufficient for MVP. Migrate when containerizing.   | TODO-001          |
| WhatsApp Business API (automated)    | Manual wa.me links sufficient for < 50 orders/day.                              | TODO-002          |
| Email notifications                  | WhatsApp is primary channel. Email deferred.                                    | TODO-003          |
| Meta Conversions API (CAPI)          | Client-side Pixel sufficient for launch. Server-side tracking is Phase 2.       | TODO-004          |
| CI/CD pipeline                       | Manual deployment acceptable for initial launch. Priority P1 post-launch.       | TODO-005          |
| Kanban drag-and-drop optimization    | Basic kanban sufficient. Polish later.                                          | TODO-006          |
| 4-role RBAC (vs 2-role)              | Building full 4-role system per PRD. See TODO-007 for potential simplification. | TODO-007          |
| Product reviews/ratings              | Phase 2.                                                                        | PRD §24           |
| "Customers also bought"              | Phase 2.                                                                        | PRD §24           |
| SMS notifications                    | Phase 2.                                                                        | PRD §24           |
| Advanced reporting & analytics       | Phase 2.                                                                        | PRD §24           |
| Customer duplicate merge             | Phase 2.                                                                        | PRD §15.5         |
| Admin mobile companion app           | Phase 2.                                                                        | PRD §24           |
| Product categories (hierarchical)    | Flat list for MVP (< 10 products).                                              | PRD §23           |
| Stock reservation timeout (48h auto) | Flag for review, don't auto-cancel.                                             | PRD §23           |
| Admin-editable WhatsApp templates    | Hardcoded templates for MVP. Admin editing Phase 2.                             | PRD §13           |
| "Notify me when in stock" (PDP)      | Just WhatsApp CTA for now. Phone capture Phase 2.                               | UX Blueprint §4.3 |

---

## What Already Exists

| Item         | Status                                                                     |
| ------------ | -------------------------------------------------------------------------- |
| Source code  | **Nothing** — only first commit with documentation                         |
| PRD          | Complete — all user stories, routes, edge cases, data model                |
| SRD          | Complete — NestJS + Next.js conventions, module structure                  |
| TDD          | Complete — Prisma schema, API endpoints, critical flows, auth architecture |
| UX Blueprint | Complete — design tokens, all page layouts, component specs, RTL rules     |
| TODOS.md     | 7 deferred items documented                                                |

All documentation is thorough and aligned. The plan reuses these specs directly rather than re-specifying.

---

## Critical Path

```
  M0-T07 (Prisma) ──► M1-T03 (FB Auth) ──► M2-T01 (Products) ──► M3-T01 (Checkout) ──► M5-T12 (E2E)
       │                    │                     │                      │
       │                    ▼                     ▼                      ▼
       │              M1-T04 (Admin Auth)   M2-T02 (Cart)          M3-T03 (Quotes)
       │                    │                     │                      │
       │                    ▼                     ▼                      ▼
       │              M1-T05 (Guards)       M2-T11 (PLP)           M4-T01 (Dashboard)
       │                                        │
       │                                        ▼
       │                                   M2-T12 (PDP)
       │                                        │
       │                                        ▼
       └──────────────────────────────────M2-T13 (Cart Page)
```

**Longest path:** Prisma → Auth → Products API → Cart API → Checkout → Orders → Admin → E2E → Launch
**Parallel tracks:** Frontend pages can start as soon as API endpoints are available. UI/UX review runs parallel to QA testing.

---

## Risk Mitigation

| Risk                           | Likelihood | Impact | Mitigation                                                         |
| ------------------------------ | ---------- | ------ | ------------------------------------------------------------------ |
| Facebook App Review delays     | Medium     | High   | Apply for review in M1. Have fallback error page.                  |
| RTL rendering bugs             | Medium     | Medium | Dedicated RTL audit in M5-T07. Test on real Arabic-locale devices. |
| Stock race condition           | Medium     | High   | SELECT FOR UPDATE in transaction. Dedicated test case.             |
| Performance on low-end devices | Low        | Medium | `prefers-reduced-motion`, LCP monitoring, image optimization.      |
| COD fraud                      | Medium     | Medium | Rate limit (3 pending/user), admin flagging.                       |
| Scope creep                    | High       | High   | Strict "NOT in scope" list. All Phase 2 items deferred.            |

---

## Review Amendments (2026-03-25)

Decisions made during engineering review. These override the original plan where they conflict.

### Architecture Decisions

| #   | Issue                 | Decision                                                                                                                                                                               | Impact                 |
| --- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Auth module coupling  | **Split into `auth/` (Facebook OAuth) + `admin-auth/` (email/password)**. Shared JWT utility in `common/`. Updates M1-T03 and M1-T04 to be fully independent modules.                  | M1-T03, M1-T04, M1-T05 |
| 2   | Cart merge timing     | **Auto-merge on cart page load** when authenticated + localStorage has items. Not just on OAuth callback. Single codepath covers both fresh-login and returning-user cases.            | M2-T14                 |
| 3   | Dashboard KPI queries | **4 separate queries via `Promise.all` with independent caching** (60s TTL each). Replaces single monolithic CTE. Partial failure doesn't block dashboard.                             | M4-T01                 |
| 4   | Image processing      | **Process on upload with sharp** — generate 3 WebP variants (thumbnail 200px, medium 600px, full 1200px) on admin upload. Serve pre-optimized via Nginx.                               | M2-T01                 |
| 5   | API versioning        | **Use NestJS URI versioning** — `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })` in `main.ts`. Not hardcoded in controllers.                                  | M0-T02                 |
| 6   | Shared types strategy | **Derive from Prisma, re-export in `packages/shared-types`**. Enums re-exported from Prisma client. shared-types adds only API DTOs (request/response shapes). Single source of truth. | M0-T05                 |

### Code Quality Fixes

| #   | Issue                    | Fix                                                                                                                                                                         | Impact                 |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 7   | WhatsApp template DRY    | **Shared template utility in `packages/shared-types`** — template definitions + interpolation function. Both API and frontends import same utility.                         | M5-T03, M5-T04, M0-T05 |
| 8   | Order ref race condition | **Use PostgreSQL `SEQUENCE`** for ORD-XXXX and QT-XXXX ref generation. Replace `SELECT MAX(ref) + 1` with `nextval('order_ref_seq')`.                                       | M3-T01, M3-T03         |
| 9   | Error response format    | **Standardized error envelope**: `{ statusCode, error, message, details? }` where `details` is structured (e.g., stock conflict items). Defined in global exception filter. | M1-T07                 |

### Test Additions

| #   | Test                                                                                                                                        | Milestone       | Est |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --- |
| 10a | **Checkout race condition e2e** — two concurrent `POST /customer/orders` for last-1 stock → one 201, one 409. Verify stock integrity after. | M3-T06 (extend) | +1h |
| 10b | **Sharp image processing unit test** — verify upload generates 3 WebP variants at correct dimensions. Test invalid file type rejection.     | M2-T04 (extend) | +1h |
| 10c | **Reorder e2e** — reorder with full stock, partial OOS, all OOS, price changed. Verify cart state after each.                               | M3-T06 (extend) | +2h |

### Performance Fixes

| #   | Issue              | Fix                                                                                                                                   | Impact                 |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 11  | N+1 on admin lists | **Use Prisma `include` with `select`** on all list endpoints — eager-load related data (user name/phone, item count) in single query. | M4-T02, M4-T03, M4-T04 |
| 12  | Search debouncing  | **300ms debounce** on all admin search inputs (customers, orders, quotes). Spec explicitly in frontend tasks.                         | M4-T11, M4-T12, M4-T13 |

### Failure Modes

| Codepath                     | Failure Mode                    | Test Covers? | Error Handling?                    | Silent?                    | Status                                 |
| ---------------------------- | ------------------------------- | ------------ | ---------------------------------- | -------------------------- | -------------------------------------- |
| Checkout (concurrent)        | Race condition on last stock    | Yes (10a)    | Yes (409 + rollback)               | No                         | OK                                     |
| Cart merge                   | OOS item during merge           | Yes (M2-T04) | Yes (skip + toast)                 | No                         | OK                                     |
| Order cancel + stock restore | Transaction failure mid-restore | Yes (M3-T05) | Yes (rollback)                     | No                         | OK                                     |
| Image upload                 | Sharp crashes on corrupt file   | Yes (10b)    | Needs explicit try/catch           | Would be 500               | **Add error handling in M2-T01**       |
| Facebook API down            | OAuth callback timeout          | Yes (M1-T10) | Yes (error page)                   | No                         | OK                                     |
| Admin session expiry         | JWT expired mid-action          | No           | Needs 401 → redirect to login      | Would show raw error       | **Add interceptor in M4-T07**          |
| Quote duplicate              | Same data within 5 min          | Yes (M3-T05) | Yes (return existing)              | No                         | OK                                     |
| Dashboard KPI query timeout  | One of 4 queries slow           | No           | Needs per-query timeout + fallback | Would block partial render | **Add 5s timeout per query in M4-T01** |

**Critical gaps flagged:** 3 items need explicit error handling added (sharp crash, admin session expiry redirect, dashboard query timeout). These are noted above and should be addressed during their respective milestone builds.

---

## Updated Task Count (Post-Review)

| Category  | Original | Added            | Final              |
| --------- | -------- | ---------------- | ------------------ |
| Plan      | 2        | 0                | 2                  |
| Build     | 59       | +1 (CI)          | 60                 |
| Test      | 14       | +3 (extended)    | 14 (+4h)           |
| Review    | 11       | 0                | 11                 |
| **Total** | **86**   | **+4 additions** | **86 tasks (+7h)** |

---

## Unresolved Decisions

No unresolved decisions. All review issues addressed:

- Architecture: 6 decisions (6 user-confirmed + 1 obvious fix applied)
- Code Quality: 3 decisions (1 user-confirmed + 2 obvious fixes applied)
- Test: 3 targeted tests added per user decision
- Performance: 2 obvious fixes applied
- TODOS.md: 1 item added (monitoring TODO-008, P1)

---

## Completion Summary

- Step 0: Scope Challenge (user chose: **BIG CHANGE** — full platform build, all 86 tasks across 5 milestones)
- Architecture Review: **6 issues found** (5 user decisions + 1 obvious fix)
- Code Quality Review: **3 issues found** (1 user decision + 2 obvious fixes)
- Test Review: **diagram produced, 6 gaps identified, 3 critical tests added**
- Performance Review: **2 issues found** (both obvious fixes)
- NOT in scope: **written** (17 items explicitly deferred)
- What already exists: **written** (only documentation, no code)
- TODOS.md updates: **1 item proposed** (monitoring — user approved)
- Failure modes: **3 critical gaps flagged** (sharp crash, admin session expiry, dashboard timeout — all noted for implementation)
