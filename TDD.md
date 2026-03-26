# MSPI Platform — Technical Design Document (TDD)

## Document control

| Field            | Value                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Product**      | MSPI Fire Safety Ecommerce & Quote Platform                                           |
| **Version**      | 1.0                                                                                   |
| **Related docs** | [PRD.md](./PRD.md) (product requirements), [SRD.md](./SRD.md) (software requirements) |
| **Last updated** | 2026-03-25                                                                            |

---

## 1. Architecture overview

### 1.1 System diagram

```
                    ┌─────────────────────────┐
                    │     Reverse Proxy        │
                    │   (Nginx / Caddy)        │
                    └────┬──────────┬─────────┘
                         │          │
            ┌────────────┘          └────────────┐
            ▼                                    ▼
  ┌──────────────────┐              ┌──────────────────┐
  │   apps/web       │              │   apps/admin     │
  │   Next.js 15     │              │   Next.js 15     │
  │   Port: 3000     │              │   Port: 3001     │
  │                  │              │                  │
  │ i18n: ar/fr/en   │              │ Single lang: fr  │
  │ SSR + CSR        │              │ CSR-heavy        │
  └────────┬─────────┘              └────────┬─────────┘
           │                                 │
           │  HTTPS                          │
           └──────────┬──────────────────────┘
                      ▼
  ┌──────────────────────────────────────────────────────┐
  │              apps/api (NestJS)                        │
  │              Port: 4000                               │
  │                                                      │
  │  Namespaces:                                         │
  │  /api/v1/          → public (products, auth, health) │
  │  /api/v1/customer/ → customer (FB JWT required)      │
  │  /api/v1/admin/    → admin (Admin JWT required)      │
  └──────────────────────┬───────────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────────┐
  │              PostgreSQL 16                            │
  │              Port: 5432                               │
  └──────────────────────────────────────────────────────┘

  File storage:   Local filesystem (/uploads/)
  External APIs:  Facebook OAuth, wa.me (client-side), Meta Pixel (client-side)
```

### 1.2 Deployment target

- **VPS** (single server): Nginx reverse proxy → 3 Node.js processes (web, admin, api) + PostgreSQL.
- Product images stored in `/uploads/` directory (persistent across deploys).
- Future migration path: S3-compatible storage when containerizing.

### 1.3 Monorepo structure

```
mspi-platform/
├── package.json                # root: pnpm workspace config
├── pnpm-workspace.yaml
├── turbo.json                  # build pipeline
├── .env.example                # environment variable template
├── PRD.md
├── SRD.md
├── TDD.md                     # this document
├── mspi-logo.png
│
├── apps/
│   ├── web/                   # Next.js 15 — storefront + customer account
│   │   ├── src/
│   │   │   ├── app/[locale]/  # App Router with i18n
│   │   │   │   ├── (public)/  # Landing, PLP, PDP, cart, FAQ
│   │   │   │   ├── (protected)/ # Checkout, /devis, /account/*
│   │   │   │   └── (auth)/    # Facebook OAuth callback
│   │   │   ├── modules/       # Feature modules (SRD §6)
│   │   │   └── lib/           # Utilities, API client
│   │   └── public/            # Static assets, logo
│   │
│   ├── admin/                 # Next.js 15 — admin CRM
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/  # /login
│   │   │   │   └── (app)/     # Dashboard, orders, quotes, etc.
│   │   │   ├── modules/
│   │   │   └── lib/
│   │   └── public/
│   │
│   └── api/                   # NestJS — backend API
│       ├── src/
│       │   ├── modules/       # Feature modules (§2 below)
│       │   ├── common/        # Guards, filters, interceptors, pipes
│       │   ├── config/        # ConfigModule setup
│       │   └── prisma/        # PrismaService, PrismaModule
│       ├── prisma/
│       │   └── schema.prisma  # Database schema (§3 below)
│       └── uploads/           # Product images (local storage)
│
├── packages/
│   ├── shared-types/          # TypeScript types shared across apps
│   │   ├── src/
│   │   │   ├── enums.ts       # OrderStatus, QuoteStatus, AdminRole, etc.
│   │   │   ├── dto/           # API response shapes
│   │   │   └── constants.ts   # WhatsApp templates, route maps
│   │   └── package.json
│   │
│   ├── ui/                    # Shared shadcn/ui components (if needed)
│   │   └── package.json
│   │
│   └── config/                # Shared ESLint, TypeScript, Prettier configs
│       ├── eslint.config.js
│       ├── tsconfig.base.json
│       └── package.json
│
└── docker-compose.yml         # Local dev: PostgreSQL
```

