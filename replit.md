# Meritrix

## Overview
Meritrix is a premium learning platform MVP designed with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL. It features a premium UI skeleton with a sophisticated design token system (Deep Teal + Lavender themes) and a robust, production-ready database schema. The platform aims to provide a comprehensive learning experience, offering dynamic course offerings, live sessions (including Vedic Maths), and a full-fledged administrative panel for content, user, and payment management. Key capabilities include authentication, secure payment processing via Razorpay, and a structured learning path through grades, subjects, chapters, and worksheets.

## User Preferences
- Premium SaaS aesthetic: clean, calm, elegant
- No pure black text — use slate-like near-black tones
- No external UI libraries (no shadcn)
- Tight spacing scale, consistent layout widths (max 1100px)
- Theme toggle changes only colors, not layout/typography

## System Architecture
Meritrix is built on a modern web stack utilizing Next.js 16 with the App Router for server-side rendering and API routes. TypeScript ensures code quality and maintainability. The UI is crafted with Tailwind CSS v4, adhering to a strict design token system with 'teal' (default) and 'lavender' themes, controlled by a `data-theme` attribute and `localStorage`.

**Key Architectural Decisions & Implementations:**
- **Modular Design:** The project structure is organized by feature and role (`(public)`, `(student)`, `(admin)`), promoting clear separation of concerns.
- **Authentication System:** Features token-based, HttpOnly cookie sessions with bcryptjs hashing for passwords and SHA256 for session tokens. It enforces single-device login and includes server-side guards (`requireUser()`, `requireAdmin()`) for robust route protection, handling expired, invalid, or blocked sessions.
- **Database Management:** Leverages Prisma ORM 7.4 with a PostgreSQL database (Neon-backed). A comprehensive schema supports users, sessions, educational content (grades, subjects, chapters, worksheets), purchases (subjects, packages), live sessions, and coupon management. Prisma's `PrismaPg` adapter is used for efficient database interactions.
- **Payment Integration:** Implements Razorpay for secure payment processing for subjects and packages. The architecture is designed to be gateway-agnostic, allowing for easy swapping of payment providers. It includes API routes for order creation, verification, and webhook processing, with robust error handling for missing configurations.
- **Content & Learning:** Offers a structured learning experience with worksheets categorized into foundational, skill-builder, and mastery tiers. Access to content is controlled by purchase status (isFree, SubjectPurchase, PackagePurchase). Progress tracking and completion mechanisms are integrated.
- **Admin Panel:** Provides a full-featured admin dashboard with live statistics and CRUD operations for users, content (grades, subjects, chapters, worksheets), packages, coupons, and live sessions.
- **Dynamic Offerings:** Utilizes API endpoints to dynamically fetch and display course offerings and grade packages with calculated discounts, presented via a responsive carousel on the homepage.
- **UI/UX Design:** Emphasizes a premium SaaS aesthetic with calm, elegant design, using slate-like tones instead of pure black. Custom components are built to maintain a consistent look and feel without external UI libraries. Theme toggling is restricted to colors, preserving layout and typography.
- **Currency Handling:** Supports CAD currency formatting across the platform using `Intl.NumberFormat` and a `PriceBlock` component for consistent display of MRP, sale prices, and discounts.

## Recent Changes
- 2026-02-18: Vercel Build Compatibility Fix
  - Prisma client import changed from custom `@/app/generated/prisma` to default `@prisma/client`
  - Removed `output` directive from prisma/schema.prisma generator block
  - Updated lib/prisma.ts and prisma/seed.ts imports
  - Build script updated to `prisma generate && next build` for Vercel deployment
  - Login page wrapped in Suspense boundary for Next.js 16 static prerender compatibility
- 2026-02-12: Global Online LIVE Only Policy
  - Schema: SessionMode enum (ONLINE_LIVE only), mode field on LiveSession, termsVersion + termsAcceptedAt on LiveBooking
  - SessionPolicy component (app/_components/SessionPolicy.tsx): reusable OnlineLiveBadge, DeliveryModeLine, SessionTermsLink, SessionPolicyModal
  - Admin sessions: meetingUrl input with helper, "Missing link" badge, server-side activation guard
  - Student /vedic-maths: Online LIVE badge + delivery mode line throughout, global terms modal, terms acceptance stored on booking
- 2026-02-12: Senior Vedic Maths + Live Pass System
  - PassProduct/SessionPass models for credit-based session booking
  - Admin /admin/passes and /admin/sessions with category dropdown
  - Student /vedic-maths page with Razorpay purchase flow
  - "Content coming soon" empty states for grades/subjects with no content

## External Dependencies
- **PostgreSQL:** Primary database, hosted via Neon.
- **Prisma ORM:** Used for database interaction and schema management.
- **bcryptjs:** For password hashing.
- **Razorpay:** Payment gateway for processing subject and package purchases.
- **Next.js:** The web framework used for building the application.
- **TypeScript:** The programming language used.
- **Tailwind CSS:** The utility-first CSS framework used for styling.