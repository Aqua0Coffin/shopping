# Sakhy Ecommerce — Build Context

Load this before writing any code, schema, or UI for the Sakhy project. It fixes the tech stack, data model, and design tokens so every agent session builds toward the same architecture instead of drifting.

## 1. Project Summary

Sakhy is a premium heritage-saree ecommerce brand. Vibe: **ethereal, heritage, editorial-luxury** — not a generic template look. Scale: **~100 customers/month** (low traffic, high order value). Priorities in order: **correctness of inventory/payments > design fidelity > speed of shipping > future scale.**

The `Reference` folder contains the definitive design language and UI/UX implementation that we are migrating to Sakhy. The entire UI/UX should be migrated from the `Reference` project to `Sakhy`. We will port its layout, components, and DOM structure, adapting them to work with Sakhy's Next.js app router and data models.

## 2. Design Tokens (do not invent new ones — extend these)

```css
/* Sakhy palette */
--background: oklch(0.982 0.005 85);        /* #FAF9F6 */
--foreground: oklch(0.18 0 0);               /* #111111 */
--ink: oklch(0.18 0 0);
--ink-muted: oklch(0.45 0 0);                /* ~#555555 */
--card: oklch(1 0 0);
--card-foreground: oklch(0.18 0 0);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.18 0 0);
--primary: oklch(0.18 0 0);
--primary-foreground: oklch(0.98 0 0);
--secondary: oklch(0.96 0.006 85);
--secondary-foreground: oklch(0.18 0 0);
--muted: oklch(0.96 0.006 85);
--muted-foreground: oklch(0.45 0 0);
--accent: oklch(0.75 0.09 78);               /* gold */
--accent-foreground: oklch(0.18 0 0);
--gold: oklch(0.75 0.09 78);                 /* #C9A66B */
--gold-soft: oklch(0.88 0.05 82);
--destructive: oklch(0.577 0.245 27.325);
--destructive-foreground: oklch(0.98 0 0);
--border: oklch(0.94 0.003 85);              /* #EEEEEE-ish */
--input: oklch(0.94 0.003 85);
--ring: oklch(0.75 0.09 78);
```

**Update, approved:** We are fully migrating the UI/UX from the `Reference` folder project into `Sakhy`. The reference is the source of truth for layout, design, components, and typography.

Typography: **Playfair Display** (serif, display/headings) and **Inter** (sans, body/UI). Self-host via `next/font`, not a Google Fonts CDN `<link>`.

Motion language to reimplement as reusable components (not copy-pasted DOM): entrance loader, letter-rise text reveal, infinite marquee, testimonial carousel, scroll fade-ins. The custom cursor is **desktop-only, progressively enhanced** — never `cursor: none` on touch/mobile viewports.

## 3. Tech Stack (fixed — do not swap without flagging it back)

| Layer | Choice | Why |
|---|---|---|
| Frontend + backend | Next.js 15 (App Router), TypeScript | One deployable app for storefront, admin, and API routes; SSR/ISR for SEO. No separate backend needed at this scale. |
| Styling | Tailwind CSS + the tokens above as theme extension | Consistent editorial look, fast to generate. |
| Animation | Framer Motion | Replaces hand-rolled scroll/marquee JS. |
| Database | PostgreSQL (Supabase or Neon) | Relational integrity for orders/stock/payments; Supabase adds auth/storage/RLS for a small team. |
| ORM | Prisma | Type-safe schema as single source of truth. |
| Auth | NextAuth (Auth.js) or Supabase Auth — roles: `customer`, `admin`, optional `staff` | Server-side role checks only, never trust a client-side flag. |
| Images | Supabase Storage or Cloudinary | Saree photography is heavy; need resizing + CDN, not raw uploads. |
| Payments | Razorpay (India-first: UPI/cards/netbanking/wallets) | Stripe only if international orders become a near-term goal. Never roll custom payment logic. |
| Email | Resend or Postmark | Order confirmations, shipping updates, low-stock alerts. |
| Hosting | Vercel (app) + managed Postgres | Cost-efficient at 100 orders/month, scales without re-architecture. |
| Monitoring | Vercel Analytics + Sentry | Catch checkout/payment errors early. |