---

## 2. NestJS API modules

### 2.1 Module map

```
src/modules/
├── auth/                      # Facebook OAuth + Admin login
│   ├── controllers/
│   │   ├── facebook-auth.controller.ts    # POST /auth/facebook, GET /auth/facebook/callback
│   │   └── admin-auth.controller.ts       # POST /admin/auth/login, POST /admin/auth/logout
│   ├── strategies/
│   │   ├── facebook.strategy.ts           # Passport Facebook strategy
│   │   └── jwt.strategy.ts               # Passport JWT strategy (shared)
│   ├── guards/
│   │   ├── customer-auth.guard.ts         # Validates customer JWT
│   │   ├── admin-auth.guard.ts            # Validates admin JWT
│   │   └── roles.guard.ts                # RBAC: @Roles('manager', 'super_admin')
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/                     # Customer profiles + addresses
│   ├── controllers/
│   │   └── customer-profile.controller.ts # /customer/profile, /customer/addresses
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── dto/
│
├── products/                  # Catalog + images + stock
│   ├── controllers/
│   │   ├── public-products.controller.ts  # GET /products, GET /products/:slug
│   │   └── admin-products.controller.ts   # CRUD /admin/products/*, stock adjust, images
│   ├── products.service.ts
│   ├── stock.service.ts                   # Stock adjustments + history
│   └── dto/
│
├── carts/                     # Server-side cart + merge
│   ├── controllers/
│   │   └── customer-cart.controller.ts    # /customer/cart/*
│   ├── carts.service.ts                   # Merge logic, stock validation
│   └── dto/
│
├── orders/                    # Order lifecycle + checkout
│   ├── controllers/
│   │   ├── customer-orders.controller.ts  # /customer/orders/*
│   │   └── admin-orders.controller.ts     # /admin/orders/*
│   ├── orders.service.ts                  # Checkout, status transitions, reorder
│   ├── orders.constants.ts                # ORDER_TRANSITIONS map
│   └── dto/
│
├── quotes/                    # Quote pipeline
│   ├── controllers/
│   │   ├── customer-quotes.controller.ts  # /customer/quotes/*
│   │   └── admin-quotes.controller.ts     # /admin/quotes/*
│   ├── quotes.service.ts                  # Pipeline, convert-to-order
│   ├── quotes.constants.ts                # QUOTE_TRANSITIONS map
│   └── dto/
│
├── admin/                     # Dashboard, staff, settings, audit
│   ├── controllers/
│   │   ├── dashboard.controller.ts        # /admin/dashboard/*
│   │   ├── staff.controller.ts            # /admin/users/*
│   │   ├── settings.controller.ts         # /admin/settings/*
│   │   └── audit-log.controller.ts        # /admin/audit-log/*
│   ├── dashboard.service.ts               # KPI aggregation query
│   ├── audit.service.ts                   # Audit log writes
│   └── dto/
│
└── common/                    # Cross-cutting concerns
    ├── guards/                # Re-exported from auth for convenience
    ├── filters/
    │   └── global-exception.filter.ts     # Map domain errors → HTTP
    ├── interceptors/
    │   └── audit-log.interceptor.ts       # Auto-log admin mutations
    ├── pipes/
    │   └── uuid-validation.pipe.ts        # Validate UUID params
    └── decorators/
        ├── current-user.decorator.ts      # @CurrentUser() param decorator
        └── roles.decorator.ts             # @Roles('admin') decorator
```

### 2.2 Controller pattern (dual namespace)

Each domain module has 2 controllers (customer + admin) sharing 1 service:

```
  ┌────────────────────────┐    ┌────────────────────────┐
  │ CustomerOrdersCtrl     │    │ AdminOrdersCtrl        │
  │ @Controller('customer')│    │ @Controller('admin')   │
  │ @UseGuards(CustGuard)  │    │ @UseGuards(AdminGuard) │
  │                        │    │                        │
  │ GET /customer/orders   │    │ GET /admin/orders      │
  │   → own orders only    │    │   → all orders         │
  │ GET /customer/orders/:u│    │ PATCH /admin/orders/:u │
  │   → own order detail   │    │   → change status      │
  └────────┬───────────────┘    └────────┬───────────────┘
           │                             │
           └──────────┬──────────────────┘
                      ▼
           ┌──────────────────┐
           │  OrdersService   │
           │  (shared logic)  │
           │                  │
           │  findForUser()   │
           │  findAll()       │
           │  findOne()       │
           │  create()        │
           │  updateStatus()  │
           │  reorder()       │
           └──────────────────┘
```

