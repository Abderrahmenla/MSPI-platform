# MSPI Fire Safety — UX & Page Structure Blueprint

> **Purpose:** Conversion-first UX system spec for the MSPI storefront. Designed for a UI designer agent to produce high-fidelity screens without guessing.
>
> **Context:** Tunisia-based fire safety ecommerce + quote platform. Traffic from Meta ads. Mostly mobile. COD payment. Facebook SSO gate. WhatsApp as core conversion channel. Arabic default (RTL).

---

## 0. Design System Foundation

### 0.1 Color Tokens

| Token            | Value     | Usage                                       |
| ---------------- | --------- | ------------------------------------------- |
| `brand-500`      | `#ec4130` | Primary buttons, logo accent, active states |
| `brand-400`      | `#f06a5a` | Hover states, light accents                 |
| `brand-600`      | `#d63828` | Pressed states, depth                       |
| `brand-700`      | `#b32a1f` | Dark variant, header gradients              |
| `cta-whatsapp`   | `#25D366` | WhatsApp buttons exclusively                |
| `cta-facebook`   | `#1877F2` | Facebook SSO buttons exclusively            |
| `text-primary`   | `#0a0a0a` | Headings, body text                         |
| `text-secondary` | `#525252` | Captions, metadata                          |
| `surface-white`  | `#ffffff` | Cards, modals                               |
| `surface-muted`  | `#f4f4f5` | Page backgrounds, sections                  |
| `border`         | `#e4e4e7` | Dividers, input borders                     |
| `stock-green`    | `#16a34a` | In stock badge                              |
| `stock-amber`    | `#d97706` | Low stock badge                             |
| `stock-grey`     | `#9ca3af` | Out of stock badge                          |
| `error`          | `#dc2626` | Error states (distinct from brand red)      |
| `success`        | `#16a34a` | Success toasts, confirmations               |

### 0.2 Typography

| Role            | Font        | Weight | Size (mobile / desktop) |
| --------------- | ----------- | ------ | ----------------------- |
| H1 (Hero)       | Rubik       | 700    | 28px / 48px             |
| H2 (Section)    | Rubik       | 600    | 22px / 36px             |
| H3 (Card title) | Rubik       | 600    | 18px / 24px             |
| Body            | Nunito Sans | 400    | 16px / 16px             |
| Body bold       | Nunito Sans | 600    | 16px / 16px             |
| Caption         | Nunito Sans | 400    | 14px / 14px             |
| Price           | Rubik       | 700    | 20px / 24px             |
| CTA button      | Rubik       | 600    | 16px / 16px             |

**Arabic:** Rubik has native Arabic coverage. No separate Arabic font needed. Set `font-feature-settings: "ss01"` for Arabic numerals when `lang=ar`.

### 0.3 Spacing Scale

Base: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.

### 0.4 Border Radius

- Buttons: 8px
- Cards: 12px
- Inputs: 8px
- Badges: 16px (pill)
- Modals: 16px

### 0.5 Elevation

| Level | Shadow                        | Usage                 |
| ----- | ----------------------------- | --------------------- |
| 0     | none                          | Flat elements         |
| 1     | `0 1px 3px rgba(0,0,0,0.08)`  | Cards, product tiles  |
| 2     | `0 4px 12px rgba(0,0,0,0.12)` | Dropdowns, popovers   |
| 3     | `0 8px 24px rgba(0,0,0,0.16)` | Modals, bottom sheets |

---

## 1. Navigation System

### 1.1 Mobile Header (sticky, 56px height)

```
┌─────────────────────────────────────────┐
│ [☰]  [MSPI Logo]        [🌐 AR] [🛒 2] │
└─────────────────────────────────────────┘
```

- **Left:** Hamburger menu (opens drawer)
- **Center:** MSPI logo (taps → home)
- **Right:** Language switcher (AR/FR/EN pill toggle) + Cart icon with badge count
- **Behavior:** Sticky on scroll. Background turns solid white with shadow after 8px scroll. Transparent on hero if applicable.
- **Z-index:** 100 (above all content, below modals)

### 1.2 Mobile Drawer (slide from start side — right for RTL, left for LTR)

```
┌───────────────────────────┐
│ [✕]                       │
│                           │
│  المنتجات (Products)       │
│  طلب عرض سعر (Quote)       │
│  حسابي (Account)           │
│  ──────────────            │
│  📞 WhatsApp Support       │
│  🌐 Language: AR | FR | EN │
└───────────────────────────┘
```

- Overlay scrim: 50% black
- Animation: slide-in 250ms ease-out, slide-out 200ms ease-in
- Close on scrim tap or ✕ button

### 1.3 Desktop Header (sticky, 64px height)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [MSPI Logo]    المنتجات    طلب عرض سعر    حسابي    [AR|FR|EN] [🛒 2] │
└──────────────────────────────────────────────────────────────────────┘
```

- Max-width: 1280px centered
- Logo left (RTL: right)
- Nav links center
- Language + cart right (RTL: left)
- Active link: `brand-500` underline

### 1.4 Sticky WhatsApp FAB (global, all pages)

- Position: fixed, bottom-right (RTL: bottom-left), 16px from edges
- Size: 56px circle
- Color: `#25D366` with white WhatsApp icon
- Shadow: elevation 2
- Z-index: 90
- Tap opens `wa.me` with locale-aware pre-filled message
- Default message: "مرحبا، أحتاج مساعدة" (AR) / "Bonjour, j'ai besoin d'aide" (FR) / "Hello, I need help" (EN)
- **Exception:** Hidden on checkout page (to reduce distraction)