**Approved deviation:** rate limiting (checkout initiation, webhook receiver, admin login, newsletter) is implemented as a **durable Postgres-backed limiter** (a `rate_limit_buckets` table), not Upstash Redis as originally specified in Section 7. This was approved during Phase 3 — at 100 orders/month the overhead is negligible and it avoids adding a separate vendor. Do not "fix" this back to Redis without a reason; treat Postgres-backed rate limiting as the current spec.

**Prisma 7 + Supabase connection config (do not "fix" this either):** Prisma ORM v7 removed `directUrl` from `schema.prisma`'s datasource block. CLI commands (migrate, studio) read `datasource.url` in `prisma.config.ts`, which must point to `DIRECT_URL` (Supabase pooler, session mode, port 5432) — not `DATABASE_URL` (transaction mode, port 6543, `pgbouncer=true`), which the CLI cannot run migrations through. The running app's Prisma Client (`lib/prisma.ts`) uses `DATABASE_URL` via `@prisma/adapter-pg` separately and correctly stays on the pooled connection. These are two independent configs in v7, not one datasource block with two URL fields.

**Explicitly out of scope right now:** microservices, Kubernetes, a separate mobile app, custom CMS, multi-region infra, message queues. Keep the schema/API clean enough that a queue could be bolted on later, but don't build one now. If a task seems to require any of these, stop and flag it rather than adding it.

## 4. Information Architecture

**Storefront:** Home (hero, collections, heritage story, featured products, weaves/craft story, process, testimonials, newsletter — now data-driven, not hardcoded) → Collection/category listing (filter by fabric, occasion, color, price) → Product detail (images/zoom, variant selection, stock status, add-to-cart) → Cart → Checkout (address → shipping → Razorpay → confirmation) → Order tracking/history → static pages (Heritage/About, Care Guide, Shipping & Returns, Contact).

**Admin panel** (`/admin`, role-gated): Dashboard (recent orders, revenue snapshot, low-stock alerts) · Products (CRUD, variants, images, draft/publish) · Inventory (stock per SKU, manual adjustment + audit log, low-stock thresholds) · Orders (filter by status, detail, fulfillment update, refund trigger) · Customers (list + order history) · Settings (shipping rates, tax/GST, homepage content blocks so non-technical staff can edit copy without a redeploy). Discounts/coupons are v1.1, not required now.

## 5. Core Data Model

```
User           id, email, passwordHash/oauth, role[customer|admin|staff], addresses[]
Address        id, userId, line1, line2, city, state, pincode, phone, isDefault
Category       id, name, slug, description
Product        id, name, slug, description, categoryId, fabricType, occasion,
                status[draft|published|archived], basePrice, createdAt
ProductVariant id, productId, sku, color, blouseIncluded, borderType, price,
                images[], weightGrams
Inventory      id, variantId, stockQty, reservedQty, lowStockThreshold, updatedAt
InventoryLog   id, variantId, changeQty, reason[restock|sale|adjustment|return],
                actorId, createdAt
Order          id, userId, status[pending|paid|processing|shipped|delivered|
                cancelled|refunded], subtotal, shipping, tax, total, addressId, createdAt
OrderItem      id, orderId, variantId, quantity, priceAtPurchase
Payment        id, orderId, provider[razorpay], providerOrderId, providerPaymentId,
                status[created|authorized|captured|failed|refunded], amount,
                signatureVerified(bool), rawPayload
Coupon         id, code, type[flat|percent], value, expiresAt   (v1.1, not required yet)
Testimonial    id, customerName, quote, location, imageUrl, isPublished,
                sortOrder, createdAt
```

`Testimonial` exists so homepage social proof is admin-editable per the Section 4 "homepage content blocks" requirement — never hardcode testimonials into a static file, even though the reference `index.html` did.