### 2.3 State machines

```
  ORDER STATUS TRANSITIONS
  ════════════════════════

  ┌─────────┐    confirm    ┌───────────┐    ship     ┌─────────┐    deliver   ┌───────────┐
  │ PENDING │──────────────►│ CONFIRMED │────────────►│ SHIPPED │────────────►│ DELIVERED │
  └────┬────┘               └─────┬─────┘             └────┬────┘             └─────┬─────┘
       │                          │                        │                        │
       │ cancel                   │ cancel                 │ cancel                 │ reopen
       │                          │ (restore stock)        │ (restore stock)        │ (mgr only)
       ▼                          ▼                        ▼                        ▼
  ┌───────────────────────────────────────────────┐                           ┌─────────┐
  │                   CANCELLED                    │                           │ PENDING │
  │               (terminal state)                 │                           └─────────┘
  └───────────────────────────────────────────────┘

  Stock impact:
    PENDING → CONFIRMED:  stock -= qty (deduct)
    CONFIRMED → CANCELLED: stock += qty (restore)
    SHIPPED → CANCELLED:   stock += qty (restore)
    All other transitions:  no stock change


  QUOTE STATUS TRANSITIONS
  ═══════════════════════

  ┌─────┐   contact   ┌───────────┐   send offer   ┌────────────┐
  │ NEW │────────────►│ CONTACTED │───────────────►│ OFFER_SENT │
  └──┬──┘             └─────┬─────┘                └──┬───┬─────┘
     │                      │                         │   │
     │                      │         ┌───────────────┘   │
     │                      │         │                   │
     │    expire            │ expire  │ won               │ lost
     │    ┌─────────────────┤         ▼                   ▼
     │    │                 │    ┌─────────┐         ┌────────┐
     │    ▼                 │    │   WON   │         │  LOST  │
     │  ┌─────────┐        │    │(→order) │         │        │
     └─►│ EXPIRED │◄───────┘    └─────────┘         └────────┘
        │(reopen) │
        └─────────┘
```

---

## 3. Database schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum QuoteStatus {
  NEW
  CONTACTED
  OFFER_SENT
  WON
  LOST
  EXPIRED
}

enum AdminRole {
  SUPER_ADMIN
  MANAGER
  OPERATOR
  VIEWER
}

enum StockReason {
  RESTOCK
  SALE
  LOST
  DAMAGE
  THEFT
  CORRECTION
}

enum Language {
  AR
  FR
  EN
}

// ─── CUSTOMERS ───────────────────────────────────────

model User {
  id         BigInt    @id @default(autoincrement())
  uuid       String    @unique @default(uuid())
  facebookId String    @unique @map("facebook_id")
  name       String
  phone      String?
  email      String?
  langPref   Language  @default(AR) @map("lang_pref")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  addresses  Address[]
  cart       Cart?
  orders     Order[]
  quotes     Quote[]
  notes      Note[]    @relation("CustomerNotes")

  @@map("users")
}

model Address {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  label     String?  // "Home", "Work", custom
  address   String
  city      String
  isDefault Boolean  @default(false) @map("is_default")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("addresses")
}

// ─── CART ─────────────────────────────────────────────

model Cart {
  id        BigInt     @id @default(autoincrement())
  userId    BigInt     @unique @map("user_id")
  user      User       @relation(fields: [userId], references: [id])
  updatedAt DateTime   @updatedAt @map("updated_at")

  items     CartItem[]

  @@map("carts")
}

model CartItem {
  id        BigInt   @id @default(autoincrement())
  cartId    BigInt   @map("cart_id")
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId BigInt   @map("product_id")
  product   Product  @relation(fields: [productId], references: [id])
  qty       Int
  addedAt   DateTime @default(now()) @map("added_at")

  @@unique([cartId, productId])
  @@map("cart_items")
}

// ─── PRODUCTS ─────────────────────────────────────────