**Why:** WhatsApp is the #1 conversion fallback for users who won't checkout online. Every page must offer this escape hatch.

---

## 2. CTA System

### 2.1 Primary CTA

- Background: `brand-500`
- Text: white, Rubik 600, 16px
- Height: 48px (mobile), 44px (desktop)
- Full-width on mobile, auto-width on desktop (min 200px)
- Border-radius: 8px
- Hover: `brand-600`
- Pressed: `brand-700`, scale(0.98) 100ms
- Disabled: opacity 0.5, cursor not-allowed
- Loading: spinner replaces text, button disabled

### 2.2 Secondary CTA (WhatsApp)

- Background: `#25D366`
- Text: white
- Same dimensions as primary
- WhatsApp icon (SVG) inline-start of text
- Used for: "Contact us on WhatsApp", "Discuss this quote"

### 2.3 Tertiary CTA

- Background: transparent
- Border: 1px `border` color
- Text: `text-primary`
- Used for: "Continue shopping", "View details"

### 2.4 Facebook SSO Button

- Background: `#1877F2`
- Text: white
- Facebook icon inline-start
- Text: "متابعة عبر فيسبوك" / "Continuer avec Facebook" / "Continue with Facebook"
- Full-width, 48px height

### 2.5 Placement Rules

| Page         | Primary CTA                    | Secondary CTA                         |
| ------------ | ------------------------------ | ------------------------------------- |
| Landing hero | "تسوق الآن" (Shop Now)         | "طلب عرض سعر" (Get Quote)             |
| PLP card     | "أضف للسلة" (Add to Cart)      | —                                     |
| PDP          | "أضف للسلة" (Add to Cart)      | "استفسر عبر واتساب" (Ask on WhatsApp) |
| Cart         | "إتمام الطلب" (Checkout)       | —                                     |
| Checkout     | "تأكيد الطلب" (Place Order)    | —                                     |
| Quote form   | "إرسال الطلب" (Submit Request) | —                                     |

---

## 3. Trust System

### 3.1 Trust Badges (reusable component)

Four horizontal badges, icon + short text:

| Badge     | Icon                | Text (AR)          | Text (FR)                       |
| --------- | ------------------- | ------------------ | ------------------------------- |
| COD       | 💵→SVG banknote     | الدفع عند الاستلام | Paiement à la livraison         |
| Delivery  | 🚚→SVG truck        | توصيل لكامل تونس   | Livraison dans toute la Tunisie |
| Certified | ✅→SVG shield-check | منتجات معتمدة      | Produits certifiés              |
| Support   | 📱→SVG phone        | دعم واتساب مباشر   | Support WhatsApp direct         |

**Layout:** Horizontal scroll on mobile (4 items), 4-column grid on desktop.
**Placement:** Below hero on landing, below price on PDP, above form on checkout.
**Style:** Muted background cards, elevation 0, icon `brand-500`, text `text-primary`.

### 3.2 Trust Messaging Rules

- **Landing page:** Trust badges appear within first viewport (above fold)
- **PDP:** Trust badges directly below price block
- **Checkout:** Mini trust strip above submit button
- **Cart:** "الدفع عند الاستلام — لا حاجة لبطاقة بنكية" (COD — no credit card needed) above checkout CTA

**Why:** Tunisian users are skeptical of online purchases. COD messaging eliminates the #1 objection immediately.

---

## 4. Pages

---

### 4.1 Landing Page (`/`)

> The most important page. This is where Meta ad traffic lands. Every pixel must earn its place.

#### Section 1: Hero

**Layout:** Full-width, min-height 85vh on mobile, 70vh on desktop.

**Background:** Diagonal gradient `#ec4130` → `#c12e24` with subtle dot pattern overlay at 5% opacity.

**Content (mobile — single column, centered):**

```
[MSPI Logo — white version, 40px]

H1: "احمِ ما يهمّك"
    (Protect What Matters)

Subtitle (Body, white, 80% opacity):
"طفايات حريق معتمدة — توصيل لكل تونس — الدفع عند الاستلام"
(Certified fire extinguishers — delivery across Tunisia — COD)

[Primary CTA: "تسوق الآن" (Shop Now)]
[Tertiary CTA: "طلب عرض سعر مجاني" (Get Free Quote) — white outline]

[Hero image: Fire extinguisher product shot,
 angled, with subtle shadow — positioned
 below CTAs on mobile, right side on desktop]
```

**Content (desktop — 2 columns):**

- Left (RTL: right): Text + CTAs
- Right (RTL: left): Product hero image

**Animation:**

- H1: fade-up 400ms ease-out
- Subtitle: fade-up 400ms, 100ms delay
- CTAs: fade-up 400ms, 200ms delay
- Image: fade-in + subtle scale from 0.95 → 1.0, 500ms

**Conversion logic:** Single clear value prop. Two paths (buy vs quote) match the two user segments (B2C vs B2B). No navigation distraction — the header is transparent over the hero.

---

#### Section 2: Trust Badges Strip

**Layout:** Directly below hero. No gap. Muted background (`surface-muted`).

**Content:** The 4 trust badges from §3.1, horizontally scrollable on mobile.

**Height:** 80px

**Conversion logic:** Immediately after the emotional hero, address rational objections. COD is the #1 trust signal for Tunisian ecommerce.

---

#### Section 3: Product Highlights

**Layout:** Section title + product cards grid.

