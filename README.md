# Expert Counselling Portal by upGrad X

An internal tool that runs an upGrad X counsellor's in-person session end to end: capture the
student's details, walk them through a personalized product tour on a shared screen, close the
session with a summary email, and give the team a live admin view of everything that happened —
content, students, counsellors, and outcomes.

- **Live app**: https://upgradx-counsellor-console.vercel.app
- **Source**: https://github.com/arunnandewal-happyvibes/upgradx-counsellor-console

---

## What it does

### 1. Counsellor check-in

Before running any sessions, a counsellor checks in once per browser session with their work
email — no password, matching the tool's low-friction, in-person-use design. That check-in is
logged and persists across every student they see that day; only the per-student form resets
between sessions ("Start Next Session").

### 2. Student onboarding

A seven-step, swipe-through capture screen the counsellor fills in on the student's behalf:

1. Name
2. **Student or working professional** — working professionals also give their years of
   experience (a number); both become part of the learner's profile and show in Closed Sessions
3. Graduation (preset degree chips, or a custom degree + Tech/Non-Tech category)
4. CGPA
5. Skills (preset chips + free-text additions)
6. **Domain interests** — up to 4, from a shared tag taxonomy (FinTech, E-commerce, Tech, AI &
   Machine Learning, Healthtech, IT/ITES, and more) also used to tag hiring partners
7. City — or "no preference," which is treated as genuinely unfiltered rather than defaulted to
   an arbitrary city

Any step can be skipped. On submit, the student's profile drives the rest of the session.

### 3. The console — a personalized, city-aware product tour

A single-scroll walkthrough covering: a personalized hero with degree-matched program
recommendations, hiring partners (filtered to the student's picked interests, falling back to
everything if none match), success stories, the program catalogue, "how learning works",
instructors, industry leaders, upcoming placement drives, upcoming batches, FAQ, events, and
contact.

- **City-aware sections** (Instructors, Industry Leaders, Placement Drives, Upcoming Batches)
  filter to the student's onboarding city, falling back to showing everything if that city has no
  data yet — never an empty section.
- **Future-only, always** — Placement Drives, Batches, and Events only ever show what's still
  actually actionable (drives/events not yet happened, batches still accepting applications).
- Sections with no data for the current context hide entirely rather than rendering empty.

### 4. Close Session