model Product {
  id          BigInt   @id @default(autoincrement())
  uuid        String   @unique @default(uuid())
  sku         String   @unique
  slug        String   @unique
  nameAr      String   @map("name_ar")
  nameFr      String   @map("name_fr")
  nameEn      String   @map("name_en")
  descAr      String?  @map("desc_ar")
  descFr      String?  @map("desc_fr")
  descEn      String?  @map("desc_en")
  category    String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  threshold   Int      @default(5)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  images      ProductImage[]
  cartItems   CartItem[]
  orderItems  OrderItem[]
  stockHistory StockHistory[]

  @@map("products")
}

model ProductImage {
  id        BigInt  @id @default(autoincrement())
  productId BigInt  @map("product_id")
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  position  Int     @default(0)

  @@map("product_images")
}

model StockHistory {
  id        BigInt      @id @default(autoincrement())
  productId BigInt      @map("product_id")
  product   Product     @relation(fields: [productId], references: [id])
  adminId   BigInt      @map("admin_id")
  admin     Admin       @relation(fields: [adminId], references: [id])
  qtyDelta  Int         @map("qty_delta")
  reason    StockReason
  createdAt DateTime    @default(now()) @map("created_at")

  @@map("stock_history")
}

// ─── ORDERS ───────────────────────────────────────────

