# Meritrix

## Overview
Meritrix is a premium learning platform MVP built with Next.js (App Router), TypeScript, and Tailwind CSS. This run establishes the skeleton + premium UI baseline only — no auth, backend, Prisma, or Stripe yet.

## Recent Changes
- 2026-02-12: Homepage polish — banners, feature cards, pricing
  - Added PromoBanner component with image backgrounds + gradient overlays
  - 3 promo banners placed between hero, features, and pricing sections
  - Generated education-themed banner images (public/images/banners/)
  - Feature cards: fixed icon area height (80px), min-height descriptions (72px)
  - Pricing cards: click-to-select interaction, no default highlight, 48px CTA buttons
  - Button component updated to merge external style prop
- 2026-02-12: Navbar action area updates
  - Replaced text-based ThemeToggle with compact ThemeDots (color dot switcher)
  - Added "Create account" button (secondary style) left of "Login" in PublicNavbar
  - Applied ThemeDots to all 3 navbars (Public, Student, Admin)
  - Added placeholder /login and /signup pages (Coming soon)
- 2026-02-12: Initial project setup with premium UI skeleton
  - Design token system (CSS variables) with Deep Teal + Lavender themes
  - 6 core components: Button, Input, Card, Badge, Modal, ProgressBar
  - 3 route groups: (public), (student), (admin) with respective navbars
  - Home page with hero, features, pricing, CTA
  - Student dashboard with progress cards
  - Admin dashboard with placeholder sections

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
  _components/
    Button.tsx            # Primary/secondary/ghost variants (merges external style)
    Input.tsx             # With label, hint, error states
    Card.tsx              # Card, CardHeader, CardBody
    Badge.tsx             # Themed badge
    Modal.tsx             # Accessible modal with ESC + click-outside
    ProgressBar.tsx       # Themed progress bar
    ThemeDots.tsx         # Compact color-dot theme switcher (teal/lavender)
    ThemeToggle.tsx       # (Legacy) Text-based teal/lavender switcher
    PromoBanner.tsx       # Image+text banner with gradient overlay
    PublicNavbar.tsx       # Home, Worksheets, Drills, Live, Pricing, Create account, Login
    StudentNavbar.tsx      # Dashboard, Worksheets, Drills, Live, Profile
    AdminNavbar.tsx        # Dashboard, Users, Content, Analytics, Settings
    Footer.tsx            # Simple footer
  (public)/
    layout.tsx            # PublicNavbar + Footer
    page.tsx              # Home page (hero, banners, features, pricing, CTA)
    login/page.tsx        # Login placeholder (Coming soon)
    signup/page.tsx       # Signup placeholder (Coming soon)
  (student)/
    layout.tsx            # StudentNavbar
    dashboard/page.tsx    # Student dashboard
  (admin)/
    layout.tsx            # AdminNavbar
    admin/page.tsx        # Admin dashboard
public/
  images/banners/         # Generated banner images (worksheets, drills, live)
```

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- No external UI libraries

## Running
- Dev: `npm run dev` (port 5000)
- Build: `npm run build`
- Start: `npm start`

## Theme System
- CSS variables defined in `globals.css`
- Two themes: `teal` (default) and `lavender`
- Applied via `data-theme` attribute on `<html>`
- Stored in `localStorage` key `mx_theme`
- ThemeDots component: two colored circles with active ring indicator
- Only color tokens change between themes; layout/typography stay identical
