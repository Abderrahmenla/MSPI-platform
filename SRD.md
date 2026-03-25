# MSPI Platform — Software Requirements Document (SRD)

## 1. Purpose

This document specifies **software structure, libraries, and engineering practices** for the **Next.js** applications (`apps/web`, `apps/admin`) and the **NestJS** API (`apps/api`) in the MSPI monorepo. It complements the product scope in [PRD.md](./PRD.md).

**Stack decisions called out here**

| Concern | Choice |
|--------|--------|
| Data fetching / cache | **TanStack Query** (`@tanstack/react-query`) — not ad-hoc `useEffect` fetches |
| Component library | **shadcn/ui** (Radix UI primitives + Tailwind) |
| Advanced animation | **Framer Motion** — orchestrated marketing/landing motion; see **§8.4** |
| Forms | **react-hook-form** + **Yup** (`@hookform/resolvers/yup`) |
| Styling | **Tailwind CSS** + `cn()` (clsx + tailwind-merge) |
| i18n (web) | **next-intl** with `[locale]` segment |

TanStack Query is the maintained name for what was historically called “React Query”; all new code MUST import from `@tanstack/react-query`.

---

## 2. Scope

- **Next.js:** `apps/web` and `apps/admin` — structure and practices in **§§4–16** (repository layout through testing).
- **NestJS:** `apps/api` — structure and practices in **§3** (aligned with [NestJS documentation](https://docs.nestjs.com/)).
- Domain-level OpenAPI and migration detail may still live in a separate TDD; this SRD defines **repository layout and engineering norms** for all three apps.

---

## 3. NestJS API (`apps/api`)

This section standardizes the **NestJS** service that backs the storefront, quotes, Facebook OAuth flows, and the admin CRM. It follows Nest’s **modular architecture** (feature modules with clear boundaries, dependency injection, thin controllers) as described in the official [Modules](https://docs.nestjs.com/modules) and [First steps](https://docs.nestjs.com/first-steps) guides, and common production patterns (feature-based folders, shared `common/` + `config/`, validation, security).

### 3.1 Official references (required reading)

| Topic | NestJS docs |
|--------|----------------|
| Philosophy & CLI | [Introduction](https://docs.nestjs.com/), [First steps](https://docs.nestjs.com/first-steps) |
| Modules & providers | [Modules](https://docs.nestjs.com/modules), [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) |
| HTTP layer | [Controllers](https://docs.nestjs.com/controllers), [Middleware](https://docs.nestjs.com/middleware) |
| Validation | [Validation](https://docs.nestjs.com/techniques/validation), [Pipes](https://docs.nestjs.com/pipes) |
| Configuration | [Configuration](https://docs.nestjs.com/techniques/configuration) |
| Security | [Authentication](https://docs.nestjs.com/security/authentication), [Guards](https://docs.nestjs.com/guards), [Exception filters](https://docs.nestjs.com/exception-filters) |
| Database | [Database](https://docs.nestjs.com/techniques/database) (Prisma/TypeORM per TDD) |
| API docs | [OpenAPI (Swagger)](https://docs.nestjs.com/openapi/introduction) |
| Versioning | [Versioning](https://docs.nestjs.com/techniques/versioning) |
| Background jobs (optional) | [Queues (Bull)](https://docs.nestjs.com/techniques/queues) |

### 3.2 Recommended top-level layout (`apps/api/src`)

Scaffold with **`nest new`** or the monorepo equivalent; keep **one feature per domain folder** so a module can be understood or removed without tangling the rest of the app (feature-based organization avoids a “flat” global pile of controllers/services).

```text
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts              # optional health/root
│   ├── config/                          # configuration factories (see §3.5)
│   │   ├── env.validation.ts            # Joi/Zod/class-validator for env
│   │   └── app-config.module.ts         # wraps ConfigModule if split
│   ├── common/                          # cross-cutting, reusable across features
│   │   ├── decorators/
│   │   ├── filters/                     # global HTTP exception filter
│   │   ├── guards/                      # JwtAuthGuard, RolesGuard, FacebookSessionGuard, etc.
│   │   ├── interceptors/                # logging, transform response (optional)
│   │   ├── pipes/                       # rarely; prefer ValidationPipe global
│   │   └── utils/
│   ├── database/                        # ORM module, PrismaService or TypeORM DataSource
│   │   └── prisma.module.ts             # example; exact file names per ORM choice
│   └── modules/                         # domain features (see §3.3)
│       ├── auth/
│       ├── users/
│       ├── products/
│       ├── orders/
│       ├── quotes/
│       ├── admin-auth/
│       └── health/
├── test/                                # e2e (Jest + supertest)
├── prisma/                              # if using Prisma: schema.prisma, migrations
└── tsconfig*.json
```

- **`common/`** holds **framework-level** building blocks (guards, filters, decorators), not business rules.  
- **`modules/`** holds **bounded contexts** aligned with [PRD](./PRD.md): orders, quotes, catalog, customers, admin users, auth.  
- **`config/`** centralizes typed configuration using Nest’s [ConfigModule](https://docs.nestjs.com/techniques/configuration).

### 3.3 Feature module anatomy (per domain)

Each folder under `src/modules/<name>/` should be **self-contained** and export a single Nest **`*.module.ts`**. Typical layout (names illustrative):

```text
modules/orders/
├── orders.module.ts
├── orders.controller.ts                 # HTTP: routes, status codes, DTO mapping only
├── orders.service.ts                    # business rules, transactions
├── orders.repository.ts                 # optional: isolate DB access from service
├── dto/
│   ├── create-order.dto.ts
│   └── update-order-status.dto.ts
├── entities/                            # TypeORM entities OR Prisma-return types mapped here
└── __tests__/
    └── orders.service.spec.ts
```

**Rules**

- **Thin controllers:** validate input via DTOs + `ValidationPipe`, call **one** service method, return DTOs or mapped entities — no business logic in controllers (see [Controllers](https://docs.nestjs.com/controllers)).  
- **Services** own use cases and orchestrate repositories and other modules.  
- **Repository pattern (recommended):** persistence in dedicated classes or Prisma delegates behind an interface for testability.  
- **DTOs:** `class-validator` + `class-transformer` on all inputs; align shapes with OpenAPI decorators if Swagger is enabled.  
- **No circular imports:** if two domains need each other, extract shared contracts to a small `modules/shared/` or use **forwardRef** only as a last resort ([Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency)).

### 3.4 MSPI domain modules (mapping)

| Module | Responsibility |
|--------|----------------|
| `auth` | Facebook OAuth callback handling, session/JWT issuance for **customers** (as per PRD) |
| `users` | Customer profile (facebook_id, name, phone), linked to orders/quotes |
| `products` | Catalog read for web; stock and price updates for admin |
| `orders` | COD orders, line items, status transitions, notes |
| `quotes` | Quote submissions, pipeline status, WhatsApp payload storage |
| `admin-auth` | Admin login (email/password), JWT or secure cookie for **admin** routes |
| `admins` / `admin-users` | Staff CRUD if separated from `admin-auth` |
| `health` | Liveness/readiness for orchestration ([Health checks](https://docs.nestjs.com/recipes/health-checks)) |

Admin-only routes use **different** guards/strategies than customer routes so Facebook and admin credentials never share the same guard by mistake.

### 3.5 Configuration and environment

- Use **`@nestjs/config`** with **validated** environment variables (Joi schema, or `zod` in a small factory) loaded at bootstrap — see [Configuration](https://docs.nestjs.com/techniques/configuration).  
- **Never** commit `.env`; document required keys in README/TDD (`DATABASE_URL`, Facebook app secrets, JWT secrets, `CORS_ORIGINS`, etc.).  
- Use **`ConfigService`** injection in services instead of `process.env` scattered across files.

### 3.6 Validation, serialization, and API contract

- Register a **global `ValidationPipe`** with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true` ([Validation](https://docs.nestjs.com/techniques/validation)).  
- Prefer **explicit DTOs** for every body/query/param.  
- Enable **Swagger** (`@nestjs/swagger`) for internal and frontend contract alignment ([OpenAPI](https://docs.nestjs.com/openapi/introduction)).  
- Optional: **URI versioning** (`v1`) via Nest [Versioning](https://docs.nestjs.com/techniques/versioning) if mobile or third parties consume the API later.

### 3.7 Security and resilience

- **Helmet**, **CORS** restricted to `web` and `admin` origins, **rate limiting** (`@nestjs/throttler`) on auth and public POST endpoints.  
- **Guards** for route protection; **Passport** strategies for Facebook and admin JWT as per [Authentication](https://docs.nestjs.com/security/authentication).  
- **Consistent errors:** global exception filter mapping domain errors to HTTP codes without leaking stack traces in production.  
- **Idempotency** for sensitive writes (orders) if retries exist — design in TDD.

### 3.8 Logging and observability

- Use Nest **`Logger`** or a structured logger (e.g. Pino) via a injectable `LoggerService` in `common/`.  
- Request correlation IDs via interceptor (optional) for tracing.  
- Integrate **Sentry** or similar at application bootstrap if required by PRD NFRs.

### 3.9 Testing

- **Unit tests:** services and repositories with mocked dependencies (`@nestjs/testing`).  
- **E2E tests:** `test/app.e2e-spec.ts` hitting HTTP with **supertest**; spin up app with test DB or containers ([Testing](https://docs.nestjs.com/fundamentals/testing)).  
- Contract tests against OpenAPI schema optional in CI.

### 3.10 Optional: queues and async work

- Use **Bull / BullMQ** via `@nestjs/bull` for emails, Pixel forwarding, or heavy jobs only when needed ([Queues](https://docs.nestjs.com/techniques/queues)). Do not introduce queues without a clear operational requirement.

### 3.11 Naming and style (Nest conventions)

- **kebab-case** file names where the CLI generates them (`orders.controller.ts`); **PascalCase** class names (`OrdersService`).  
- **One module per domain**; **singular** feature folder names (`orders`, `quotes`) are common in Nest samples.  
- **Barrel `index.ts`:** optional; Nest CLI does not require them — use if team standardizes exports without creating circular imports.

---

## 4. Repository layout (per Next.js app)

Each app follows the same skeleton:

```text
apps/<web|admin>/
├── public/                    # Static assets (favicon, icons, brand copies)
├── src/
│   ├── app/                   # Next.js App Router — routes, layouts, pages only
│   └── modules/               # Feature modules + core (all application logic)
├── commitlint.config.js
├── .lintstagedrc.js
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json              # paths: "@/*" -> "./src/*"
└── next.config.ts / .mjs
```

**Root of monorepo** may additionally hold shared `packages/*` (ESLint config, TypeScript base, UI tokens); apps extend those via `extends` in `tsconfig` / ESLint where applicable.

---

## 5. App Router (`src/app/`)

### 5.1 Root layout

- **`src/app/layout.tsx`** — Only if a **single** root is required; with **next-intl**, the usual pattern is `src/app/[locale]/layout.tsx` as the locale-aware root (fonts, global providers: TanStack Query, next-intl, theme).
- Providers that require `"use client"` live in small client wrappers under `src/modules/core/providers/` (e.g. `query-client.provider.tsx`).

### 5.2 Route groups (MSPI mapping)

Use **parentheses** for logical grouping without affecting the URL.

Recommended shape for **`apps/web`** (adjust segment names to match final URL strategy):

| Route group | Role | Examples |
|-------------|------|----------|
| `(public)` | Marketing, catalog, cart, legal | Home, PLP, PDP, cart, FAQ, terms |
| `(protected)` | Requires Facebook session | Checkout submit flow, `/devis` quote submit |
| `(auth)` (optional) | OAuth callback handling | Facebook redirect URI handler |

For **`apps/admin`**:

| Route group | Role | Examples |
|-------------|------|----------|
| `(public)` | Login, forgot password (if any) | `/login` |
| `(app)` | Authenticated CRM shell | Dashboard, orders, quotes, customers, inventory, settings |

**Nested layouts:** each group may have its own `layout.tsx` (e.g. marketing header/footer in `(public)`; CRM sidebar in `(app)`).

### 5.3 Locale prefix

- **`src/app/[locale]/...`** — Required for `web` with next-intl (`ar` default, `fr`, `en`).
- **Admin** may use a single default UI language first (`fr`/`en`) with `[locale]` optional in Phase 2; document the chosen URL pattern in the TDD.

### 5.4 Files vs. feature code

- **`src/app/**`** should remain **thin**: layouts, `page.tsx`, `loading.tsx`, `error.tsx`, route handlers (`route.ts`) when needed.
- **No business logic** in `app/` beyond composition; logic lives under `src/modules/<feature>/`.

---

## 6. Feature modules (`src/modules/<feature>/`)

Each feature uses a **consistent internal layout**:

| Folder | Role |
|--------|------|
| `api/` | Plain async functions calling the backend (`get-orders.ts`, `create-quote.ts`). Use a shared HTTP client from `core` (`axios` or `fetch` wrapper). Typed return values. |
| `hooks/` | TanStack Query hooks: `use-query`, `use-mutation`, query key factories. Optional subfolders `use-<name>/` with `index.ts` + prefetch helpers for SSR. |
| `components/` | Presentational UI; **shadcn/ui** primitives composed here. Optional `index.ts` barrel exports. |
| `containers/` | `"use client"` where needed; wire hooks + components; no raw fetch in JSX. |
| `widgets/` | Large blocks (e.g. `marketing-header.tsx`, `admin-sidebar.tsx`, `order-detail-panel.tsx`). |
| `types/` | `*.types.ts` |
| `constants/` | `*-query-keys.constants.ts`, `routes-map.constants.ts`, feature flags. |
| `schemas/` | Yup schemas: `*.schema.ts` for forms (aligned with `@hookform/resolvers/yup`). |
| `utils/` | Pure helpers (formatters, mappers). |
| `context/` | React context definitions when needed. |
| `providers/` | Feature-scoped providers if not global. |

### 6.1 Shared core (`src/modules/core/`)

Cross-cutting code lives only in **`core`**:

- `components/` — primitives wrappers around shadcn (e.g. `button`, `input` re-exports).
- `hooks/` — `use-media-query`, `use-debounce`, etc.
- `providers/` — `query-client.provider.tsx`, theme if needed.
- `services/` — `axios.service.ts` (or `http.service.ts`), `query-client.service.ts` (factory for QueryClient).
- `theme/` — brand tokens mapping to CSS variables (`#ec4130` scale, gradients).
- `lib/` — `cn.ts` (clsx + tailwind-merge), shared types.
- `constants/` — `routes-map.constants.ts` (all internal paths; use in `Link` and redirects).
- `styles/` — global CSS entry if Tailwind layers need overrides.

**Barrels:** export public APIs via `index.ts` at folder boundaries so consumers import `@/modules/<feature>/components` instead of deep file paths.

---

## 7. TanStack Query (mandatory patterns)

### 7.1 Setup

- Wrap the app in **`QueryClientProvider`** from `@tanstack/react-query` in a client provider under `core/providers`.
- Use a **stable QueryClient** instance per client app (create in a client component or `useState` once).
- **Devtools:** `@tanstack/react-query-devtools` in development only.

### 7.2 Query keys

- **Centralize** in `*-query-keys.constants.ts` (factory functions or const objects).
- **Never** inline string keys in components; hooks must import factories.

Example pattern:

```ts
export const OrderQueryKeys = {
  all: ['orders'] as const,
  list: (filters: OrderFilters) => [...OrderQueryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...OrderQueryKeys.all, 'detail', id] as const,
};
```

### 7.3 Hooks

- **`useQuery` / `useMutation`** live next to the feature they call; they call **only** `api/` functions.
- Mutations must **`invalidateQueries`** for affected lists after success.
- **Server Components:** prefetch with `queryClient.prefetchQuery` in RSC where appropriate; dehydrate with `@tanstack/react-query` integration for Next.js App Router (see TanStack docs for current `getQueryClient` pattern).

### 7.4 Error and loading UI

- Prefer **React Query** states in containers + shadcn **Skeleton** / **Alert** for UX; route-level `error.tsx` for unexpected failures.

---

## 8. shadcn/ui and motion

### 8.1 Components

- Install shadcn components **per app** (`apps/web`, `apps/admin`) into `src/modules/core/components/ui/` (or the path the shadcn CLI uses; keep consistent across apps).
- Compose higher-level primitives in `core/components` or feature `components/`.
- Use **Radix** primitives only through shadcn or documented exceptions.

### 8.2 Theming

- Map **PRD** brand colors (`#ec4130` scale, gradients) into **CSS variables** in `globals.css` / Tailwind theme extension so shadcn components pick up primary/secondary/destructive.
- **Admin:** density and focus on tables (shadcn `Table`, `DataTable` patterns); keep motion minimal (see **§8.4**).

### 8.3 Forms

- **react-hook-form** + **Yup** resolver + shadcn `Form`, `Input`, `Select`, `Textarea`, `Checkbox`.
- **Zod** is **not** required for MSPI if Yup is standard; do not mix validators in the same form without reason.

### 8.4 Advanced animation (Framer Motion)

- **Framer Motion** is the **standard library for advanced animations** on the **marketing storefront** (`apps/web`): hero sequences, section reveals, staggered grids, page transitions, and other orchestrated motion described in the PRD.
- Implement in **`"use client"`** components (containers, widgets, or dedicated `motion-*` wrappers under `components/` / `widgets/`).
- **Coexistence:** use **CSS** (Tailwind transitions) for small micro-interactions when sufficient; use **Framer Motion** when you need springs, layout animations, `AnimatePresence`, shared layouts, or scroll-linked choreography.
- **Accessibility:** always respect **`prefers-reduced-motion`** — gate or strip Framer-driven animation when the user requests reduced motion (match PRD motion guardrails).
- **`apps/admin`:** default to **no** Framer on dense CRM screens; static or subtle CSS only unless a documented exception requires one isolated motion pattern.

---

## 9. API layer

- All network calls go through **`api/`** modules using **one** `axios` instance (or fetch wrapper) from `core/services`:
  - Base URL from `process.env.NEXT_PUBLIC_API_URL` (or server-only env for server components).
  - Attach **Authorization** for admin JWT when applicable.
  - **No** direct `axios.get` from `components/` or `containers/` except via `api/` + hooks.

---

## 10. Path aliases

- **`tsconfig.json`:** `"@/*": ["./src/*"]`.
- Imports: `@/modules/core/lib/cn`, `@/modules/orders/api/get-orders`, etc.

---

## 11. Naming conventions

### 11.1 Files

- **kebab-case:** `job-analyzer-result.tsx`, `get-job-description.ts`, `orders-query-keys.constants.ts`.

### 11.2 Suffixes

- Types: `*.types.ts`
- Constants: `*.constants.ts`
- Schemas: `*.schema.ts`
- Hooks: `use-<action>.ts` or `use-<name>/index.ts`

---

## 12. Routing map

- Maintain a single **`ROUTES_MAP`** (or `ROUTES`) in `src/modules/core/constants/routes-map.constants.ts` for each app.
- **Web:** include **locale** parameter in builders, e.g. `href(\`/\\${locale}/checkout\`)` — avoid hardcoded path strings in feature code.
- **Admin:** paths like `/orders`, `/quotes/:id` without locale until i18n is added.

---

## 13. Code quality tooling

| Tool | Purpose |
|------|---------|
| **ESLint** | `eslint-config-next`, TypeScript, Prettier integration, `@tanstack/eslint-plugin-query` |
| **Prettier** | `prettier-plugin-tailwindcss`, print width **80**, `trailingComma: 'all'`, 2 spaces |
| **Husky** | Git hooks (e.g. `pre-commit`) |
| **lint-staged** | ESLint + Prettier on staged files (`.lintstagedrc.js`) |
| **Commitlint** | Conventional commits (`@commitlint/config-conventional`) |

Strict rules: no unused vars (with `_` prefix exceptions), no duplicate imports, sort imports if using a plugin.

---

## 14. Styling

- **Tailwind** for utilities; **`cn()`** from `@/modules/core/lib/cn` for conditional classes.
- **Gradients** per PRD; ensure text contrast on gradient backgrounds.
- **Advanced motion** on `apps/web` per **§8.4** (Framer Motion), aligned with PRD performance and reduced-motion rules.

---

## 15. Security (frontend)

- **Never** expose admin secrets in `NEXT_PUBLIC_*`.
- **HTTP-only cookies** for sessions when API uses cookie auth; prefer `serverActions` or server-side proxy for sensitive operations when applicable.
- **CSP** and **headers** (TDD).

---

## 16. Testing (recommended)

- Unit: Vitest or Jest for `utils`, `schemas`.
- Component: Testing Library + MSW for API mocks.
- E2E: Playwright for checkout and admin critical paths (separate test plan).

---

## 17. Summary

| Topic | Requirement |
|-------|-------------|
| **Nest API** | Feature modules under `src/modules/*`; `common/` + `config/` + `database/`; thin controllers, DTOs + global `ValidationPipe`, ConfigModule, guards per surface (customer vs admin); Swagger optional; see **§3** |
| **Next.js router** | `src/app/` with route groups `(public)` / `(protected)` or `(app)`; `[locale]` on web |
| **Next.js features** | `src/modules/<feature>/` with `api`, `hooks`, `components`, `containers`, `widgets`, `types`, `constants`, `schemas`, `utils`, `context`, `providers` |
| **Next.js shared** | `src/modules/core/` |
| **Data (frontend)** | TanStack Query everywhere; keys in constants |
| **UI** | shadcn/ui + Tailwind + `cn()`; **Framer Motion** for advanced animation on `web` (**§8.4**) |
| **Forms** | react-hook-form + Yup |
| **Imports** | `@/*` alias; barrel exports (Next); Nest uses path aliases per `tsconfig` in `apps/api` |
| **Quality** | ESLint, Prettier, Husky, lint-staged, Commitlint (monorepo-wide where applicable) |

---

## 18. References

### Product

- [PRD.md](./PRD.md) — product scope, CRM modules, brand colors.

### Next.js (frontend)

- TanStack Query: https://tanstack.com/query  
- shadcn/ui: https://ui.shadcn.com  
- Framer Motion: https://motion.dev/docs  
- next-intl: https://next-intl-docs.vercel.app  

### NestJS (official documentation)

- NestJS home: https://docs.nestjs.com/  
- First steps: https://docs.nestjs.com/first-steps  
- Modules: https://docs.nestjs.com/modules  
- Controllers: https://docs.nestjs.com/controllers  
- Providers & DI: https://docs.nestjs.com/providers  
- Pipes: https://docs.nestjs.com/pipes  
- Guards: https://docs.nestjs.com/guards  
- Exception filters: https://docs.nestjs.com/exception-filters  
- Configuration: https://docs.nestjs.com/techniques/configuration  
- Validation: https://docs.nestjs.com/techniques/validation  
- Database: https://docs.nestjs.com/techniques/database  
- Authentication (Passport): https://docs.nestjs.com/security/authentication  
- OpenAPI (Swagger): https://docs.nestjs.com/openapi/introduction  
- Versioning: https://docs.nestjs.com/techniques/versioning  
- Testing: https://docs.nestjs.com/fundamentals/testing  
- Health checks: https://docs.nestjs.com/recipes/health-checks  
- Queues (Bull): https://docs.nestjs.com/techniques/queues  