model Order {
  id              BigInt      @id @default(autoincrement())
  uuid            String      @unique @default(uuid())
  ref             String      @unique // ORD-0001 (display reference)
  userId          BigInt      @map("user_id")
  user            User        @relation(fields: [userId], references: [id])
  status          OrderStatus @default(PENDING)
  phone           String
  addressSnapshot Json        @map("address_snapshot") // { address, city }
  trackingNumber  String?     @map("tracking_number")
  total           Decimal     @db.Decimal(10, 2)
  idempotencyKey  String      @unique @map("idempotency_key")
  quoteId         BigInt?     @map("quote_id")
  quote           Quote?      @relation(fields: [quoteId], references: [id])
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  items           OrderItem[]
  notes           Note[]      @relation("OrderNotes")
  statusHistory   OrderStatusHistory[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}

model OrderItem {
  id        BigInt  @id @default(autoincrement())
  orderId   BigInt  @map("order_id")
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId BigInt  @map("product_id")
  product   Product @relation(fields: [productId], references: [id])
  qty       Int
  price     Decimal @db.Decimal(10, 2) // Price at time of order (snapshot)

  @@map("order_items")
}

model OrderStatusHistory {
  id        BigInt      @id @default(autoincrement())
  orderId   BigInt      @map("order_id")
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  fromStatus OrderStatus? @map("from_status")
  toStatus  OrderStatus @map("to_status")
  adminId   BigInt?     @map("admin_id") // null for customer-initiated (creation)
  admin     Admin?      @relation(fields: [adminId], references: [id])
  note      String?
  createdAt DateTime    @default(now()) @map("created_at")

  @@index([orderId])
  @@map("order_status_history")
}

// ─── QUOTES ───────────────────────────────────────────

model Quote {
  id             BigInt      @id @default(autoincrement())
  uuid           String      @unique @default(uuid())
  ref            String      @unique // QT-0001 (display reference)
  userId         BigInt      @map("user_id")
  user           User        @relation(fields: [userId], references: [id])
  status         QuoteStatus @default(NEW)
  serviceType    String      @map("service_type")   // installation, inspection, recharge, other
  propertyType   String      @map("property_type")  // residential, commercial, industrial
  surfaceOrRooms String?     @map("surface_or_rooms")
  hasElectrical  Boolean     @default(false) @map("has_electrical")
  freeText       String?     @map("free_text")
  phone          String
  city           String
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  orders         Order[]
  notes          Note[]      @relation("QuoteNotes")
  statusHistory  QuoteStatusHistory[]

  @@index([userId])
  @@index([status])
  @@map("quotes")
}

model QuoteStatusHistory {
  id         BigInt      @id @default(autoincrement())
  quoteId    BigInt      @map("quote_id")
  quote      Quote       @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  fromStatus QuoteStatus? @map("from_status")
  toStatus   QuoteStatus @map("to_status")
  adminId    BigInt?     @map("admin_id")
  admin      Admin?      @relation(fields: [adminId], references: [id])
  note       String?
  createdAt  DateTime    @default(now()) @map("created_at")

  @@index([quoteId])
  @@map("quote_status_history")
}

// ─── ADMIN ────────────────────────────────────────────

model Admin {
  id           BigInt    @id @default(autoincrement())
  email        String    @unique
  passwordHash String    @map("password_hash")
  name         String
  role         AdminRole @default(OPERATOR)
  active       Boolean   @default(true)
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  notes        Note[]
  auditLogs    AuditLog[]
  stockHistory StockHistory[]
  orderStatusHistory OrderStatusHistory[]
  quoteStatusHistory QuoteStatusHistory[]

  @@map("admins")
}

// ─── NOTES ────────────────────────────────────────────

model Note {
  id         BigInt   @id @default(autoincrement())
  body       String
  authorId   BigInt   @map("author_id")
  author     Admin    @relation(fields: [authorId], references: [id])

  // Exactly one of these is non-null
  orderId    BigInt?  @map("order_id")
  order      Order?   @relation("OrderNotes", fields: [orderId], references: [id])
  quoteId    BigInt?  @map("quote_id")
  quote      Quote?   @relation("QuoteNotes", fields: [quoteId], references: [id])
  customerId BigInt?  @map("customer_id")
  customer   User?    @relation("CustomerNotes", fields: [customerId], references: [id])

  createdAt  DateTime @default(now()) @map("created_at")

  @@map("notes")
}

// ─── AUDIT LOG ────────────────────────────────────────

model AuditLog {
  id        BigInt   @id @default(autoincrement())
  adminId   BigInt   @map("admin_id")
  admin     Admin    @relation(fields: [adminId], references: [id])
  action    String   // e.g. "order.status_changed", "product.stock_adjusted"
  resource  String   // e.g. "order:ORD-0042", "product:SKU-001"
  before    Json?
  after     Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([adminId])
  @@index([createdAt])
  @@index([action])
  @@map("audit_log")
}

// ─── SETTINGS ─────────────────────────────────────────

model Setting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("settings")
}
```

---

## 4. API endpoints (complete reference)

### 4.1 Public (no auth)

| Method | Path                             | Description                      | Response                                            |
| ------ | -------------------------------- | -------------------------------- | --------------------------------------------------- |
| `GET`  | `/api/v1/products`               | PLP — paginated product list     | `{ data: Product[], meta: { total, page, limit } }` |
| `GET`  | `/api/v1/products/:slug`         | PDP — single product with images | `{ data: Product & { images } }`                    |
| `GET`  | `/api/v1/products/:slug/stock`   | Stock check (cart validation)    | `{ stock: number, active: boolean }`                |
| `POST` | `/api/v1/auth/facebook`          | Initiate Facebook OAuth          | Redirect to Facebook                                |
| `GET`  | `/api/v1/auth/facebook/callback` | OAuth callback → set JWT cookie  | Redirect to return URL                              |
| `GET`  | `/api/v1/health`                 | Health check                     | `{ status: 'ok', db: 'connected' }`                 |

### 4.2 Customer (`/api/v1/customer/*` — Facebook JWT)

| Method   | Path                             | Description                                                                |
| -------- | -------------------------------- | -------------------------------------------------------------------------- |
| `GET`    | `/customer/profile`              | Get own profile                                                            |
| `PATCH`  | `/customer/profile`              | Update name, phone, email, langPref                                        |
| `GET`    | `/customer/addresses`            | List own addresses                                                         |
| `POST`   | `/customer/addresses`            | Add address                                                                |
| `PATCH`  | `/customer/addresses/:id`        | Update address                                                             |
| `DELETE` | `/customer/addresses/:id`        | Delete address                                                             |
| `GET`    | `/customer/cart`                 | Get server cart with items + product details                               |
| `POST`   | `/customer/cart/items`           | Add item `{ productId, qty }`                                              |
| `PATCH`  | `/customer/cart/items/:id`       | Update quantity `{ qty }`                                                  |
| `DELETE` | `/customer/cart/items/:id`       | Remove item from cart                                                      |
| `POST`   | `/customer/cart/merge`           | Merge localStorage cart `{ items: [{productId, qty}] }`                    |
| `POST`   | `/customer/orders`               | Create order (checkout) `{ phone, address, city, notes?, idempotencyKey }` |
| `GET`    | `/customer/orders`               | List own orders (paginated, filterable by status)                          |
| `GET`    | `/customer/orders/:uuid`         | Order detail with timeline                                                 |
| `POST`   | `/customer/orders/:uuid/reorder` | Reorder → add items to cart                                                |
| `POST`   | `/customer/quotes`               | Submit quote request                                                       |
| `GET`    | `/customer/quotes`               | List own quotes                                                            |
| `GET`    | `/customer/quotes/:uuid`         | Quote detail with status                                                   |

### 4.3 Admin (`/api/v1/admin/*` — Admin JWT)

| Method   | Path                                   | Description                           | Roles      |
| -------- | -------------------------------------- | ------------------------------------- | ---------- |
| `POST`   | `/admin/auth/login`                    | Login `{ email, password }`           | Public     |
| `POST`   | `/admin/auth/logout`                   | Logout (clear cookie)                 | Any        |
| `GET`    | `/admin/dashboard/stats`               | KPI aggregation (cached 60s)          | Any        |
| `GET`    | `/admin/dashboard/queues`              | Pending orders + new quotes           | Any        |
| `GET`    | `/admin/dashboard/activity`            | Recent activity feed                  | Any        |
| `GET`    | `/admin/orders`                        | List all orders (filtered, paginated) | Operator+  |
| `GET`    | `/admin/orders/:uuid`                  | Order detail (any order)              | Operator+  |
| `PATCH`  | `/admin/orders/:uuid/status`           | Change status `{ status, note? }`     | Operator+  |
| `POST`   | `/admin/orders/:uuid/notes`            | Add note `{ body }`                   | Operator+  |
| `GET`    | `/admin/orders/export`                 | CSV export                            | Manager+   |
| `GET`    | `/admin/quotes`                        | List all quotes                       | Operator+  |
| `GET`    | `/admin/quotes/:uuid`                  | Quote detail                          | Operator+  |
| `PATCH`  | `/admin/quotes/:uuid/status`           | Change status `{ status, note? }`     | Operator+  |
| `POST`   | `/admin/quotes/:uuid/notes`            | Add note                              | Operator+  |
| `POST`   | `/admin/quotes/:uuid/convert`          | Convert quote → order                 | Manager+   |
| `GET`    | `/admin/quotes/export`                 | CSV export                            | Manager+   |
| `GET`    | `/admin/customers`                     | List customers (search)               | Manager+   |
| `GET`    | `/admin/customers/:uuid`               | Customer 360 profile                  | Manager+   |
| `POST`   | `/admin/customers/:uuid/notes`         | Add customer note                     | Manager+   |
| `GET`    | `/admin/products`                      | List all products                     | Manager+   |
| `GET`    | `/admin/products/:uuid`                | Product detail                        | Manager+   |
| `POST`   | `/admin/products`                      | Create product                        | Manager+   |
| `PATCH`  | `/admin/products/:uuid`                | Update product                        | Manager+   |
| `POST`   | `/admin/products/:uuid/stock`          | Adjust stock `{ qtyDelta, reason }`   | Manager+   |
| `POST`   | `/admin/products/:uuid/images/upload`  | Upload image (multipart)              | Manager+   |
| `DELETE` | `/admin/products/:uuid/images/:id`     | Delete image                          | Manager+   |
| `PATCH`  | `/admin/products/:uuid/images/reorder` | Reorder images `{ imageIds: [] }`     | Manager+   |
| `POST`   | `/admin/products/import`               | Bulk CSV import                       | SuperAdmin |
| `GET`    | `/admin/users`                         | List staff users                      | SuperAdmin |
| `POST`   | `/admin/users`                         | Create staff user                     | SuperAdmin |
| `PATCH`  | `/admin/users/:id`                     | Update role/status                    | SuperAdmin |
| `GET`    | `/admin/settings`                      | Get settings                          | SuperAdmin |
| `PATCH`  | `/admin/settings`                      | Update settings                       | SuperAdmin |
| `GET`    | `/admin/audit-log`                     | List audit entries (filtered)         | SuperAdmin |
| `GET`    | `/admin/audit-log/export`              | CSV export                            | SuperAdmin |

---

## 5. Critical flows

### 5.1 Checkout flow (transactional)

```
  Client                           API                              PostgreSQL
  ──────                           ───                              ──────────
  POST /customer/orders            │
  { phone, address, city,          │
    idempotencyKey }               │
                                   │  1. Check idempotency key
                                   │     SELECT FROM orders WHERE idempotency_key = ?
                                   │     → if exists: return existing order (200)
                                   │
                                   │  2. BEGIN TRANSACTION
                                   │
                                   │  3. Load cart + items
                                   │     SELECT cart + cart_items WHERE user_id = ?
                                   │     → if empty: return 400 "Cart is empty"
                                   │
                                   │  4. Lock product rows
                                   │     SELECT id, stock, price, active FROM products
                                   │     WHERE id IN (...) FOR UPDATE
                                   │
                                   │  5. Validate stock
                                   │     for each item:
                                   │       if !active → error
                                   │       if stock < qty → error
                                   │     → if any error: ROLLBACK, return 409
                                   │       { error: 'stock_conflict', items: [...] }
                                   │
                                   │  6. Generate order ref (ORD-XXXX)
                                   │     SELECT MAX(ref) ... + 1
                                   │
                                   │  7. Create order + order_items
                                   │     INSERT INTO orders (...)
                                   │     INSERT INTO order_items (...) -- price snapshot
                                   │
                                   │  8. Create status history
                                   │     INSERT INTO order_status_history
                                   │       (from: null, to: PENDING)
                                   │
                                   │  9. Clear cart
                                   │     DELETE FROM cart_items WHERE cart_id = ?
                                   │
                                   │  10. COMMIT
                                   │
  ← 201 { order: { uuid, ref,     │
           status, items, total }} │
```

### 5.2 Cart merge flow

```
  POST /customer/cart/merge
  { items: [{ productId, qty }] }

  1. Load server cart (or create if none)
  2. For each local item:
     a. Check product exists + active + in stock
        → if not: add to `skipped[]` with reason
     b. Check if already in server cart
        → if yes: keep server qty (server wins)
        → if no: add to server cart at current stock-validated qty
  3. Return { cart: serverCart, skipped: [...], priceChanges: [...] }
  4. Frontend: clear localStorage, show toasts for skipped/changed items
```

### 5.3 Admin status change flow

```
  PATCH /admin/orders/:uuid/status
  { status: 'CONFIRMED', note?: 'Verified by phone' }

  1. Load order
  2. Validate transition (ORDER_TRANSITIONS map)
     → if invalid: 400 "Cannot move from X to Y"
  3. BEGIN TRANSACTION
  4. If transition involves stock:
     - CONFIRMED: SELECT products FOR UPDATE → deduct stock
     - CANCELLED (from CONFIRMED/SHIPPED): restore stock
  5. Update order status
  6. Create status history entry
  7. Create audit log entry
  8. If note provided: create note
  9. COMMIT
  10. Return updated order with timeline
```

---

## 6. Authentication architecture

### 6.1 Customer auth (Facebook OAuth)

```
  Browser                    API                     Facebook
  ───────                    ───                     ────────
  Click "Login"              │
  ──────────────────────────►│
                             │  Redirect to Facebook
                             │─────────────────────────────►│
                             │                              │  User authorizes
                             │◄─────────────────────────────│  code + profile
                             │
                             │  Exchange code for token
                             │  Extract: facebook_id, name, email?
                             │
                             │  Upsert user:
                             │    INSERT ... ON CONFLICT (facebook_id)
                             │    DO UPDATE SET name = ?, last_login = NOW()
                             │
                             │  Generate customer JWT
                             │    payload: { sub: user.id, type: 'customer' }
                             │    expiry: 24 hours
                             │
  Set-Cookie: token=JWT      │
  (HttpOnly, Secure, SameSite)
  ◄──────────────────────────│
  Redirect to returnUrl      │
```

### 6.2 Admin auth (email/password)

```
  POST /admin/auth/login
  { email, password }

  1. Find admin by email
     → if not found or !active: 401
  2. Check failed login attempts
     → if >= 5 in last 15 min: 429 "Account locked"
  3. bcrypt.compare(password, admin.passwordHash)
     → if mismatch: log failed attempt, 401
  4. Generate admin JWT
     payload: { sub: admin.id, type: 'admin', role: admin.role }
     expiry: 60 minutes (idle timeout)
  5. Update lastLoginAt
  6. Set-Cookie: admin_token=JWT
  7. Return { admin: { id, name, email, role } }
```

---

## 7. Environment variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mspi

# Facebook OAuth
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/v1/auth/facebook/callback

# JWT
JWT_SECRET=                    # Customer JWT signing key
JWT_ADMIN_SECRET=              # Admin JWT signing key (separate!)
JWT_CUSTOMER_EXPIRY=24h
JWT_ADMIN_EXPIRY=60m

# App URLs (CORS whitelist)
WEB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880          # 5MB

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Meta Pixel (client-side, in Next.js .env)
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

---

## 8. Indexes and performance

### 8.1 Database indexes (beyond Prisma defaults)

```sql
-- Orders: admin list queries
CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- Quotes: admin list + kanban
CREATE INDEX idx_quotes_status_updated ON quotes (status, updated_at DESC);
CREATE INDEX idx_quotes_user_created ON quotes (user_id, created_at DESC);

-- Products: PLP queries
CREATE INDEX idx_products_active_slug ON products (active, slug);

-- Audit log: admin filtering
CREATE INDEX idx_audit_created_action ON audit_log (created_at DESC, action);

-- Status history: timeline queries
CREATE INDEX idx_order_status_history_order ON order_status_history (order_id, created_at);
CREATE INDEX idx_quote_status_history_quote ON quote_status_history (quote_id, created_at);
```

### 8.2 Dashboard KPI query

```sql
WITH order_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS orders_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS orders_7d,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS orders_30d,
    COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count,
    COALESCE(SUM(total) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'), 0) AS revenue_7d,
    COALESCE(AVG(total) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'), 0) AS aov_7d
  FROM orders
),
quote_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE status = 'NEW') AS new_quotes,
    COUNT(*) FILTER (WHERE status = 'WON' AND updated_at > NOW() - INTERVAL '30 days') AS won_30d,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS total_30d
  FROM quotes
),
low_stock AS (
  SELECT COUNT(*) AS low_stock_count
  FROM products
  WHERE stock <= threshold AND active = true
),
customer_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS new_customers_7d,
    COUNT(DISTINCT user_id) FILTER (WHERE user_id IN (
      SELECT user_id FROM orders GROUP BY user_id HAVING COUNT(*) > 1
    )) AS repeat_buyers
  FROM users
)
SELECT * FROM order_stats, quote_stats, low_stock, customer_stats;
```

Cached with `@CacheTTL(60)` via `@nestjs/cache-manager` (in-memory).

---

## 9. Risks and mitigations

| Risk                                       | Likelihood | Impact   | Mitigation                                                                       |
| ------------------------------------------ | ---------- | -------- | -------------------------------------------------------------------------------- |
| Stock race condition (concurrent checkout) | Medium     | High     | SELECT FOR UPDATE in transaction (§5.1 step 4)                                   |
| Order duplication (double-click)           | High       | Medium   | Idempotency key per checkout (§5.1 step 1)                                       |
| IDOR on customer resources                 | Medium     | Critical | UUID in URLs + ownership scoping on all customer endpoints                       |
| Admin cancel fails to restore stock        | Low        | High     | Wrap cancel + stock restore in single transaction; test both paths               |
| Facebook API downtime                      | Low        | High     | Error page + WhatsApp support link; no fallback auth for MVP                     |
| Session expiry during checkout             | Medium     | Medium   | 24h customer session; cart preserved in server + localStorage                    |
| Large product images slow page             | Medium     | Medium   | Validate file size (5MB max); serve via Nginx static; Next.js Image optimization |
| Admin brute force                          | Medium     | High     | 5 failed attempts → 15 min lockout; audit log all failures                       |

---

## 10. Testing strategy

| Layer         | Tool                  | Focus                                              | Target Coverage |
| ------------- | --------------------- | -------------------------------------------------- | --------------- |
| Unit          | Jest (NestJS)         | Services: cart merge, checkout, transitions, stock | 80%+            |
| Integration   | Jest + Prisma test DB | Full endpoint flows with real DB                   | Key flows       |
| E2E           | Playwright            | Checkout, account, admin order management          | Critical paths  |
| Frontend unit | Vitest                | Utils, hooks, form validation                      | 80%+            |
| Component     | Testing Library + MSW | Components with mocked API                         | Key components  |

### Critical test cases

1. **Checkout race:** Two concurrent POST /customer/orders for last-1 stock → one succeeds, one gets 409.
2. **Cart merge all scenarios:** local-only, server-only, both, OOS, price-changed.
3. **State machine:** All valid transitions succeed; all invalid transitions return 400.
4. **Cancel + stock restore:** Cancel confirmed order → product stock increases.
5. **Idempotency:** Same idempotency key → returns same order, no duplicate.
6. **Reorder partial OOS:** Reorder with 2 of 3 items OOS → cart has 1 item, response lists skipped.
7. **Ownership scoping:** User A cannot GET /customer/orders/:uuid of User B's order → 404.