**Non-negotiable rules — enforce these in every relevant code path:**
- Stock never goes negative. Decrement `stockQty` inside a **database transaction** at order confirmation, not at "add to cart."
- Briefly reserve stock (`reservedQty`) at checkout initiation to stop two customers buying the last piece at once; release the reservation if payment isn't completed within a timeout window.
- Payment status changes come only from **verified Razorpay webhook signatures** — never from the client-side redirect alone.
- Every inventory change (manual or sale-driven) writes an `InventoryLog` row — this is a high-value-item audit trail the client will expect.
- Prices at checkout are re-validated server-side against the current DB price, never trusted from client state.
- All monetary values (`basePrice`, `ProductVariant.price`, `Order`/`OrderItem`/`Payment` amounts) are stored as **integer paise**, never `Decimal`/`Float` rupees — this matches Razorpay's own API, which expects amounts in paise, and avoids floating-point rounding errors on money. Convert to rupees only at the display layer.

## 6. Non-Functional Requirements

- **Performance:** ISR/SSG for product and category pages; responsive `srcset` images via CDN; Lighthouse performance >85 on product pages.
- **Accessibility:** respect `prefers-reduced-motion`; keyboard navigation works everywhere; alt text on all product images.
- **Security:** server-side role checks on every admin route; rate-limit checkout/payment endpoints; sanitize all input; never store raw card data (Razorpay owns PCI scope).
- **Maintainability:** component-driven architecture — shared `Button`, `ProductCard`, `PriceTag`, `SectionHeading` built on the tokens in Section 2, so content can eventually be edited without touching code.

## 7. Security Requirements (mandatory — not optional hardening for "later")

Treat every item below as a build requirement, same weight as the inventory/payment rules in Section 5. This is an ecommerce site handling real payments and customer PII (addresses, phone numbers) — security is not a v1.1 feature.

**SQL / injection**
- All database access goes through Prisma's query builder. Never use `$queryRawUnsafe` or string-concatenated SQL. If raw SQL is ever unavoidable, use `$queryRaw` with tagged-template parameterization only.
- Validate and parse every API route's input with a schema library (Zod) at the boundary, before it touches any query — reject unknown/malformed fields rather than passing them through.
- If Supabase's auto-generated REST/GraphQL API is exposed at all, lock it down with **Row Level Security (RLS) policies** on every table — a customer's Supabase session must never be able to read another customer's orders, addresses, or payment records directly. This is the most common real-world Supabase misconfiguration; verify RLS on `Order`, `Address`, `Payment`, and `User` explicitly before launch.

**DDoS / abuse**
- Vercel's edge network absorbs generic volumetric traffic by default — this is not something to build yourself. Don't reinvent it.
- Rate-limit the endpoints that are actually expensive or abusable: login, checkout/payment initiation, the Razorpay webhook receiver, and any public form (newsletter, contact). Use a durable, request-surviving store keyed by IP + route — this project uses a Postgres-backed `rate_limit_buckets` table (see Section 3); an in-memory counter does not survive across serverless invocations and must never be used.
- Lock out or exponentially back off repeated failed admin login attempts specifically — the admin panel is the highest-value target on this site.
- If abuse becomes a real problem later, Cloudflare can sit in front of Vercel for additional bot/DDoS filtering — not required at launch, worth knowing as a lever.

**Auth & session**
- Sessions via httpOnly, secure, SameSite cookies — never store tokens in localStorage/sessionStorage.
- Admin and customer auth are logically separate even if the same provider (NextAuth/Supabase Auth) issues both — every admin route re-checks role server-side on each request, never trusts a client-side flag or a role embedded in an unverified JWT claim.
- Short-lived access tokens with refresh rotation, not long-lived static sessions, especially for admin.

**Payments**
- Razorpay owns PCI scope — the app never touches, logs, or stores raw card details.
- Every payment status change comes only from a **verified webhook signature** (per Section 5) — treat unverified webhook calls as hostile input, not trusted events.
- Webhook handlers are idempotent — a retried webhook must not double-fulfill an order or double-decrement stock.

