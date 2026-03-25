# MSPI Fire Safety — Product Requirements Document (PRD)

## Document control

| Field | Value |
|-------|--------|
| **Product name** | MSPI Fire Safety Ecommerce & Quote Platform |
| **Version** | 2.0 |
| **Related technical spec** | [SRD.md](./SRD.md) (Software Requirements: Next.js structure, NestJS API layout and practices, TanStack Query, shadcn/ui, tooling) |
| **Related systems** | Facebook Login, Meta Pixel, WhatsApp (`wa.me`) |
| **Last updated** | 2026-03-25 |

---

## 1. Vision and positioning

### 1.1 Problem

Tunisian (and Francophone) fire-safety buyers often discover offers on Facebook but drop off at long forms, unclear next steps, or lack of trust. B2B installation and maintenance needs do not fit a simple "add to cart" flow. Post-purchase, customers have **zero visibility** into their order status and no way to reorder — leading to high WhatsApp support load and no retention.

### 1.2 Solution

A **three-surface product** in one ecosystem:

1. **Public marketing + storefront** — multilingual catalog, COD checkout, quote funnel, trust-building landing experience, Meta-attributed journeys.
2. **Customer account** — order tracking, quote status, reorder, saved addresses, profile management. Builds COD trust and enables self-service.
3. **Internal CRM-style admin** — orders, inventory, quotes and leads, customer timeline, operational statuses.

### 1.3 Objectives

- Lift **conversion from Meta traffic** (landing → product view → cart → checkout / quote).
- Improve **lead quality** via **mandatory Facebook SSO** before order or quote.
- Reduce ops friction: **single source of truth** for stock, orders, and quote pipeline.
- Enable **retargeting and follow-up** using Pixel events and first-party customer records.
- **Build COD trust** by giving customers real-time order visibility and self-service tools.
- **Drive retention** via 1-tap reorder, saved addresses, and account history — compounding CAC over time.

### 1.4 Product positioning

This is **not** a generic ecommerce store. It is a **conversion + lead system** optimized for a specific lifecycle:

```
  ACQUISITION          CONVERSION           RETENTION
  ─────────────        ─────────────        ─────────────
  Meta Ad              Landing page         Account dashboard
  Facebook traffic     Product discovery    Order tracking
  SEO (Phase 2)        Cart + checkout      Reorder (1-tap)
                       Quote funnel         Saved addresses
                       WhatsApp closing     Repeat purchase
                                            (lower CAC, higher LTV)
```

---

## 2. Architecture (product view)

- **Monorepo** with separate deployables: **marketing/storefront + customer account** (`apps/web`), **admin CRM** (`apps/admin`), **API** (`apps/api`, NestJS), **PostgreSQL**.
- **Customer-facing** Next.js app and **admin** Next.js app both follow the **folder and module conventions** described in [SRD.md](./SRD.md).
- **Single API** serves both web and admin with separate auth strategies (Facebook OAuth for customers, email/password JWT for admin) and scoped guards.

### 2.1 Route map (`apps/web`)

```
/(public)                          # No auth required
  /                                → Landing page
  /products                        → PLP (product listing)
  /products/[slug]                 → PDP (product detail)
  /cart                            → Cart (localStorage for anon)
  /faq                             → FAQ
  /terms                           → Terms & conditions

/(protected)                       # Facebook SSO required
  /checkout                        → COD checkout
  /devis                           → Quote form
  /account                         → Account dashboard
  /account/orders                  → My orders list
  /account/orders/[uuid]           → Order detail + tracking timeline
  /account/quotes                  → My quotes list
  /account/quotes/[uuid]           → Quote detail + status
  /account/profile                 → Edit profile (name, phone, addresses)

/(auth)
  /auth/facebook/callback          → OAuth redirect handler
```

### 2.2 Route map (`apps/admin`)

```
/(public)
  /login                           → Email/password login

/(app)                             # Admin JWT required
  /                                → Dashboard (KPIs, queues)
  /orders                          → Order list + filters
  /orders/[uuid]                   → Order detail + status actions
  /quotes                          → Quote list + kanban
  /quotes/[uuid]                   → Quote detail + pipeline
  /customers                       → Customer list + search
  /customers/[uuid]                → Customer 360 profile
  /products                        → Product + inventory list
  /products/[uuid]                 → Product edit
  /settings                        → Integration config, team, audit log
```

---

## 3. Target users and journeys

### 3.1 Segments

- **B2C:** car owners, homeowners, small shop owners — COD, quick path.
- **B2B:** companies, factories, property managers — quote-first, optional catalog.

### 3.2 Primary journeys

1. **Purchase:** Meta ad → Landing → Product → Cart → Facebook login → COD checkout → Confirmation → Track via account.
2. **Quote:** Meta ad → Landing → Devis → Facebook login → Form → DB save → WhatsApp handoff → Track via account.
3. **Reorder:** Returning customer → Login → Account → My Orders → "Reorder" → Cart (pre-filled) → Checkout (saved address) → Done.
4. **Admin ops:** Admin login → Dashboard → Order/quote queue → status update → WhatsApp notify customer → inventory aligned.

---

## 4. User stories

