# upGrad X Counsellor Console

Internal counselling web tool for upGrad X: an onboarding capture screen followed by a
city-aware, single-scroll product walkthrough (hero, success stories, programs, "how learning
works", instructors, industry leaders, placement drives, upcoming batches, FAQ, events, contact),
backed by a real Postgres database and a basic admin panel for editing all content.

- **Live app**: https://upgradx-counsellor-console.vercel.app
- **Source**: https://github.com/arunnandewal-happyvibes/upgradx-counsellor-console

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + backend (API routes & server actions) in one app
- **Prisma + PostgreSQL** (production: [Neon](https://neon.tech), serverless) — data layer
- **Vercel Blob** — image storage for uploaded student photos, instructor headshots, and hiring-partner logos
- **Tailwind CSS** — design system (white/red "variant 2" theme from the design brief)
- **Hosting**: Vercel

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Postgres (via the included Docker Compose file — requires Docker Desktop running):

   ```bash
   docker compose up -d
   ```

   If you'd rather use your own Postgres instance, just point `DATABASE_URL` at it instead.

3. Configure environment:

   ```bash
   cp .env.example .env
   ```

4. Run migrations and seed sample data (4 cities — Bangalore, Delhi NCR, Mumbai, and a
   deliberately sparse Pune with no drives/batches, to exercise the "hide section if empty" rule):

   ```bash
   npm run db:setup
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   - Counsellor flow: [http://localhost:3000](http://localhost:3000) (onboarding → `/console`)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Deployment

The production app runs on Vercel with a Neon Postgres database and a Vercel Blob store, both
connected via Vercel's marketplace integrations (`vercel integration add neon`, `vercel blob
create-store`). Environment variables (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, etc.) are managed
in the Vercel project settings — pull them locally with `vercel env pull` if you need to run
migrations or seed data against production.

To redeploy after local changes: `vercel deploy --prod`.

## Project structure

- `app/page.tsx` — Screen 1 onboarding capture
- `app/console/**` — the main counsellor-facing site (hero through footer, plus program detail,
  FAQ, batches/drives full listings, event registration, contact)
- `app/admin/**` — basic CRUD admin for every content type (courses, instructors, industry
  leaders, batches, drives, success stories, FAQs + suggested-question review queue, events,
  city contacts, journey steps, section-visibility toggles)
- `app/api/**` — public read endpoints used for client-side city-filter re-fetching, plus lead
  capture, FAQ search/suggestion, and event registration
- `components/sections/**` — one component per console section
- `components/ui/**` — shared design-system primitives (Card, Button, Badge, TopBar, …)
- `lib/city-context.tsx` — global city filter (persisted to `sessionStorage` + URL query param)
- `lib/section-visibility.ts` — reusable per-section, optionally per-program visibility flag
- `prisma/schema.prisma`, `prisma/seed.ts` — data model and seed data
- `lib/blob.ts`, `components/admin/ImageField.tsx` — image upload helper + form field (student
  photos, instructor headshots, hiring-partner logos); admin can upload a file or paste a URL —
  uploading requires `BLOB_READ_WRITE_TOKEN` (set automatically in production; locally, run
  `vercel env pull` or just paste image URLs instead)

## Build rules implemented

1. **City filter scope** — only Instructors, Industry Leaders, Placement Drives, and Upcoming
   Batches react to the global city selector; Success Stories and hero stats are unfiltered.
2. **Hide if empty** — those city-scoped sections render nothing (no placeholder) when the
   selected city has no data, verified against the seeded Pune city.
3. **Reusable section-visibility toggle** — `SectionVisibility` table + `isSectionVisible()`
   helper, currently wired to the "Industry Leaders" block on each program detail page and
   manageable from `/admin/section-visibility`.
4. **Multiple certifications per program** — each certification gets its own labeled "Download
   Brochure" button on the program detail page.

## Verification performed

- `npm run build` — compiles and type-checks all 31 routes cleanly.
- Full manual walkthrough in-browser: onboarding → `/console` with live DB data → city switch
  (Bangalore/Delhi/Pune) confirming filtered sections update or collapse correctly → program
  detail page with dual brochure buttons and curriculum accordion → `/admin/courses` create/edit
  reflected back on `/console`.