**Input & file handling**
- Validate every admin image upload for file type and size server-side (not just client-side) before it reaches storage; never trust the client-reported MIME type alone — check magic bytes.
- Generate the stored filename server-side (e.g. a UUID + the extension derived from the detected file type), never from the client-supplied original filename — prevents path traversal and filename-collision overwrites.
- Enforce the max upload size against the actual bytes read from the stream, not just the `Content-Length` header — the header can be absent or spoofed.
- Sanitize any user-generated text (reviews, contact form messages, if added later) before storage or render, to prevent stored XSS.

**Transport & headers**
- HTTPS enforced everywhere, no mixed content.
- Set standard security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options / frame-ancestors) via `next.config.js` or middleware.

**Secrets & dependencies**
- All API keys (Razorpay, Resend, Supabase service role key, etc.) live in environment variables, never in client-side bundles or committed to the repo.
- The Supabase **service role key** in particular must only ever be used server-side — if it reaches the browser, RLS is meaningless.
- Keep dependencies patched (Dependabot or equivalent); commit the lockfile.

**Monitoring**
- Sentry (already in the stack per Section 3) should be configured to flag repeated auth failures and payment-verification failures, not just unhandled exceptions — these are the signals that show an attack is happening, not just a bug.

## 8. Available Agent Tooling — Use These Proactively

- **Context7 (MCP)**: query for current, version-specific documentation before writing or debugging any code involving a library/framework API — especially fast-moving ones (Next.js App Router, Prisma, NextAuth). This directly targets the failure mode that caused the earlier NextAuth v4-vs-v5 confusion in this project (an agent applying v5 patterns — a bare `auth()` call — to a v4 codebase, purely from training-data assumptions). Use it before assuming an API shape rather than after something breaks; don't wait to be asked.
- **React Doctor**: run after building or modifying any React component surface (`npx react-doctor@latest`, or its agent-skill form) — scans for anti-patterns (unnecessary `useEffect`s, accessibility issues, prop drilling instead of composition) and gives a 0–100 health score. Known limitation: some rules have real false-positive rates on idiomatic patterns (e.g. misfiring on certain `useRef` usage or i18n/translation components) — treat findings as leads to investigate, not instructions to blindly auto-fix.
- **React Scan**: use for targeted performance passes — detects unnecessary re-renders. Not needed after every phase; run it as part of pre-launch performance verification, or when a specific page feels sluggish.

## 9. Pre-Launch Checklist (deferred items — do not treat as done until closed)

- **Razorpay integration is not yet wired up.** Payment/checkout logic, stock reservation, and webhook idempotency were built and tested against a mocked Razorpay client (see the Phase 3 concurrency test), not a real account. Test-mode API keys need to be generated and added to the environment before checkout, webhooks, or refunds can be genuinely verified — see Section 3 for the intended provider. This must be done, in test mode at minimum, before Phase 4c's refund flow can be considered verified, and switched to live-mode keys (requires KYC) only immediately before public launch.
- Track any other phase/feature marked "code-complete but unverified due to a blocker" here as it comes up, so deferred verification isn't lost by the time launch approaches.

## 10. How to Use This Skill in a Task

1. Before generating any code, confirm the task against Sections 3 (stack) and 5 (schema) — don't introduce a new library, database, or model shape without checking here first.
2. For any UI work, pull colors/type/motion from Section 2 rather than picking new ones.
3. For any feature touching stock or money, implement it per the rules in Section 5 before wiring up the UI around it.
4. For any feature touching auth, payments, file uploads, or public-facing forms, check it against Section 7 before considering it done.
5. Before writing code against a library/framework API, especially Next.js, Prisma, or NextAuth, query Context7 for current version-specific docs rather than relying on training data — see Section 8.
6. After building or modifying React components, run React Doctor as a verification step, same as `npm run build`/lint — see Section 8.
7. If a request seems to need something listed as out-of-scope in Section 3, say so explicitly instead of quietly adding it.
8. Seed/test data: the four reference products range ₹12,800–₹65,000 — use this range for realistic test fixtures.
