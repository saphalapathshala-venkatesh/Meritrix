# Meritrix

## Overview
Meritrix is a premium learning platform MVP built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL. The project has a premium UI skeleton with a design token system (Deep Teal + Lavender themes), and a production-ready database schema.

## Recent Changes
- 2026-02-12: Grade Package Cards in Course Section
  - Seeded 3 grade packages: Grade 6 ($149/$99), Grade 7 ($159/$109), Grade 8 ($169/$119)
  - CourseCard: "Grade Package" badge, "All Subjects Included" subtitle, "Buy Grade Pack" CTA
  - Grade pack click shows info modal (payment not connected yet)
  - Offerings API returns 12 items: 9 subjects + 3 grade packs
- 2026-02-12: CAD Currency + Premium Price Block
  - lib/utils/format-money.ts: formatMoney (CAD via Intl.NumberFormat) + computeDiscount helper
  - PriceBlock component: MRP (strikethrough) + sale price (bold) + discount % pill (subtle)
  - CourseCard uses PriceBlock; edge case: no price shows "Contact us"
  - All ₹ symbols replaced with CAD formatting across student, admin, and public pages
  - Seed data updated with realistic MRP > salePrice (e.g. Math MRP $79, sale $49)
  - Subject detail API returns salePrice; admin form labels show CAD
- 2026-02-12: Dynamic Course Offerings Carousel
  - Extended Subject and Package models with mrp (Max Retail Price) and salePrice fields
  - GET /api/public/offerings: returns subjects + grade packs with calculated discounts
  - CourseCard component: type badge, MRP/sale price/discount display, Buy Now button
  - CourseCarousel component: responsive (1/2/3 cards), auto-slides every 10s, pause on hover, dot nav
  - Homepage: replaced static pricing section with dynamic carousel fetching real offerings from DB
  - Admin forms (content + packages) updated with MRP, Sale Price, Legacy Price fields
  - Payment create-order routes use salePrice with fallback to legacy price field
- 2026-02-12: Razorpay Config Hardening
  - lib/config/env.ts: centralized validated config (getRazorpayConfig, isRazorpayConfigured)
  - All backend code reads env vars through single config module only
  - All payment API routes return 503 with friendly message if env vars missing
  - Frontend handles 503 with "Payments temporarily unavailable" message
  - GET /api/payments/health: returns { razorpayConfigured, missing } (no secrets exposed)
  - Webhook route guarded against missing config
  - No direct process.env.RAZORPAY_* access outside lib/config/env.ts