### 4.1 Customer stories

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| C-01 | As a **buyer from Meta**, I want to browse products without logging in, so I can decide before committing. | PLP/PDP accessible without auth; cart works anonymously via localStorage. |
| C-02 | As a **buyer**, I want to add items to cart and have them persist, so I don't lose my selections. | Anonymous: localStorage. Logged in: server-side cart synced across devices. On login: merge local → server. |
| C-03 | As a **buyer**, I want to checkout with COD using my Facebook account, so I don't need to create yet another password. | Facebook SSO gate before checkout submit. Name prefilled from FB. Phone required. |
| C-04 | As a **buyer**, I want to see my order status after purchase, so I trust the process and don't need to call/WhatsApp. | /account/orders/[uuid] shows timeline: placed → confirmed → shipped → delivered. Updates when admin changes status. |
| C-05 | As a **repeat buyer**, I want to reorder a previous purchase in one tap, so buying again is effortless. | "Reorder" button on delivered orders. Adds items to cart (validates stock). Redirects to /cart. |
| C-06 | As a **repeat buyer**, I want my address saved from previous orders, so I don't re-type it every time. | Checkout shows dropdown of saved addresses. Default = last used. Can add new. |
| C-07 | As a **B2B customer**, I want to submit a quote request for installation/inspection, so I can get a professional assessment. | /devis form with service type, property type, surface, rooms, electrical equipment. Persisted in DB. WhatsApp deep link generated. |
| C-08 | As a **quote submitter**, I want to see my quote status in my account, so I know if MSPI has responded. | /account/quotes lists all quotes with status badge (new, contacted, offer sent, won, lost). |
| C-09 | As a **customer**, I want to manage my profile (phone, name, addresses), so my information is always current. | /account/profile with editable fields. Phone is primary contact. Multiple addresses supported. |
| C-10 | As an **Arabic speaker**, I want the entire experience in Arabic (RTL), so I feel at home. | Full i18n: AR default, FR, EN. RTL layout for AR. Language switcher persists preference. |

### 4.2 Admin stories

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| A-01 | As an **operator**, I want to see pending orders in a queue, so I can confirm them quickly. | Dashboard shows top 5 pending orders. Click → detail. "Confirm" button changes status + deducts stock. |
| A-02 | As an **operator**, I want to notify customers of status changes via WhatsApp, so they stay informed. | Each status action shows "Notify via WhatsApp" button. Opens wa.me with pre-filled template in customer's language. |
| A-03 | As a **manager**, I want to manage the quote pipeline (kanban), so I can track leads from new → won/lost. | Quotes view with list + kanban toggle. Drag cards between status columns. Notes on each quote. |
| A-04 | As a **manager**, I want a 360° customer view, so I can see full history before engaging. | Customer detail: basic info, order history, quote history, internal notes, addresses, engagement stats. |
| A-05 | As a **manager**, I want to manage products and stock, so the public site reflects real availability. | Product edit: names (AR/FR/EN), price, images, stock count with adjustment reason, threshold alerts, active flag. |
| A-06 | As a **super admin**, I want to manage staff users and roles, so I control who can do what. | Settings: add/edit/deactivate users. Assign roles (super_admin, manager, operator, viewer). |
| A-07 | As a **super admin**, I want an audit log of all critical changes, so I have accountability. | Immutable log: timestamp, admin, action, resource, before/after. Filterable. CSV export. |

---

## 5. Brand guidelines

### 5.1 Brand assets