**Title:** H2 "منتجاتنا" (Our Products), centered.

**Grid:** 2 columns mobile, 3 columns tablet, 4 columns desktop. Gap: 16px.

**Product Card:**

```
┌─────────────────────┐
│ [Product Image]      │  ← 1:1 aspect ratio
│                      │
│ طفاية بودرة 6 كغ     │  ← H3, 2 lines max, clamp
│ 85 د.ت               │  ← Price, Rubik 700, brand-500
│ [متوفر ●]            │  ← Stock badge
│                      │
│ [أضف للسلة]           │  ← Primary CTA, full width
└─────────────────────┘
```

- Card: `surface-white`, elevation 1, radius 12px
- Image: lazy-loaded, WebP, `object-fit: cover`
- Stock badge: pill shape, green/amber/grey per stock rules
- Tap card → PDP. Tap CTA → add to cart (toast confirmation).

**Conversion logic:** Show products immediately. Users from ads want to see what they clicked for. 2-col mobile means 4 products visible on first scroll.

---

#### Section 4: Use Cases

**Layout:** H2 + 3 horizontal cards (scroll on mobile, grid on desktop).

**Title:** H2 "لكل مكان... طفاية مناسبة" (For every place... the right extinguisher)

**Cards:**
| Use Case | Icon (SVG) | Title | Description |
|----------|-----------|-------|-------------|
| Car | car icon | السيارة | طفاية 1-2 كغ مثالية للسيارة |
| Home | home icon | المنزل | طفاية 6 كغ لحماية عائلتك |
| Business | building icon | المحل / المصنع | طفايات 6-9 كغ + خدمة تركيب |

**Card style:** Icon top (48px, `brand-500`), title H3, description body, tertiary CTA "اكتشف" (Explore).

**Conversion logic:** Users don't know which product to buy. This section maps use cases → products, reducing decision friction. Businesses are nudged toward the quote flow.

---

#### Section 5: How It Works

**Layout:** H2 + 3 numbered steps, horizontal on desktop, vertical on mobile.

**Title:** H2 "كيف تطلب؟" (How to order?)

**Steps:**

```
①                    ②                    ③
[cart icon]          [phone icon]         [truck icon]
اختر منتجك           أكد طلبك              استلم و ادفع
Choose your product  Confirm your order   Receive & pay

Browse our catalog   We call to confirm   Pay cash on
and add to cart.     via phone/WhatsApp.  delivery. Done.
```

**Step style:** Circle with number (brand-500 bg, white text), icon below, title H3, description caption.

**Animation:** Steps appear sequentially on scroll (stagger 150ms). Subtle fade-up.

**Conversion logic:** COD process is unfamiliar to some users. Showing the 3-step flow demystifies it and builds confidence. Step 2 (confirmation call) adds human trust.

---

#### Section 6: Quote CTA Banner

**Layout:** Full-width, brand gradient background. Centered text.

```
┌─────────────────────────────────────────┐
│                                         │
│   تحتاج تركيب أو معاينة؟                │
│   Need installation or inspection?       │
│                                         │
│   احصل على عرض سعر مجاني خلال 24 ساعة    │
│   Get a free quote within 24 hours       │
│                                         │
│   [Primary CTA: "طلب عرض سعر" (Request Quote)]  │
│   [Secondary: "أو تواصل معنا عبر واتساب"]         │
│                                         │
└─────────────────────────────────────────┘
```

**Conversion logic:** B2B users who scrolled past products need a separate conversion path. The 24-hour promise creates urgency and sets expectations.

---

#### Section 7: Social Proof / Testimonials

**Layout:** H2 + horizontal carousel (auto-scroll every 5s, manual swipe).

**Title:** H2 "ماذا يقول عملاؤنا" (What our clients say)

**Testimonial Card:**

```
┌───────────────────────┐
│ ★★★★★                 │
│                       │
│ "توصيل سريع وجودة    │
│  ممتازة. شكراً MSPI"   │
│                       │
│ — أحمد، صفاقس         │
│   Ahmed, Sfax         │
└───────────────────────┘
```

- Card: white, elevation 1, radius 12px, max-width 320px
- Stars: `brand-500`
- Quote text: Body, italicized
- Name + city: Caption, `text-secondary`
- Carousel: 1 card visible mobile, 3 desktop. Dot indicators.

**Conversion logic:** Social proof from real Tunisian cities makes the brand tangible. Stars pattern is universally understood.

---

#### Section 8: FAQ

**Layout:** H2 + accordion (collapsible items).

**Title:** H2 "أسئلة شائعة" (Frequently Asked Questions)

**Items (5-7):**

