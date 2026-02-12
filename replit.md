# Meritrix

## Overview
Meritrix is a premium learning platform MVP built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL. The project has a premium UI skeleton with a design token system (Deep Teal + Lavender themes), and a production-ready database schema.

## Recent Changes
- 2026-02-12: Prisma + PostgreSQL setup
  - Installed prisma, @prisma/client, dotenv
  - Created full schema: Users, Sessions, Grades, Subjects, Chapters, Worksheets, Completions, Purchases, Packages, DrillPacks, DrillAttempts, LiveSessions, LiveBookings, Coupons, CouponUsages
  - Prisma client singleton in lib/prisma.ts (hot-reload safe)
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
    layout.tsx            # StudentNavbar
    dashboard/page.tsx    # Student dashboard
  (admin)/
    layout.tsx            # AdminNavbar
    admin/page.tsx        # Admin dashboard
lib/
  prisma.ts               # Prisma client singleton (hot-reload safe)
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