- **Master logo:** `mspi-logo.png` at project root; use for header, favicon, OG images, admin branding (copy into each app's `public/` as needed).
- **Variants:** horizontal lockup; monochrome or white logo for dark or gradient backgrounds.

### 5.2 Brand pillars

- Safety and compliance; accessibility (contrast, RTL); perceived speed.

### 5.3 Voice and tone

- **Arabic (default):** clear MSA for UI; short imperative CTAs.
- **French:** professional, concise.
- **English:** straightforward ecommerce and service language.

Maintain a glossary for product classes (powder vs CO2, recharge, inspection) across locales.

### 5.4 Color system

- **Primary (Brand 500):** `#ec4130`.
- **Scale:** Brand 400 `#f06a5a`, Brand 600 `#d63828`, Brand 700 `#b32a1f` (hover, pressed, depth).
- **Gradients:** hero diagonal `#ec4130` → `#c12e24`; vertical depth `#f06a5a` → `#ec4130` → `#b32a1f`; soft wash and card edge gradients using low-opacity brand red on neutrals.
- **Neutrals:** text `#0a0a0a` / `#171717`, secondary `#525252`, surfaces white / `#f4f4f5`, borders `#e4e4e7`.
- **Semantic:** success, warning, and error states must be **visually distinct** from brand red (e.g. destructive actions use a different red such as `#dc2626` or neutral styling).

### 5.5 Logo and imagery

- Clear space around logo; white logo on strong red gradients when contrast requires it.
- Real product and installation photography; avoid generic stock-only fire clichés.

### 5.6 Iconography

- Simple line icons; mirror directional icons for RTL.

---

## 6. Design system and UX (marketing site)

- Mobile-first; large tap targets; sticky header with language switcher and cart where applicable.
- Sans-serif with **Arabic coverage** for `ar` locale; hierarchy H1 bold, H2 semibold, body regular.
- Components: rounded buttons, cards with restrained hover motion, accessible focus rings.
- **RTL:** `dir="rtl"` for Arabic; mirrored layout and numerals policy per locale.

---

## 7. Motion and conversion polish

- Micro-interactions (buttons, cart, quantity) 150–250ms; respect `prefers-reduced-motion`.
- Landing: stronger motion (hero, staggered sections); PLP/PDP: lighter; checkout/devis: minimal.
- Prefer transform and opacity; avoid layout-thrashing animations; optimize LCP (Next.js Image, font subsetting).

---

## 8. Multilingual (i18n)

- Languages: **Arabic (default)**, French, English.
- URL structure: `/ar`, `/fr`, `/en` (see SRD for App Router mapping).
- Language switcher; persist preference (cookie + `localStorage` as needed).
- SEO: localized titles, descriptions, OG tags, hreflang.

---

## 9. Facebook SSO (customer)

- Required before **placing an order** or **submitting a quote**. Browsing and cart may remain public until checkout/devis.
- Flow: CTA → OAuth → upsert user (`facebook_id`, name, optional email) → session → return to checkout or devis.

### 9.1 Session management

- **Session duration:** 24 hours (generous for COD — buyer may browse, leave, return).
- **Storage:** JWT in secure HttpOnly cookie.
- **On expiry:** redirect to Facebook login; preserve cart in localStorage; auto-return to original page after re-auth.

### 9.2 Edge cases

| Scenario | Behavior |
|----------|----------|
| User cancels Facebook login | Block with message: "Login required to continue" + WhatsApp support link. |
| Facebook API is down | Show error page: "Login temporarily unavailable. Please try again in a few minutes." + WhatsApp support link. Do NOT fall back to guest checkout. |
| User has no email on Facebook | Phone becomes primary contact. Email field optional in profile. |
| Duplicate Facebook account (same phone) | Merge: upsert by `facebook_id`; if phone already exists on another account, flag for admin review (don't auto-merge). |
| Token expired mid-checkout | Re-trigger OAuth silently if possible; if not, redirect to login with cart preserved. |
| User deletes Facebook account | Existing orders/quotes remain in DB. User cannot log in again. Admin can see "inactive SSO" flag. |

---

## 10. Ecommerce (COD)

### 10.1 Catalog (initial)

Powder 1kg, 2kg, 6kg, 9kg; CO2 5kg — each with localized name and description, price, images, stock, use cases.

### 10.2 Product listing page (PLP)

- Responsive grid layout; product card shows: image, name, price, stock badge, "Add to Cart" button.
- **Stock badges:** "In Stock" (green), "Only N left" (amber, when stock < 5), "Out of Stock" (grey, disabled button).
- Sorting: default (admin-defined), price low→high, price high→low.
- No complex filtering for MVP (< 10 products).

### 10.3 Product detail page (PDP)

- Image gallery (swipe on mobile).
- Localized name, description, use cases.
- Price, stock state with badge.
- Quantity selector (max = available stock).
- "Add to Cart" button (disabled when stock = 0).
- Related products (static or by category, Phase 2).

### 10.4 Cart

**Anonymous (not logged in):**
- Stored in `localStorage` as `[{sku, productId, qty, addedAt}]`.
- Re-validates stock on cart page load (API call to check current availability).
- Items that went out of stock: show inline alert with option to remove.

**Logged in:**
- Server-side cart (PostgreSQL).
- Synced across devices.
- On login: merge local cart → server cart (see §10.5).

**Cart UI:**
- Line items: image, name, quantity (editable), unit price, subtotal.
- Total.
- "Proceed to Checkout" button (triggers Facebook SSO if not logged in).
- Empty cart state: "Your cart is empty — browse our products" with link to PLP.

### 10.5 Cart merge (on login)

When a user logs in via Facebook SSO and has items in both localStorage and server cart:

| Scenario | Resolution |
|----------|------------|
| Item in local only | Add to server cart (if in stock). |
| Item in server only | Keep as-is. |
| Item in both, different qty | Server quantity wins (user may have set it on another device). |
| Local item now out of stock | Do NOT add. Show toast: "X was removed from your cart (out of stock)." |
| Local item price changed | Add at current price. Show toast: "Price updated for X." |

After merge: clear localStorage cart. Redirect to server-synced cart view.

### 10.6 Checkout (protected)

- **Gate:** Facebook SSO required. If not logged in, redirect to OAuth then return.
- **Fields:** name (prefilled from Facebook), phone (required, validated), address (required), city (required), notes (optional).
- **Saved addresses:** dropdown of previous addresses if returning customer. Default = last used. "Use new address" option.
- **Final stock validation:** on submit, API re-checks stock for all items. If any item is now out of stock → block submission, return to cart with error message.
- **Idempotency:** generate client-side idempotency key per checkout attempt. API rejects duplicate submissions and returns the existing order.
- **On success:** create order + line items; status `pending`; confirmation page with order reference (ORD-XXXX) and timeline.
- **Confirmation page:** order reference, summary, estimated timeline, "Track your order" link to /account/orders/[uuid], WhatsApp share button.

### 10.7 Order statuses

```
  pending ──► confirmed ──► shipped ──► delivered
                │              │            │
                └──────────────┴────────────┴──► cancelled
```

| Status | Trigger | Stock impact | Customer sees |
|--------|---------|--------------|---------------|
| `pending` | Checkout submit | None (reserved, not deducted) | "Order placed — awaiting confirmation" |
| `confirmed` | Admin action | Stock deducted | "Order confirmed — being prepared" |
| `shipped` | Admin action | No change | "Order shipped" + optional tracking info |
| `delivered` | Admin action | No change | "Delivered" + reorder button enabled |
| `cancelled` | Admin action | Stock restored (if was confirmed+) | "Order cancelled" + reason if provided |

**Stock deduction policy:** Stock is deducted on `confirmed`, not on `pending`. This prevents phantom stock depletion from unconfirmed orders. If a pending order is not confirmed within 48 hours, it should be flagged for review (not auto-cancelled — COD logistics vary).

### 10.8 Order notifications (WhatsApp)

On each status change, admin sees a "Notify Customer" button that opens `wa.me` with a pre-filled template in the customer's language preference.

**Templates (example — Arabic):**

| Status | Template |
|--------|----------|
| confirmed | `مرحباً {name}، طلبك رقم {ref} تم تأكيده وسيتم تجهيزه. شكراً لثقتك بـ MSPI! 🔥` |
| shipped | `مرحباً {name}، طلبك رقم {ref} تم شحنه. سيصلك قريباً إن شاء الله.` |
| delivered | `مرحباً {name}، طلبك رقم {ref} تم التوصيل. نتمنى لك السلامة! 🧯` |
| cancelled | `مرحباً {name}، نعتذر عن إلغاء طلبك رقم {ref}. للمزيد تواصل معنا.` |

French and English equivalents to be provided. Templates stored in DB (admin-editable in Phase 2).

---

## 11. Customer account (`/account`)

### 11.1 Account dashboard

- **Welcome:** "مرحباً {name}" with customer-since date.
- **Stats row:** total orders, total spent, active quotes.
- **Quick links:** My Orders, My Quotes, Profile.
- **Recent activity:** last 3 orders and last 2 quotes with status badges.

### 11.2 My Orders

**List view:**
- Table/cards: order reference (ORD-XXXX), date, item count, total, status badge, "View" link.
- **Filters:** status (all, pending, confirmed, shipped, delivered, cancelled).
- **Sorting:** date (newest first default).
- **Empty state:** "No orders yet — browse our products" with link to PLP.

**Detail view (`/account/orders/[uuid]`):**
- Order reference, date placed, status badge.
- **Tracking timeline:** visual stepper showing order progression (placed → confirmed → shipped → delivered) with timestamps for each completed step.
- Line items: product image, name, qty, price, subtotal.
- Total.
- Delivery address used.
- **Reorder button:** visible on `delivered` orders. Adds all items to cart (validates stock), redirects to /cart. If some items OOS, shows which were skipped.
- **Cancel request:** visible on `pending` orders only. Opens WhatsApp to MSPI with pre-filled cancellation request. (Admin cancels server-side.)

### 11.3 My Quotes

**List view:**
- Table/cards: quote ID, service type, date submitted, status badge.
- **Statuses displayed:** new, contacted, offer sent, won, lost.
- **Empty state:** "No quote requests yet — request a free assessment" with link to /devis.

**Detail view (`/account/quotes/[uuid]`):**
- Quote details: service type, property type, surface/rooms, notes submitted.
- **Status timeline:** visual stepper (submitted → contacted → offer sent → won/lost).
- **Associated order:** if quote converted to order, link to that order.
- **Contact MSPI:** WhatsApp button for follow-up.

### 11.4 Profile

- **Editable fields:** name, phone (primary), email (optional).
- **Language preference:** dropdown (AR/FR/EN), synced with cookie.
- **Saved addresses:** list with labels (Home, Work, custom). Add, edit, delete. Last-used address highlighted as default.
- **Facebook connection:** show connected Facebook name. "Connected via Facebook" badge (non-editable — SSO is the only auth method).

---

## 12. Quote system (`/devis`)

- Protected by Facebook SSO.
- **Fields:** customer name (prefilled), phone (prefilled), city; service type (dropdown: installation, inspection, recharge, other); property type (dropdown: residential, commercial, industrial); surface area or room count; electrical equipment (yes/no toggle); free text notes.
- **On submit:** persist quote with status `new`; show confirmation with quote reference; WhatsApp deep link with structured multilingual template; store payload server-side regardless of whether user sends the WhatsApp message.

### 12.1 Quote statuses

```
  new ──► contacted ──► offer_sent ──► won
                                   └──► lost
                    └──► expired (can reopen)
```

| Status | Trigger | Customer sees |
|--------|---------|---------------|
| `new` | Customer submits form | "Quote submitted — we'll contact you soon" |
| `contacted` | Admin marks after WhatsApp/call | "We've received your request and are in touch" |
| `offer_sent` | Admin sends pricing/proposal | "Offer sent — check your WhatsApp" |
| `won` | Admin marks deal closed | "Quote accepted" + linked order if created |
| `lost` | Admin marks deal lost | "Quote closed" |
| `expired` | Admin or auto (Phase 2: 30 days inactive) | "Quote expired — submit a new request" |

---

## 13. WhatsApp integration

- **Business number:** configured in admin settings (masked display).
- **`wa.me` deep links:** encoded message templates per locale, used for:
  - Order status notifications (admin → customer).
  - Quote follow-up (admin → customer).
  - Customer-initiated support (site → WhatsApp).
  - Post-quote handoff (form confirmation page).
- **Payload storage:** store the structured message payload in DB for operations tracking, even if the user edits the message client-side before sending.
- **Message templates:** stored per locale. Admin can view templates in settings. Admin-editable in Phase 2.

### 13.1 Template types

| Template | Trigger | Variables |
|----------|---------|-----------|
| Order confirmed | Admin confirms order | `{name}`, `{orderRef}` |
| Order shipped | Admin marks shipped | `{name}`, `{orderRef}`, `{trackingNumber?}` |
| Order delivered | Admin marks delivered | `{name}`, `{orderRef}` |
| Order cancelled | Admin cancels order | `{name}`, `{orderRef}` |
| Quote follow-up | Admin contacts customer | `{name}`, `{quoteRef}`, `{serviceType}` |
| Quote offer | Admin sends pricing | `{name}`, `{quoteRef}` |
| Customer support | Customer clicks support link | `{name?}`, `{orderRef?}` |

---

## 14. Meta Pixel and analytics

- Minimum events: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Lead` (quote success), `Purchase` (order confirmed).
- Consent-aware loading where legally required; include content IDs and values for ads reporting where possible.
- Track: `content_type`, `content_ids`, `value`, `currency` (MAD) on commerce events.

---

## 15. Admin dashboard (CRM)

Separate **admin** app (`apps/admin`): staff-only, email/password with role-based access control (RBAC). Accessible on desktop and tablet; mobile responsive but not optimized for mobile.

### 15.1 Authentication and access control

- **Login:** email + password (no SSO; local email/hash per staff user).
- **Password policy:** minimum 8 characters, at least one uppercase, one number. No complexity theater (no special char requirement).
- **Roles:** `super_admin` (all features), `manager` (orders, quotes, customers, products), `operator` (orders, quotes only), `viewer` (read-only access to all modules).
- **Session:** JWT in secure HttpOnly cookie; `60-minute` idle timeout; auto-logout and redirect to login.
- **Permissions table in Settings:** assign roles to users; disable user without deleting history.
- **Brute force protection:** lock account after 5 failed login attempts for 15 minutes. Log all failed attempts.

### 15.2 Dashboard (home page)

**Overview KPIs (24h, 7d, 30d tabs):**
- Total orders (count, pending count, revenue today/week/month).
- Average order value (AOV) and order frequency.
- Quote volume (new quotes, converted, avg conversion time).
- Low-stock alerts (products below threshold, hyperlink to inventory).
- Customer acquisition (new unique customers, repeat buyers count).

**Live queues:**
- **Pending orders:** 5-item queue card, sorted by newest first; click to open detail view; batch-action to "Mark Confirmed".
- **New quotes:** 5-item queue card, sorted by newest first; last updated time; click to open detail view; status badge.

**Recent activity feed:** last 10 actions across the platform (order confirmed, quote status changed, inventory updated) with timestamps and actor.

### 15.3 Orders module

**List view:**
- Table with columns: Order ref (ORD-XXXX), customer name, phone, status, items count, total price, date, actions.
- **Filters:** status (pending, confirmed, shipped, delivered, cancelled), date range, customer search (name/phone), price range.
- **Sorting:** by date (desc default), status, amount.
- **Pagination:** 20 rows per page; server-side pagination.
- **Bulk actions:** select multiple → "Mark Confirmed" or "Mark Shipped" or "Cancel".
- **Export:** CSV with order details and timestamps.

**Detail view:**
- Header: Order ref, customer info (name, phone, email, address), order date, last updated.
- **Line items table:** product name, SKU, quantity, unit price, subtotal. Not editable (preserve historical accuracy).
- **Order timeline:** immutable audit trail of all state changes (pending → confirmed → shipped → delivered / cancelled) with timestamp, admin name.
- **Status action buttons:**
  - pending → "Confirm & Deduct Inventory" + "Notify via WhatsApp".
  - confirmed → "Mark Shipped" + "Notify via WhatsApp". Optional: tracking number field.
  - shipped → "Mark Delivered" + "Notify via WhatsApp".
  - delivered → "Reopen" (manager+ only, rare).
  - Any status → "Cancel Order" (triggers stock restoration if was confirmed+; requires note).
- **Internal notes:** text field; audit who added each note and when.
- **Fulfillment info:** tracking number, delivery notes (free text).
- **Back link** to customer profile.

### 15.4 Quotes module

**List view:**
- Table: Quote ID, customer name, phone, service type, property type, status, last updated, actions.
- **Filters:** status (new, contacted, offer sent, won, lost, expired), date range, customer search, service/property type.
- **Sorting:** by date (desc default), status.
- **Kanban view** (alternate): columns for each status; drag-to-move cards (updates DB); each card shows quote ID, customer name, phone, last updated.
- **Pagination:** 20 rows per page.
- **Export:** CSV of all quotes with details and last status date.

**Detail view:**
- Header: Quote ID, customer info (name, phone, email if captured, city).
- **Service & property details:** service type, property type, surface area or room count, electrical equipment (yes/no), customer notes.
- **Quote timeline:** immutable record of all status changes with timestamps and admin.
- **Status actions:**
  - New → "Mark Contacted" (record date/time).
  - Any → "Send Offer" (pre-populate WhatsApp template; store payload).
  - Any → "Mark Won" (requires note: deal terms/next steps) or "Mark Lost" (requires note: reason).
  - Any → "Expire" (soft-close; can reopen).
- **Convert to order:** when status = won, option to create a pre-filled order for the customer. Links quote to order via FK.
- **Internal notes:** text field with audit trail.
- **WhatsApp integration:** "Copy WhatsApp message" pre-fills template in customer's language; opens `wa.me` link.

### 15.5 Customers module

**Search & list:**
- Search bar (name, phone, email); results sorted by last activity.
- Table: customer name, phone, email, city, order count, quote count, total spend, date joined, last order date.
- **Filters:** has orders, has quotes, repeat buyers (>1 order), location (city).

**Customer 360 profile:**
- **Basic info card:** name, phone, email, city, customer since, Facebook ID (masked).
- **Engagement summary:** total orders (with revenue), total quotes (with conversion %), average order value, last order date, last quote date.
- **Order history:** sortable; link to order detail.
- **Quote history:** sortable; link to quote detail.
- **Saved addresses:** list of addresses on file.
- **Notes:** admin can add internal notes on the customer.
- **Merge duplicates:** (Phase 2) manual detection and merge.

### 15.6 Products & inventory module

**Product list:**
- Table: SKU, Arabic name, category, price, stock count, threshold, active flag, last updated, actions.
- **Filters:** active/inactive, low stock (< threshold), category.
- **Sorting:** by name, stock level, price.

**Edit product:**
- SKU, names (Arabic, French, English), description/use cases (multiline), category, price, images (upload/reorder/delete).
- Stock count: adjust with reason dropdown (restock, lost, damage, theft, correction, sale).
- Low-stock threshold; alert toggle (notify admin when stock falls below).
- Active flag (hide from public site without deleting DB record).
- Timestamp of last edit and editor name.

**Stock history:** immutable log of all stock adjustments with reason, quantity delta, admin, and timestamp.

**Bulk actions:** upload CSV to bulk-update prices, thresholds, or active status (with preview before confirm).

### 15.7 Settings (super admin only)

**Integration config:**
- WhatsApp business number (masked display, editable by super admin only).
- Meta Pixel ID (for reference).
- Facebook App ID (for reference).
- Webhook endpoints (Phase 2).

**Team management:**
- Table of staff users: email, name, role, status (active/inactive), last login date.
- **Add user:** email, name, assign role, send invite email.
- **Edit user:** change role, deactivate (soft delete; preserves history).

**System health:**
- API connectivity status (green/red + last check time).
- Database connectivity status.
- Last full backup timestamp.

**Audit log:**
- Immutable, append-only log: timestamp, admin email, action type, resource (order/quote/product/user), before/after values.
- **Filters:** by date range, admin email, action type.
- **Export:** CSV for compliance/review.

### 15.8 Notifications and alerts

- **In-app alerts:** banner for low stock on dashboard; notification badge on Orders/Quotes if new items in queue.
- **Email notifications** (Phase 2): new order received, quote response required, stock threshold alert.

### 15.9 Admin-specific journeys

1. **Morning standup:** Dashboard → review pending orders and quotes → confirm orders → contact new quotes → check low-stock alerts.
2. **Order fulfillment:** Orders → filter "confirmed" → open detail → add tracking number → mark shipped → notify customer via WhatsApp.
3. **Quote follow-up:** Quotes → kanban view → drag "new" to "contacted" → send offer via WhatsApp → mark won/lost.
4. **Inventory reconciliation:** Products → export stock list → physical count → bulk import adjustments → confirm.
5. **Customer service:** Customers → search by phone → view 360 profile → review history → add notes.

---

## 16. Edge cases and error states

### 16.1 Stock and availability

| Scenario | Behavior |
|----------|----------|
| Product goes OOS between PDP load and "Add to Cart" click | API rejects add. Toast: "This product is no longer available." Refresh PDP to show OOS badge. |
| Quantity exceeds available stock | Clamp to max available. Toast: "Only {N} available. Quantity adjusted." |
| Product deactivated by admin while in cart | On cart page load, flag item with alert: "This product is no longer available." Remove button. Block checkout if any flagged items remain. |
| Item goes OOS between cart and checkout submit | Final stock check on submit. Block: "Some items in your cart are no longer available." Return to cart with flagged items. |
| Price changed between cart add and checkout | Show updated price at checkout. Toast: "Price updated for {product}." No silent changes. |
| Stock badge display | stock > 5: "In Stock" (green). stock 1-5: "Only {N} left" (amber). stock = 0: "Out of Stock" (grey, button disabled). |

### 16.2 Cart

| Scenario | Behavior |
|----------|----------|
| Empty cart → checkout | Disable "Proceed to Checkout" button. Show empty state message. |
| Cart merge: local item now OOS | Skip item. Toast: "{product} was removed from your cart (out of stock)." |
| Cart merge: qty conflict (local vs server) | Server quantity wins. No toast (silent, user's server cart is authoritative). |
| Cart merge: price changed | Add at current price. Toast: "Price updated for {product}." |
| localStorage cleared / new device (anon) | Cart is lost. This is expected for anonymous users. |
| localStorage cleared / new device (logged in) | Server cart loads. No data loss. |

### 16.3 Checkout

| Scenario | Behavior |
|----------|----------|
| Double-click submit | Disable button on first click, show spinner. API idempotency key. If duplicate: return existing order, don't create second. |
| Network timeout on submit | Show error: "Something went wrong. Please try again." Button re-enables. Idempotency key ensures no duplicate if first request actually went through. |
| Phone number invalid | Client-side validation (Moroccan format: 06/07 prefix, 10 digits). Block submit with inline error. |
| Address too short / empty | Require minimum 10 characters. Inline validation error. |
| Session expired at checkout | Redirect to Facebook login. Preserve cart (server-side for logged in; localStorage fallback). Auto-return to checkout after re-auth. |

### 16.4 Facebook SSO

| Scenario | Behavior |
|----------|----------|
| User cancels login | Block with message: "Login is required to continue." + "Need help? Contact us on WhatsApp" link. |
| Facebook API down | Error page: "Login temporarily unavailable. Please try again in a few minutes." + WhatsApp support link. |
| No email on Facebook profile | Phone is primary contact. Email optional in profile. |
| Token expired mid-session | Re-trigger OAuth silently if possible. If not, redirect to login with cart preserved. |
| Same phone on different Facebook account | Create separate user record (by facebook_id). Flag for admin review. Don't auto-merge. |

### 16.5 Quotes

| Scenario | Behavior |
|----------|----------|
| Duplicate quote (same user, same data, within 5 min) | API returns existing quote. Toast: "You've already submitted this request. Check your quotes." |
| All fields valid but service type not selected | Block submit. Inline validation on required dropdown. |
| Very long free-text notes | Limit to 2000 characters. Show character count. |

### 16.6 Reorder

| Scenario | Behavior |
|----------|----------|
| All items still in stock | Add all to cart. Redirect to /cart. Success toast. |
| Some items now OOS | Add available items. Toast: "{N} items skipped (out of stock)." Show which items. |
| All items now OOS | Toast: "None of the items from this order are currently available." Stay on order detail page. |
| Price changed since original order | Add at current price. Toast: "Prices may have changed since your last order." |

---

## 17. Data model (summary)

### 17.1 Entity relationship

```
  ┌──────────────────┐
  │     users         │ (customers — Facebook SSO)
  │  id (bigint PK)   │
  │  uuid (UUID, idx)  │
  │  facebook_id       │
  │  name, phone       │
  │  email (optional)  │
  │  lang_pref         │
  │  created_at        │
  └──┬────┬────┬──────┘
     │    │    │
     │    │    └─────────────────────────┐
     │    │                              │
     ▼    ▼                              ▼
  ┌────────────┐  ┌────────────────┐  ┌──────────────┐
  │ addresses  │  │   carts        │  │   quotes     │
  │ user_id FK │  │ user_id FK(1:1)│  │ user_id FK   │
  │ label      │  └───┬────────────┘  │ uuid         │
  │ address    │      │               │ service_type │
  │ city       │      ▼               │ property_type│
  │ is_default │  ┌────────────────┐  │ status (enum)│
  └────────────┘  │  cart_items    │  │ order_id FK? │
                  │ cart_id FK     │  └──────────────┘
                  │ product_id FK  │
                  │ qty            │
                  └────────────────┘
     │
     ▼
  ┌────────────────┐      ┌────────────────┐
  │   orders       │      │  order_items   │
  │ user_id FK     │◄─────│ order_id FK    │
  │ uuid           │      │ product_id FK  │
  │ ref (ORD-XXXX) │      │ qty, price     │
  │ status (enum)  │      └────────────────┘
  │ address_snapshot│
  │ phone          │
  │ tracking_number│
  │ idempotency_key│
  └────────────────┘

  ┌────────────────┐      ┌────────────────┐
  │  products      │      │ product_images │
  │ uuid           │◄─────│ product_id FK  │
  │ sku            │      │ url, position  │
  │ name_ar/fr/en  │      └────────────────┘
  │ price          │
  │ stock          │
  │ threshold      │
  │ active (bool)  │
  └────────────────┘

  ┌────────────────┐      ┌────────────────┐
  │   admins       │      │  audit_log     │
  │ email, hash    │──────│ admin_id FK    │
  │ role (enum)    │      │ action, resource│
  │ active (bool)  │      │ before/after   │
  └────────────────┘      │ timestamp      │
                          └────────────────┘

  ┌────────────────┐
  │    notes       │  (polymorphic: order_id OR quote_id OR customer_id)
  │ author_id FK   │
  │ body           │
  │ target_type    │
  │ target_id      │
  └────────────────┘

  ┌────────────────┐
  │ stock_history  │
  │ product_id FK  │
  │ admin_id FK    │
  │ qty_delta      │
  │ reason (enum)  │
  │ timestamp      │
  └────────────────┘
```

### 17.2 Enums

| Enum | Values |
|------|--------|
| `order_status` | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `quote_status` | `new`, `contacted`, `offer_sent`, `won`, `lost`, `expired` |
| `admin_role` | `super_admin`, `manager`, `operator`, `viewer` |
| `stock_reason` | `restock`, `sale`, `lost`, `damage`, `theft`, `correction` |
| `language` | `ar`, `fr`, `en` |

### 17.3 ID strategy

- **Primary key:** `bigint` auto-increment (internal use only, never exposed in URLs or API responses).
- **UUID column:** indexed, unique; used in all API responses and URLs.
- **Display reference:** human-readable (e.g., `ORD-0042`, `QT-0015`); sequential, used in WhatsApp messages and customer support.

---

## 18. Security requirements

- **Customer auth:** Facebook SSO only. No password storage for customers.
- **Admin auth:** email + bcrypt-hashed password. JWT in HttpOnly secure cookie. 60-min idle timeout.
- **API scoping:** all customer-facing endpoints must scope queries by `user_id` (ownership guard). No direct object reference by sequential ID.
- **Rate limiting:** `@nestjs/throttler` on auth endpoints, checkout, and quote submission. Suggested: 5 req/min on checkout, 10 req/min on auth.
- **Input validation:** `class-validator` on all DTOs. Validate phone format, address length, quantities.
- **CORS:** restrict to `web` and `admin` origins only.
- **Helmet:** enabled on API for security headers.
- **HTTPS:** required in production.
- **Secrets:** all credentials in environment variables. Never in code or client-side.
- **COD fraud mitigation:** rate limit order creation per user (max 3 pending orders at a time). Flag accounts with high cancel rate for admin review.

---

## 19. Non-functional requirements

- **Performance:** LCP < 2.5s on mobile 4G; pagination on all admin lists (20-50 rows); search debouncing (300ms).
- **Security:** see §18.
- **Reliability:** daily database backups; API health check endpoint (`/health`); graceful error handling (no stack traces in production).
- **Observability:** structured logging (JSON); error tracking (Sentry or equivalent); API request logging with correlation IDs.
- **SEO:** sitemaps per locale; canonical URLs; hreflang tags; localized meta titles and descriptions; OG images.
- **Accessibility:** WCAG 2.1 AA for public pages; proper ARIA labels; keyboard navigation; focus management.

---

## 20. Milestones (indicative)

| Week | Deliverables |
|------|-------------|
| 1 | Monorepo setup, API skeleton, DB + migrations, web i18n shell, Facebook OAuth, admin auth shell. |
| 2 | Catalog (products CRUD), PLP/PDP, cart (localStorage + server), cart merge logic. |
| 3 | COD checkout, order lifecycle (5 statuses), customer account (orders list + detail + tracking), quotes form + pipeline. |
| 4 | Admin CRM modules (dashboard, orders, quotes, customers, products, settings), WhatsApp templates, Pixel events. |
| 5 | Reorder, saved addresses, edge cases, profile page, audit log, QA, launch checklist. |

---

## 21. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Meta → landing conversion | Baseline first, improve 20% | Pixel ViewContent vs session |
| Cart → checkout conversion | > 40% | Pixel AddToCart vs InitiateCheckout |
| Order confirmation rate | > 80% of pending orders confirmed within 24h | Admin dashboard KPI |
| Quote-to-won conversion | > 15% | Admin quote pipeline |
| Repeat purchase rate | > 10% of customers within 60 days | Customer account data |
| WhatsApp support volume for "where is my order?" | < 5/day after account launch | Manual tracking |
| Average time to confirm order | < 4 hours | Admin audit log |
| Stockout incidents | < 2/week | Low-stock alert frequency |

---

## 22. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Facebook App Review delays or API changes | Medium | High | Apply early; have fallback error page; monitor FB developer changelog. |
| SSO abandonment (users unwilling to login with Facebook) | Medium | High | Clear value prop ("track your order"); WhatsApp support link for non-FB users (manual order taking). |
| Performance degradation from heavy motion on low-end devices | Low | Medium | `prefers-reduced-motion` respect; LCP monitoring; lazy load animations. |
| RTL rendering bugs on edge devices | Medium | Medium | Test on real Arabic-locale devices; BrowserStack. |
| COD fraud (fake orders depleting stock) | Medium | Medium | Rate limit per user; max 3 pending orders; admin flagging. |
| Cart merge conflicts confusing users | Low | Low | Server wins (predictable); toast notifications for changes. |

---

## 23. Open decisions

- Stock reservation timeout: should pending orders expire after 48h? Or just flag for review?
- Meta CAPI (server-side events): Phase 2 priority?
- Admin session: allow concurrent logins or single-session only?
- WhatsApp Business API (automated messages): Phase 2 or Phase 3?
- Product categories: flat list or hierarchical? (Flat for MVP with < 10 products.)

---

## 24. Phase 2 backlog

- **Admin:** task management, call logs, custom tags, UTM display, email templates, advanced reporting, merge duplicate customers.
- **Customer:** SMS notifications, email notifications, product reviews/ratings, "customers also bought" recommendations.
- **Platform:** Meta CAPI, WhatsApp Business API (automated notifications), admin-editable WhatsApp templates, product categories, search, promotional banners.
- **Mobile:** companion admin app for order notifications and quick updates.
- **Analytics:** cohort analysis, product performance dashboard, regional sales heatmap.

---

## 25. Next deliverable

Technical Design Document (TDD): OpenAPI spec, exact DB migrations, auth sequence diagrams, deployment architecture — after PRD approval.