1. هل الدفع عند الاستلام فقط؟ (Is it COD only?)
2. كم مدة التوصيل؟ (What's the delivery time?)
3. هل الطفايات معتمدة؟ (Are extinguishers certified?)
4. كيف أطلب عرض سعر؟ (How do I request a quote?)
5. هل يمكنني الإرجاع؟ (Can I return?)
6. لماذا تسجيل الدخول بفيسبوك؟ (Why Facebook login?)

**Accordion behavior:**

- One item open at a time
- Chevron icon rotates 180° on toggle (200ms)
- Content area: max-height animation 250ms

**Conversion logic:** Handles remaining objections. FAQ #6 pre-empts the SSO friction at checkout. Structured data (JSON-LD) for SEO.

---

#### Section 9: Footer

```
┌─────────────────────────────────────────────────┐
│ [MSPI Logo - white]                             │
│                                                 │
│ المنتجات | طلب عرض سعر | حسابي | سياسة الخصوصية  │
│                                                 │
│ [WhatsApp icon] [Facebook icon] [Instagram icon]│
│                                                 │
│ © 2026 MSPI. جميع الحقوق محفوظة.                 │
└─────────────────────────────────────────────────┘
```

- Background: `text-primary` (#0a0a0a)
- Text: white, 80% opacity for links
- Social icons: 24px, white
- Padding: 48px vertical

---

### 4.2 Product Listing Page (`/products`)

**Header:** Sticky nav (solid, not transparent).

**Page Title:** H1 "منتجاتنا" (Our Products), left-aligned (RTL: right-aligned). Below: product count "5 منتجات".

**Sort Bar:**

```
┌─────────────────────────────────────┐
│ ترتيب حسب: [الافتراضي ▾]            │
└─────────────────────────────────────┘
```

- Dropdown: Default, Price ↑, Price ↓
- Sticky below header on mobile (z-index 90)

**Grid:** Same product card as landing §4.1 Section 3. 2-col mobile, 3-col tablet, 4-col desktop.

**Stock logic on cards:**

- `stock > 5`: Green pill "متوفر" (In Stock)
- `stock 1-5`: Amber pill "باقي {N} فقط" (Only {N} left)
- `stock = 0`: Grey pill "غير متوفر" (Out of Stock), CTA disabled, image greyscale 50%

**Empty state (no products):**

```
[empty box illustration]
"لا توجد منتجات حالياً"
(No products available right now)
[WhatsApp CTA: "تواصل معنا"]
```

**Mobile scroll:** Infinite scroll (no pagination for <10 products). Skeleton cards (3) while loading.

**Conversion logic:** Minimal UI. No filters (MVP <10 products). Sort is enough. Fast scanning, immediate add-to-cart. Low stock badge creates urgency.

---

### 4.3 Product Detail Page (`/products/[slug]`)

**Layout: Mobile (single column)**

```
┌─────────────────────────────────────┐
│ [← Back to Products]                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │     [Product Image Gallery]     │ │
│ │     Swipeable, dot indicators   │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ H1: طفاية حريق بودرة 6 كغ           │
│                                     │
│ Price: 85 د.ت                       │
│ [متوفر ● In Stock]                  │
│                                     │
│ ┌─ Trust Badges Strip ───────────┐  │
│ │ COD | Delivery | Certified     │  │
│ └────────────────────────────────┘  │
│                                     │
│ ── الوصف (Description) ──           │
│ Body text about the product.        │
│ Up to 3 paragraphs.                 │
│                                     │
│ ── حالات الاستخدام (Use Cases) ──    │
│ • السيارة                           │
│ • المنزل                            │
│ • المحلات التجارية                   │
│                                     │
│ ── Quantity + CTA ──                │
│ [ - ] [ 1 ] [ + ]                   │
│ [████ أضف للسلة ████]               │
│ [████ استفسر عبر واتساب ████]        │
│                                     │
└─────────────────────────────────────┘
```

**Layout: Desktop (2 columns)**

- Left (RTL: right): Image gallery (main + thumbnails below)
- Right (RTL: left): Title, price, stock, trust badges, description, use cases, quantity + CTAs

**Image Gallery:**

- Mobile: horizontal swipe, dot indicators, pinch-to-zoom
- Desktop: main image (560px) + thumbnail strip below (4 thumbs, click to select)
- Aspect ratio: 1:1
- Lazy load all except first image
- Skeleton: grey placeholder while loading

**Quantity Selector:**

- [-] [count] [+] inline
- Min: 1, Max: available stock
- If max reached, [+] disabled. Toast: "باقي {N} فقط" (Only {N} left)

**WhatsApp CTA message:**

```
مرحبا، أريد الاستفسار عن: طفاية حريق بودرة 6 كغ (SKU: PWD-6KG)
```

**Out of Stock state:**

- Price visible but greyed
- Stock badge: grey "غير متوفر"
- Quantity selector: hidden
- Add to Cart: hidden
- Show instead: "أعلمني عند التوفر" (Notify me) — captures phone → admin alert (Phase 2, for now just WhatsApp CTA)

**Conversion logic:** Gallery first (visual trust), then price (no surprise), then trust badges (reinforce), then description (for those who need detail), then CTA (action). WhatsApp CTA catches hesitant users who want to ask questions before buying.

---

### 4.4 Cart Page (`/cart`)

**Layout:**

```
┌─────────────────────────────────────┐
│ H1: سلة التسوق (Your Cart) — 2 items│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [img] طفاية بودرة 6 كغ          │ │
│ │       85 د.ت                    │ │
│ │       [ - ] [1] [ + ]  [🗑]     │ │
│ │       المجموع: 85 د.ت            │ │
│ ├─────────────────────────────────┤ │
│ │ [img] طفاية CO2 5 كغ            │ │
│ │       120 د.ت                   │ │
│ │       [ - ] [2] [ + ]  [🗑]     │ │
│ │       المجموع: 240 د.ت           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ المجموع الكلي: 325 د.ت          │ │
│ │ الدفع عند الاستلام 🏷           │ │
│ │                                 │ │
│ │ [████ إتمام الطلب ████]         │ │
│ │                                 │ │
│ │ ← متابعة التسوق                 │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Cart Item:**

- Image: 64x64, radius 8px
- Title: H3, single line, truncate with ellipsis
- Price: per unit
- Quantity: same selector as PDP
- Delete: trash icon, 44x44 tap target. Confirmation: "هل تريد إزالة هذا المنتج؟" (Remove this item?) with undo toast (5s).
- Subtotal: per line

**Summary Block (sticky on mobile at bottom):**

- Background: white, elevation 3
- Total: Rubik 700, 24px
- "الدفع عند الاستلام" (COD) text with banknote icon — **critical trust reinforcement**
- Primary CTA: full-width "إتمام الطلب" (Proceed to Checkout)
- Below: "متابعة التسوق" (Continue Shopping) link

**Stock validation on load:**

- API call to re-check stock for all items
- OOS item: red border on card, alert message, remove button prominent
- Price changed: inline toast per item "تم تحديث السعر" (Price updated)
- If any item flagged: Checkout CTA disabled until resolved

**Empty Cart State:**

```
[empty cart illustration — simple line art]

"سلتك فارغة"
(Your cart is empty)

"تصفح منتجاتنا واختر ما يناسبك"
(Browse our products and find what you need)

[Primary CTA: "تصفح المنتجات" (Browse Products)]
```

**Conversion logic:** Sticky summary bar means the total and checkout CTA are always visible on mobile. COD label removes payment anxiety. Stock re-validation prevents checkout failures. Undo on delete prevents accidental loss.

---

### 4.5 Checkout Page (`/checkout`) — CRITICAL

#### Step 0: Facebook SSO Gate

**Trigger:** User taps "إتمام الطلب" from cart. If not authenticated → show gate.

**Layout:**

```
┌─────────────────────────────────────┐
│                                     │
│ [MSPI Logo]                         │
│                                     │
│ H2: "سجّل دخولك لإتمام الطلب"       │
│     (Log in to complete your order)  │
│                                     │
│ Body: "نستخدم فيسبوك لتأكيد          │
│  هويتك وحماية طلبك. لن ننشر         │
│  أي شيء على حسابك."                 │
│  (We use Facebook to verify your     │
│   identity and protect your order.   │
│   We will never post on your account.)│
│                                     │
│ [████ متابعة عبر فيسبوك ████]        │
│                                     │
│ ── أو ──                             │
│                                     │
│ [WhatsApp CTA: "اطلب عبر واتساب"]    │
│                                     │
│ Trust icons: 🔒 لن ننشر على حسابك    │
│              📱 فقط لتأكيد هويتك      │
│                                     │
└─────────────────────────────────────┘
```

**Conversion logic:** This is the highest-friction moment. The copy must:

1. Explain WHY Facebook login is required (trust/protection, not data harvesting)
2. Promise no posting (addresses the #1 fear)
3. Offer WhatsApp as a fallback (catches users who refuse SSO)
4. Keep the cart summary visible above (remind them what they're buying)

**Error: SSO cancelled:**

```
"تسجيل الدخول مطلوب لإتمام الطلب"
(Login is required to complete your order)

"هل تحتاج مساعدة؟"
(Need help?)

[WhatsApp CTA]   [إعادة المحاولة (Try Again)]
```

**Error: Facebook API down:**

```
"تسجيل الدخول غير متاح حالياً — يرجى المحاولة بعد قليل"
(Login temporarily unavailable — please try again shortly)

[WhatsApp CTA: "اطلب عبر واتساب بدلاً من ذلك"]
(Order via WhatsApp instead)
```

#### Step 1: Checkout Form

**Layout (single page, no multi-step):**

```
┌─────────────────────────────────────┐
│ H1: إتمام الطلب (Checkout)           │
│                                     │
│ ── معلومات التوصيل ──                │
│                                     │
│ الاسم (Name)*                        │
│ [Ahmed Ben Ali          ] ← prefilled│
│                                     │
│ الهاتف (Phone)*                      │
│ [+216 __________ ] ← inputmode=tel  │
│                                     │
│ ── العنوان ──                        │
│                                     │
│ [▾ اختر عنوان محفوظ] ← if returning │
│   └ 🏠 المنزل — شارع الحبيب...       │
│   └ 🏢 العمل — نهج محمد الخ...        │
│   └ ＋ عنوان جديد                    │
│                                     │
│ العنوان (Address)*                   │
│ [________________________]           │
│                                     │
│ المدينة (City)*                      │
│ [▾ اختر المدينة    ]                 │
│                                     │
│ ملاحظات (Notes)                      │
│ [________________________]           │
│ "مثال: الطابق 3، باب يسار"           │
│                                     │
│ ── ملخص الطلب ──                     │
│ طفاية بودرة 6 كغ × 1     85 د.ت     │
│ طفاية CO2 5 كغ × 2      240 د.ت     │
│ ─────────────────────────           │
│ المجموع: 325 د.ت                    │
│ الدفع: عند الاستلام                  │
│                                     │
│ [Trust strip: COD + Certified]       │
│                                     │
│ [████ تأكيد الطلب ████]              │
│                                     │
└─────────────────────────────────────┘
```

**Form Behavior:**

- Name: prefilled from Facebook profile, editable
- Phone: required, `inputmode="tel"`, `+216` prefix, 8-digit validation
- Saved addresses: dropdown for returning customers (last used = default). "New address" option expands fields.
- City: dropdown (predefined list of Tunisian cities)
- Notes: optional, helper text with example
- All labels visible (not placeholder-only)
- Validation: on blur, errors below field in `error` color
- Required fields marked with `*`

**Order Summary:**

- Always visible (on mobile, above the submit button)
- Line items with qty × price
- Total prominent
- "الدفع: عند الاستلام" repeated

**Submit behavior:**

1. Button shows spinner
2. API validates stock (final check)
3. If stock issue → toast error, return to cart
4. If success → confirmation page
5. Idempotency key prevents duplicate orders

**Conversion logic:** Single-page checkout (no multi-step). Prefilled data reduces typing. Saved addresses for returning customers eliminate the #1 friction point. Order summary visible at all times removes "hidden cost" anxiety. Trust strip above submit is the last reassurance.

#### Step 2: Confirmation Page

```
┌─────────────────────────────────────┐
│                                     │
│ [✓ checkmark animation — green]     │
│                                     │
│ H1: "تم تسجيل طلبك بنجاح!"          │
│     (Order placed successfully!)     │
│                                     │
│ رقم الطلب: ORD-1234                 │
│ Order reference: ORD-1234            │
│                                     │
│ ── ملخص ──                          │
│ طفاية بودرة 6 كغ × 1     85 د.ت     │
│ طفاية CO2 5 كغ × 2      240 د.ت     │
│ المجموع: 325 د.ت                    │
│                                     │
│ ── الخطوات القادمة ──                │
│ ① سنتصل بك لتأكيد الطلب             │
│ ② تحضير وشحن طلبك                   │
│ ③ الاستلام والدفع نقداً               │
│                                     │
│ [تتبع طلبك (Track Order)]           │
│ [مشاركة عبر واتساب (Share on WA)]    │
│                                     │
│ [متابعة التسوق (Continue Shopping)]   │
│                                     │
└─────────────────────────────────────┘
```

**Animation:** Checkmark draws in (SVG line animation, 500ms). Confetti optional (subtle, 3-4 particles only).

**Meta Pixel:** Fire `Purchase` event with `content_ids`, `value`, `currency: "TND"`.

---

### 4.6 Quote Page (`/devis`)

#### SSO Gate

Same as checkout SSO gate (§4.5 Step 0), but copy changes:

- "سجّل دخولك لإرسال طلب عرض السعر" (Log in to submit your quote request)

#### Quote Form

**Design principle:** Progressive disclosure. Show only what's needed.

```
┌─────────────────────────────────────┐
│ H1: طلب عرض سعر مجاني               │
│     (Request a Free Quote)           │
│                                     │
│ Subtitle: "املأ النموذج وسنتواصل     │
│  معك خلال 24 ساعة عبر واتساب"        │
│ (Fill the form, we'll contact you    │
│  within 24h via WhatsApp)            │
│                                     │
│ ── معلوماتك ──                       │
│                                     │
│ الاسم (Name)*                        │
│ [Ahmed Ben Ali          ] ← prefilled│
│                                     │
│ الهاتف (Phone)*                      │
│ [+216 __________ ]                   │
│                                     │
│ المدينة (City)*                      │
│ [▾ اختر المدينة    ]                 │
│                                     │
│ ── تفاصيل الطلب ──                   │
│                                     │
│ نوع الخدمة (Service Type)*           │
│ [▾ تركيب | معاينة | إعادة شحن | أخرى]│
│                                     │
│ نوع العقار (Property Type)*          │
│ [▾ سكني | تجاري | صناعي]            │
│                                     │
│ ── تفاصيل إضافية ── (collapsed)      │
│ [▾ Show more details]                │
│                                     │
│   المساحة أو عدد الغرف               │
│   [__________ م² / غرف]             │
│                                     │
│   معدات كهربائية؟                    │
│   [○ نعم  ● لا]                     │
│                                     │
│   ملاحظات إضافية                     │
│   [________________________]         │
│                                     │
│ ┌─ Trust message ─────────────────┐  │
│ │ 🔒 معلوماتك آمنة ولن يتم مشاركتها│  │
│ │    مع أي طرف ثالث                │  │
│ └─────────────────────────────────┘  │
│                                     │
│ [████ إرسال طلب عرض السعر ████]      │
│                                     │
└─────────────────────────────────────┘
```

**Progressive disclosure:**

- Step 1 (always visible): Name, phone, city, service type, property type
- Step 2 (collapsed, "تفاصيل إضافية"): Surface area, electrical equipment toggle, notes
- This reduces perceived form length from 8 fields to 5

**Confirmation page after submit:**

```
┌─────────────────────────────────────┐
│ [✓]                                 │
│                                     │
│ H2: "تم إرسال طلبك بنجاح!"          │
│     (Request submitted!)             │
│                                     │
│ رقم الطلب: QT-0042                  │
│                                     │
│ "سنتواصل معك خلال 24 ساعة عبر واتساب"│
│                                     │
│ [WhatsApp CTA: "تواصل معنا الآن"]    │
│    ↑ Pre-filled with quote ref       │
│                                     │
│ [تصفح المنتجات (Browse Products)]    │
│                                     │
└─────────────────────────────────────┘
```

**Meta Pixel:** Fire `Lead` event.

**Conversion logic:** Progressive disclosure makes the form feel short. Trust message before submit. WhatsApp handoff on confirmation gives the user a tangible next step.

---

### 4.7 Customer Account (`/account`)

#### Dashboard (`/account`)

```
┌─────────────────────────────────────┐
│ H1: مرحبا أحمد (Hello Ahmed)        │
│ Connected via Facebook ✓             │
│                                     │
│ ┌──────────┐ ┌──────────┐           │
│ │ 📦 3      │ │ 📋 1      │           │
│ │ طلبات     │ │ عروض أسعار│           │
│ │ Orders    │ │ Quotes   │           │
│ └──────────┘ └──────────┘           │
│                                     │
│ ── آخر الطلبات ──                    │
│ [Order card: ORD-1234, pending...]   │
│ [Order card: ORD-1230, delivered]    │
│                                     │
│ [عرض الكل (View All)]               │
│                                     │
│ ── إجراءات سريعة ──                  │
│ [تصفح المنتجات]  [طلب عرض سعر]       │
│                                     │
└─────────────────────────────────────┘
```

#### Orders List (`/account/orders`)

**Card per order:**

```
┌─────────────────────────────────────┐
│ ORD-1234        28 مارس 2026         │
│ طفاية بودرة 6 كغ × 1 + 1 منتج آخر   │
│ 325 د.ت                             │
│ [● قيد التأكيد]  ← status badge     │
│                     [إعادة الطلب ↻]  │
└─────────────────────────────────────┘
```

#### Order Detail (`/account/orders/[uuid]`)

**Timeline stepper:**

```
● تم الطلب ─── ○ مؤكد ─── ○ تم الشحن ─── ○ تم التوصيل
  28 مارس
```

- Active step: filled circle `brand-500`
- Completed: filled circle `success`
- Future: empty circle `border`
- Cancelled: `error` color with cross icon

**Below timeline:** Order items, total, delivery address, tracking number (if shipped).

**Reorder button:** "إعادة الطلب" — adds all items to cart with stock validation (per §16.6 edge cases).

#### Quotes List (`/account/quotes`)

Similar card layout with status badges: new (blue), contacted (amber), offer_sent (purple), won (green), lost (grey).

**Empty state:**

```
"لم تقم بطلب عرض سعر بعد"
(No quote requests yet)

[طلب عرض سعر مجاني (Request Free Quote)]
```

#### Profile (`/account/profile`)

- Editable: name, phone, email (optional)
- Language preference: AR/FR/EN toggle
- Saved addresses: list with edit/delete, add new
- Facebook badge: "متصل عبر فيسبوك ✓" (non-editable)

---

## 5. Mobile-First Behavior

### 5.1 Thumb Zone Map

```
┌─────────────────────┐
│                     │  ← Hard to reach (navigation, logo)
│                     │
│                     │  ← OK zone (content, scrolling)
│                     │
│                     │
│ ████████████████████│  ← Easy zone (CTAs, quantity, tabs)
│ ████████████████████│  ← Sticky bars go HERE
└─────────────────────┘
```

**Rules:**

- All primary CTAs in bottom 1/3 of screen
- Cart summary: sticky bottom bar on cart + checkout
- WhatsApp FAB: bottom corner (easy reach)
- Navigation: top (acceptable — infrequent interaction)
- Delete/destructive actions: NOT in easy zone (prevent accidents)

### 5.2 Scroll Behavior

| Page     | Behavior                                                                      |
| -------- | ----------------------------------------------------------------------------- |
| Landing  | Free vertical scroll. Sections load with subtle fade-up on intersection.      |
| PLP      | Free scroll. Sort bar sticky below header.                                    |
| PDP      | Free scroll. CTA bar sticky at bottom when "Add to Cart" scrolls out of view. |
| Cart     | Summary bar sticky at bottom.                                                 |
| Checkout | Submit button sticky at bottom. Form scrolls freely.                          |
| Quote    | Submit button sticky at bottom.                                               |

### 5.3 Sticky Elements Stack (bottom-up)

```
[WhatsApp FAB] — z-index 90, always visible (except checkout)
[Sticky CTA bar] — z-index 80, page-specific
[Content]
[Sticky sort bar] — z-index 70, PLP only
[Header] — z-index 100, always on top
```

### 5.4 Load Perception

| Element          | Strategy                                          |
| ---------------- | ------------------------------------------------- |
| Product images   | Skeleton (grey rectangle, pulse animation) → WebP |
| Product cards    | Skeleton card (3 per row) → Real cards            |
| Text content     | No skeleton (instant from SSR)                    |
| Gallery images   | Blur-up placeholder → Full resolution             |
| Form submission  | Button spinner → Success screen                   |
| Page transitions | Instant (Next.js prefetch on link hover/viewport) |

---

## 6. RTL Considerations

### 6.1 Layout Mirroring

| Element          | LTR           | RTL                           |
| ---------------- | ------------- | ----------------------------- |
| Text alignment   | left          | right                         |
| Flex direction   | row           | row-reverse (via `dir="rtl"`) |
| Drawer slide     | from left     | from right                    |
| Back arrow       | ←             | →                             |
| Chevron (expand) | →             | ←                             |
| Progress stepper | left→right    | right→left                    |
| Price alignment  | right of name | left of name                  |
| WhatsApp FAB     | bottom-right  | bottom-left                   |

### 6.2 Implementation

- Set `dir="rtl"` on `<html>` when `locale === "ar"`
- Use CSS logical properties: `margin-inline-start` not `margin-left`
- Tailwind: use `rtl:` variant where needed
- Icons that imply direction (arrows, chevrons) must flip. Symmetric icons (cart, phone, trash) do NOT flip.

### 6.3 Mixed Language Handling

- Product names exist in all 3 languages (DB fields: `name_ar`, `name_fr`, `name_en`)
- Numbers: always Western Arabic numerals (0-9) for prices and quantities in all locales
- Phone numbers: always LTR within RTL context (`dir="ltr"` on phone inputs)
- Currency: "د.ت" (TND) — always after the number in Arabic, before in French

### 6.4 Font Behavior

- Rubik supports Arabic natively — same font across all locales
- Line height for Arabic: 1.7 (slightly taller than Latin 1.5) for diacritics
- Min font size: 16px body (prevents iOS auto-zoom and ensures Arabic readability)

---

## 7. Edge & State Design

### 7.1 Empty States

| State              | Visual             | Message                   | CTA                     |
| ------------------ | ------------------ | ------------------------- | ----------------------- |
| Empty cart         | Line-art empty box | "سلتك فارغة"              | "تصفح المنتجات" → PLP   |
| No orders          | Line-art package   | "لا توجد طلبات بعد"       | "تسوق الآن" → PLP       |
| No quotes          | Line-art clipboard | "لم تقم بطلب عرض سعر بعد" | "طلب عرض سعر" → /devis  |
| No products (PLP)  | Line-art shelf     | "لا توجد منتجات حالياً"   | "تواصل معنا" → WhatsApp |
| No saved addresses | Line-art map pin   | "لا توجد عناوين محفوظة"   | "أضف عنوان" → form      |

**Style:** Centered, grey line-art illustration (64px), text `text-secondary`, CTA primary button.

### 7.2 Error States

| Error                  | Trigger                        | Message                          | Recovery                      |
| ---------------------- | ------------------------------ | -------------------------------- | ----------------------------- |
| SSO cancelled          | User cancels Facebook popup    | "تسجيل الدخول مطلوب"             | Retry button + WhatsApp       |
| SSO API down           | Facebook unavailable           | "تسجيل الدخول غير متاح حالياً"   | WhatsApp order fallback       |
| Stock gone at checkout | Final validation fails         | "بعض المنتجات لم تعد متوفرة"     | Return to cart, flagged items |
| Price changed          | Stock check reveals change     | Inline toast per item            | User acknowledges, continues  |
| Network error          | API unreachable                | "حدث خطأ — يرجى المحاولة لاحقاً" | Retry button                  |
| Form validation        | Required field empty / invalid | Red border + message below field | Auto-focus first error field  |
| Duplicate order        | Idempotency key match          | Show existing order confirmation | Link to order detail          |
| Cart item deactivated  | Admin deactivated product      | Red alert on item in cart        | Remove button, block checkout |

### 7.3 Loading States

| Element         | Loading Pattern                             | Duration Threshold |
| --------------- | ------------------------------------------- | ------------------ |
| Product cards   | Skeleton cards (pulse)                      | Immediate          |
| Product images  | Grey placeholder → blur-up → sharp          | Immediate          |
| Page navigation | Top progress bar (thin, brand-500)          | 200ms delay        |
| Form submit     | Button spinner, disabled                    | Immediate          |
| Cart operations | Optimistic UI (instant) + rollback on error | —                  |
| Gallery images  | Skeleton → image                            | Immediate          |

### 7.4 Disabled States

| Element            | When                  | Visual                                            |
| ------------------ | --------------------- | ------------------------------------------------- |
| Add to Cart button | Stock = 0             | Opacity 0.5, cursor not-allowed, grey bg          |
| Checkout button    | Flagged items in cart | Opacity 0.5, tooltip "أزل المنتجات غير المتوفرة"  |
| Quantity [+]       | At max stock          | Opacity 0.3                                       |
| Quantity [-]       | At 1                  | Opacity 0.3                                       |
| Submit button      | During API call       | Spinner, disabled                                 |
| Reorder button     | All items OOS         | Opacity 0.5, tooltip "المنتجات غير متوفرة حالياً" |

---

## 8. Meta Pixel Event Map

| Event              | Trigger            | Parameters                                                                  |
| ------------------ | ------------------ | --------------------------------------------------------------------------- |
| `PageView`         | Every page load    | —                                                                           |
| `ViewContent`      | PDP load           | `content_type: "product"`, `content_ids: [sku]`, `value`, `currency: "TND"` |
| `AddToCart`        | Add to cart click  | Same as ViewContent + `quantity`                                            |
| `InitiateCheckout` | Checkout page load | `value` (cart total), `num_items`                                           |
| `Lead`             | Quote form submit  | `content_name: service_type`                                                |
| `Purchase`         | Order confirmation | `value`, `currency: "TND"`, `content_ids`, `num_items`                      |

---

## 9. Responsive Breakpoints

| Name    | Width       | Layout Changes                                   |
| ------- | ----------- | ------------------------------------------------ |
| Mobile  | 0–639px     | Single column, hamburger nav, 2-col product grid |
| Tablet  | 640–1023px  | 2-col layouts, 3-col product grid, visible nav   |
| Desktop | 1024–1279px | Full nav, 4-col product grid, side-by-side PDP   |
| Wide    | 1280px+     | Max-width 1280px container, centered             |

---

## 10. Accessibility Checklist

- [ ] Color contrast ≥ 4.5:1 on all text (verified for brand-500 on white: 4.6:1 ✓)
- [ ] All interactive elements: min 44×44px tap target
- [ ] Focus rings: 3px `brand-500` outline on all focusable elements
- [ ] Skip to main content link (hidden, visible on Tab)
- [ ] All images: meaningful `alt` text (product name + type)
- [ ] Form fields: visible labels, error messages with `aria-live`
- [ ] Respect `prefers-reduced-motion`: disable animations, use instant transitions
- [ ] Heading hierarchy: H1 → H2 → H3, no skips
- [ ] Language attribute: `lang="ar"` / `lang="fr"` / `lang="en"` on `<html>`
- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`