Confirms the student's contact details and recommended program, saves everything to their record
(tied to the checked-in counsellor's email), and sends a branded HTML summary email via
[Resend](https://resend.com) with the program, duration and counsellor name.

The **star rating comes from the student, not the counsellor**: the email carries five tappable
stars that open a public rating page (`/feedback/<token>`, an unguessable per-student link) with
that rating preselected. The student confirms with one tap, and the rating appears in the admin
Closed Sessions view and Excel export — "Awaiting student" until they respond. (The confirm step
means email link scanners that pre-open links can't record a fake rating.)

### Session transcription (optional)

With a speech-to-text key configured, a **Record session** button appears for counsellors. It only
starts after the counsellor confirms the student agreed, shows a live recording clock the whole
time, and can be paused. The browser sends the microphone audio in ~30 second pieces to Whisper
(Groq's free tier by default, or any OpenAI-compatible server via `STT_BASE_URL` — e.g. a
self-hosted faster-whisper); **only the text is kept, never the audio**. Closing the session links
the transcript to the learner, and admins read or download it from **Session Transcripts** (also
linked from each row in Closed Sessions). Transcripts are machine-generated, don't label speakers,
and are deliberately left out of the public-Blob database backups. Without a key the button simply
doesn't appear.

### Counsellor voice assistant (optional)

An **Ask assistant** button on the console lets the counsellor ask a question by voice (or text) and
hear a short spoken answer — "any data science batches in Pune?", "how do I reach the Mumbai
centre?", "which companies hire into fintech?". Speech goes to Whisper, and the question goes to a
free-tier open model (`openai/gpt-oss-120b` on Groq by default; any OpenAI-compatible host via
`LLM_BASE_URL` / `LLM_MODEL`, including a local Ollama). Rather than a vector index, the model calls
small lookup tools over the platform's live data — programs, open batches, placement drives,
events, instructors, hiring partners, success stories, FAQs, degree recommendations, centre contacts
and the career-services policy — so answers are always current and it says so when it doesn't know
(there's no fee data, for instance). It only ever sees published content, plus the learner's degree,
occupation, interests and preferred city for context — never names, contact details or transcripts.
Answers are read aloud with the browser's built-in voice. With no key configured the button doesn't
appear. Note the free tier caps tokens per minute, so a burst of questions can briefly slow down.

### 5. Admin panel

Login-gated (see below) CRUD for every piece of content the console shows: cities, courses &
programs, add-on certificates, hiring partners (with domain tags), instructors, industry leaders,
batches, placement drives, success stories, FAQs (+ a suggested-question review queue sourced from
real student questions), events, city contacts, journey steps, section-visibility toggles, career
services policy, the default home screen, and degree→program recommendations.

Plus two live telemetry views:

- **Closed Sessions** — every session a counsellor has closed, filterable by city/date and
  sortable, with a one-click **Excel export** that respects whatever filters are applied.
- **Counsellors** — per checked-in email: total logins, last login time, and sessions completed.

### 6. Bulk data tools

- **Batches**: download a pre-filled `.xlsx` template (with a reference sheet of valid
  program/city names), fill it in, and re-upload — new rows are added, duplicates are silently
  skipped, and bad/missing data is reported back row-by-row with a specific reason.
- **Hiring partners**: a one-off import script (`scripts/import-hiring-partners.mjs`) parses a
  city→sector→company-list spreadsheet, normalizes company names, and upserts each as a tagged
  hiring partner — rerunnable whenever the source sheet is updated.
- **Database backups**: on-demand from `/admin/backups`, or automatically via a Vercel Cron job
  (`app/api/cron/backup`).

### 7. Authentication & security

- The entire `/admin/*` surface requires email/password login, enforced by `middleware.ts` on
  every request — a signed, httpOnly session cookie (HMAC-SHA256 over a Web Crypto-compatible
  token, so it runs in the Edge middleware runtime) is issued on login and checked on every admin
  request.
- Credentials and the signing secret live only in environment variables, never in code or git.
- File uploads (Excel bulk-import) use `exceljs` rather than `xlsx`/SheetJS specifically because
  of known prototype-pollution/ReDoS vulnerabilities in the latter's untrusted-file-parsing path —
  a meaningful risk for a feature that parses admin-uploaded files.

---

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + backend (API routes, server actions,
  middleware) in one app
- **Prisma + PostgreSQL** (production: [Neon](https://neon.tech), serverless) — data layer, 23
  models
- **Vercel Blob** — image storage for student photos, instructor headshots, hiring-partner logos
- **Resend** — transactional session-summary emails
- **ExcelJS** — Excel template generation, bulk import parsing, and admin data export
- **Tailwind CSS** — design system (white/red theme)
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

   Fill in `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` (a random string —
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` works) to enable
   admin login locally. `RESEND_API_KEY` / `EMAIL_FROM` are optional locally — session-close still
   saves fine without them, just skips sending the email.

4. Run migrations and seed sample data:

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
connected via Vercel's marketplace integrations. Environment variables are managed in the Vercel
project settings — pull them locally with `vercel env pull` if you need to run migrations or
scripts against production.

To redeploy after local changes:

```bash
vercel deploy --prod
```

For schema changes, run the migration against production **before** deploying:

```bash
vercel env pull .env.production.local --environment production --yes
set -a && source .env.production.local && set +a
npx prisma migrate deploy
rm .env.production.local
vercel deploy --prod
```

## Project structure

- `middleware.ts` — gates every `/admin/*` route behind login
- `app/page.tsx` — student onboarding capture (behind the counsellor check-in gate)
- `app/admin-login/`, `app/api/admin-login/`, `app/api/admin-logout/` — admin authentication
- `app/console/**` — the counsellor-facing site: home tour, program detail, FAQ, full
  batches/drives listings, event registration, close session, contact
- `app/admin/**` — CRUD admin for every content type, plus Closed Sessions and Counsellors
  telemetry views
- `app/api/**` — public read endpoints for client-side city/interest-filtered re-fetching, plus
  lead capture, counsellor check-in, FAQ search/suggestion, and event registration
- `components/sections/**` — one component per console section
- `components/admin/**` — admin form components (image upload, tag pickers, bulk-upload form)
- `components/ui/**` — shared design-system primitives
- `lib/city-context.tsx` — global city preference (persisted to `sessionStorage` + URL query
  param); "no preference" stays unfiltered rather than defaulting to an arbitrary city
- `lib/domainTags.ts` — the shared tag taxonomy linking student interests to hiring-partner tags
- `lib/dateFilters.ts` — the `startOfToday()` helper behind every "future only" query
- `lib/adminAuth.ts` — session token signing/verification (Edge-compatible)
- `lib/batchImport.ts` — Excel template generation + upload parsing/validation for Batches
- `lib/counsellor.ts`, `lib/leadProfile.ts`, `lib/welcome.ts` — sessionStorage-backed client state
- `lib/section-visibility.ts` — reusable per-section, optionally per-program visibility flag
- `prisma/schema.prisma`, `prisma/seed.ts` — data model and seed data
- `scripts/**` — one-off data scripts (imports, backups, seed helpers)

## Design principles this build follows

1. **Never show an empty or stale section.** City-scoped sections fall back to "show everything"
   rather than rendering empty; time-scoped sections (drives, batches, events) never show anything
   already in the past.
2. **No login friction where it isn't needed.** Counsellor check-in is a plain email, not a
   password — the tool is used in person, session after session, and the check-in only exists to
   power telemetry, not to gate access.
3. **The admin panel is the source of truth**, and every bulk-edit path (Excel upload) reports
   exactly what succeeded, what was skipped as a duplicate, and what failed and why — never a
   silent partial success.
4. **Security decisions are made deliberately**, not by default — see the `exceljs` vs. `xlsx`
   choice above, and the fact that `/admin` requires login at all (it didn't, originally).