- 2026-02-12: Razorpay Payment Integration
  - lib/payments/razorpay.ts: createRazorpayOrder, verifyRazorpaySignature, verifyWebhookSignature
  - lib/razorpay-checkout.ts: client-side loadRazorpayScript + openRazorpayCheckout helper
  - SubjectPurchase & PackagePurchase models extended with gateway, orderId, paymentId, signature, currency
  - API routes: POST /api/payments/subject/create-order, POST /api/payments/subject/verify
  - API routes: POST /api/payments/package/create-order, POST /api/payments/package/verify
  - Webhook: POST /api/webhooks/razorpay (idempotent, handles captured/failed events)
  - Public API: GET /api/packages/list (active packages for pricing page)
  - Subject detail page: "Buy for ₹X" button opens Razorpay Checkout, verifies, unlocks content
  - Pricing page: reads packages from DB, opens Razorpay Checkout for Pro/Team plans
  - Gateway-agnostic design: swap to Stripe by changing lib/payments/* + API routes only
  - Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET in Replit Secrets
- 2026-02-12: Full Admin Panel
  - Admin dashboard with live statistics (users, worksheets, subjects, packages, coupons)
  - Users management: search, block/unblock, delete, reset password
  - Content management: hierarchical CRUD for grades → subjects → chapters → worksheets
  - Packages management: create/edit bundles with subject selection
  - Coupons management: create/edit discount codes with usage tracking
  - 8 admin API routes with Zod validation and requireAdminApi guard
  - Toast notification system (ToastProvider in AdminProviders wrapper)
  - AdminNavbar updated with Dashboard, Users, Content, Packages, Coupons links
- 2026-02-12: Worksheets browsing MVP
  - Added isFree field to Worksheet model (migration applied)
  - Seed script: 3 grades x 3 subjects x 3 chapters x 6 worksheets (162 total)
  - API routes: GET grades, GET subjects, GET subject/[id] (chapters+worksheets+access), POST progress
  - Free/locked logic: isFree worksheets always accessible, otherwise requires SubjectPurchase or PackagePurchase
  - Completion: honesty confirmation dialog, toggle via WorksheetCompletion model
  - Worksheets page: grade selector + subject grid (/learn/worksheets)
  - Subject detail page: chapter cards with Foundational/Skill Builder/Mastery sections
  - Dashboard: real per-subject progress from DB with live-computed totals
  - All pages protected by requireUser() guard
- 2026-02-12: Hardened /api/auth/me endpoint
  - Returns 401 + clears cookie for missing/invalid/expired sessions
  - Returns 403 + deletes session + clears cookie for blocked users
  - Enforces expiresAt strictly
- 2026-02-12: Server-side route protection (guards)
  - lib/guards.ts: requireUser() and requireAdmin() server-side guards
  - DB session validation with expiry + isBlocked checks
  - Invalid/expired/blocked sessions destroyed (row deleted + cookie cleared)
  - Student layout calls requireUser(), Admin layout calls requireAdmin()
  - Added isBlocked field to User model (migration applied)
  - Navbar components accept userName prop, show user initial
- 2026-02-12: Authentication system (Module A)
  - Register, Login, Logout, Me API routes (app/api/auth/*)
  - bcryptjs password hashing (12 rounds), SHA256 session tokens
  - Single-device login enforcement (old sessions deleted on new login)
  - HttpOnly cookie-based sessions, 30-day expiry
  - Middleware for route protection (cookie-presence check, Edge Runtime compatible)
  - Login/signup pages with working forms and error handling
- 2026-02-12: Prisma v7 adapter setup
  - Using @prisma/adapter-pg with PrismaPg({ connectionString }) pattern
  - prisma-client-js provider with client engine + pg adapter
  - Prisma client singleton in lib/prisma.ts (hot-reload safe)
- 2026-02-12: Prisma + PostgreSQL setup
  - Installed prisma, @prisma/client, @prisma/adapter-pg, pg, bcryptjs
  - Created full schema: Users, Sessions, Grades, Subjects, Chapters, Worksheets, Completions, Purchases, Packages, DrillPacks, DrillAttempts, LiveSessions, LiveBookings, Coupons, CouponUsages
  - Initial migration applied successfully (17 tables)
- 2026-02-12: Homepage polish — banners, feature cards, pricing
  - Added PromoBanner component with theme-adaptive gradient overlays
  - 3 promo banners placed between hero, features, and pricing sections
  - Feature cards: two-tone design with min-w-0 grid fix
  - Pricing cards: click-to-select interaction, 48px CTA buttons
  - Button component merges external style prop
- 2026-02-12: Navbar action area updates
  - ThemeDots compact color-dot switcher on all navbars
  - "Create account" button in PublicNavbar
  - Placeholder /login and /signup pages
- 2026-02-12: Initial project setup with premium UI skeleton

## User Preferences
- Premium SaaS aesthetic: clean, calm, elegant
- No pure black text — use slate-like near-black tones
- No external UI libraries (no shadcn)
- Tight spacing scale, consistent layout widths (max 1100px)
- Theme toggle changes only colors, not layout/typography

## Project Architecture
```
app/
  layout.tsx              # Root layout (sets data-theme="teal")
  globals.css             # Design tokens + CSS variables
  generated/prisma/       # Auto-generated Prisma client (gitignored)
  _components/
    Button.tsx            # Primary/secondary/ghost variants (merges external style)
    Input.tsx             # With label, hint, error states
    Card.tsx              # Card, CardHeader, CardBody
    Badge.tsx             # Themed badge
    Modal.tsx             # Accessible modal with ESC + click-outside
    ProgressBar.tsx       # Themed progress bar
    ThemeDots.tsx         # Compact color-dot theme switcher (teal/lavender)
    ThemeToggle.tsx       # (Legacy) Text-based teal/lavender switcher
    PromoBanner.tsx       # Image+text banner with theme-adaptive gradient overlay
    PublicNavbar.tsx       # Home, Worksheets, Drills, Live, Pricing, Create account, Login
    StudentNavbar.tsx      # Dashboard, Worksheets, Drills, Live, Profile
    AdminNavbar.tsx        # Dashboard, Users, Content, Analytics, Settings
    Footer.tsx            # Simple footer
  (public)/
    layout.tsx            # PublicNavbar + Footer
    page.tsx              # Home page (hero, banners, features, pricing, CTA)
    login/page.tsx        # Login placeholder
    signup/page.tsx       # Signup placeholder
  (student)/
    layout.tsx            # StudentNavbar + requireUser() guard
    dashboard/page.tsx    # Student dashboard (real DB progress)
    learn/worksheets/
      page.tsx            # Grade selector + subject grid
      [subjectId]/page.tsx # Chapter cards + tiered worksheets
  (admin)/
    layout.tsx            # AdminNavbar + requireAdmin() guard + AdminProviders
    providers.tsx         # Client-side providers (ToastProvider)
    admin/
      page.tsx            # Admin dashboard with live stats + quick links
      users/page.tsx      # User management (search, block, delete, reset password)
      content/page.tsx    # Hierarchical content CRUD (grades→subjects→chapters→worksheets)
      packages/page.tsx   # Package bundles management
      coupons/page.tsx    # Coupon discount codes management
  api/
    auth/
      register/route.ts   # POST: create user + session
      login/route.ts      # POST: authenticate + session
      logout/route.ts     # POST: destroy session
      me/route.ts         # GET: current user (hardened, 401/403 + cookie clear)
    dashboard/route.ts    # GET: per-subject progress + overall stats
    worksheets/
      grades/route.ts     # GET: all grades
      subjects/route.ts   # GET: subjects by gradeId
      subject/[subjectId]/route.ts  # GET: chapters + worksheets + access + completion
      progress/route.ts   # POST: toggle worksheet completion
    admin/
      stats/route.ts      # GET: platform statistics
      users/route.ts      # GET/POST: user management (block/delete/reset-password)
      grades/route.ts     # CRUD: grade management
      subjects/route.ts   # CRUD: subject management
      chapters/route.ts   # CRUD: chapter management
      worksheets/route.ts # CRUD: worksheet management
      packages/route.ts   # CRUD: package management
      coupons/route.ts    # CRUD: coupon management
    payments/
      subject/create-order/route.ts  # POST: create Razorpay order for subject
      subject/verify/route.ts        # POST: verify Razorpay payment for subject
      package/create-order/route.ts  # POST: create Razorpay order for package
      package/verify/route.ts        # POST: verify Razorpay payment for package
    webhooks/
      razorpay/route.ts    # POST: Razorpay webhook (idempotent)
    packages/
      list/route.ts        # GET: public list of active packages
lib/
  prisma.ts               # Prisma client singleton (PrismaPg adapter, hot-reload safe)
  auth.ts                 # Auth helpers: hash, verify, session CRUD, cookies
  guards.ts               # Server-side route guards: requireUser(), requireAdmin()
  admin-auth.ts           # Admin API guard: requireAdminApi()
  payments/razorpay.ts    # Razorpay server-side utilities (order creation, signature verification)
  razorpay-checkout.ts    # Client-side Razorpay Checkout loader + opener
middleware.ts             # Route protection (cookie-presence check, Edge-compatible)
prisma/
  schema.prisma           # Full data model
  migrations/             # Migration history
  prisma.config.ts        # Prisma config (datasource URL from env)
public/
  images/banners/         # Generated banner images
```

## Database Schema
```
Users (STUDENT/ADMIN roles)
  └─ Sessions (single-device login tokens)
  └─ WorksheetCompletions
  └─ SubjectPurchases (with coupon support)
  └─ PackagePurchases (with coupon support)
  └─ DrillAttempts
  └─ LiveBookings (with coupon support)
  └─ CouponUsages

Grades
  └─ Subjects (with price)
    └─ Chapters
      └─ Worksheets (foundational/skill-builder/mastery tiers)

Packages (bundles of subjects)
DrillPacks (adaptive drills with XP)
LiveSessions (1:1 or batch, with scheduling)
Coupons (percentage discount, usage limits, expiry)
```

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma ORM 7.4
- PostgreSQL (Neon-backed via Replit)
- No external UI libraries

## Running
- Dev: `npm run dev` (port 5000)
- Build: `npm run build`
- Start: `npm start`
- Prisma: `npx prisma migrate dev`, `npx prisma generate`, `npx prisma studio`

## Theme System
- CSS variables defined in `globals.css`
- Two themes: `teal` (default) and `lavender`
- Applied via `data-theme` attribute on `<html>`
- Stored in `localStorage` key `mx_theme`
- ThemeDots component: two colored circles with active ring indicator
- Token `--primary-dark` used for banner overlays (adapts per theme)
- Only color tokens change between themes; layout/typography stay identical
