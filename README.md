# Expert Counselling Portal by upGrad X

An internal tool that runs an upGrad X counsellor's in-person session end to end: capture the
learner's details, walk them through a personalized product tour on a shared screen, answer
questions by voice, optionally transcribe the conversation, close the session with a summary email
the learner can rate, and give the team a live admin view of content, learners, counsellors and
outcomes.

- **Live app**: https://upgradx-counsellor-console.vercel.app
- **Source**: https://github.com/arunnandewal-happyvibes/upgradx-counsellor-console

---

## What it does

### 1. Counsellor check-in

Before running sessions, a counsellor checks in once per browser session with their work email —
no password, matching the tool's low-friction, in-person design. The check-in is logged and stays
active across every learner they see; only the per-learner state resets between sessions
("Start Next Session").

### 2. Learner onboarding

A seven-step, swipe-through screen the counsellor fills in on the learner's behalf:

1. Name
2. **Student or working professional** — working professionals also give years of experience (a
   number). Both become part of the learner's profile.
3. Graduation (preset degrees, or a custom degree + Tech/Non-Tech category)
4. CGPA
5. Skills (preset chips + free text)
6. **Domain interests** — up to 4 from a shared taxonomy (FinTech, E-commerce, Healthtech,
   IT/ITES, NBFCs & BFSI, SaaS, GCCs, …) that also tags hiring partners
7. City — or "no preference", which is treated as genuinely unfiltered

Any step can be skipped. The profile then drives the rest of the session.

### 3. The console — a personalized, city-aware tour

A single-scroll walkthrough: personalized hero with degree-matched program recommendations,
hiring partners, success stories, the program catalogue, "how learning works", instructors,
industry leaders, placement drives, upcoming batches, FAQ, events and contact.

- **Hiring partners** are filtered to the learner's picked interests (falling back to everyone if
  none match).
- **City-aware sections** (instructors, industry leaders, drives, batches, success stories) follow
  the learner's city, and fall back to showing everything rather than going empty.
- **Future-only, always** — drives and events that haven't happened, and batches still accepting
  applications.
- **Online and offline batches**: every batch is Online or Offline. Offline needs a city; online
  batches are open to everyone and appear for every city. The batch tables show a Mode column.
- **Courses link out**: each program tile and detail page has a "View Course Page" button that opens
  the upgrad.com page for that course in a new tab, and additional certificates show a 2–3 line
  note on the extra masterclasses or projects they add.
- **Carousels** (hiring partners, success stories, instructors, industry leaders) drift on their own
  but the counsellor can take over: hover to stop, drag or swipe, or use the arrow buttons; they
  resume a few seconds later.
- Sections with nothing to show hide entirely.

### 4. Counsellor voice assistant (optional)

An **Ask assistant** button lets the counsellor ask by voice or text — "any data science batches in
Pune?", "how do I reach the Mumbai centre?", "which companies hire into fintech?" — and hear a short
spoken answer.

Speech goes to Whisper; the question goes to a free-tier open model (`openai/gpt-oss-120b` on Groq
by default; any OpenAI-compatible host via `LLM_BASE_URL` / `LLM_MODEL`, including a local Ollama).
Instead of a vector index, the model calls small lookup tools over the platform's **live** data —
programs, open batches, drives, events, instructors, hiring partners, success stories, FAQs,
placement stats, degree recommendations, centre contacts and the career-services policy — so answers
are always current, and it says so when it doesn't know (there is no fee data, for example).

It only sees published content plus the learner's degree, work status, interests and preferred city
for context — never names, contact details or transcripts. Replies are read aloud with the
browser's built-in voice. City and program names are fed to Whisper as a hint, and city matching
tolerates mis-hearings. With no key configured the button doesn't appear. The free tier caps tokens
per minute, so a burst of questions can briefly slow it.

### 5. Session transcription (optional)

A **Record session** button appears (when a speech-to-text key is configured). It only starts after
the counsellor confirms the learner agreed, shows a live recording clock, and can be paused. The
browser sends the microphone audio in ~30 second pieces to Whisper (Groq's free tier by default, or
any OpenAI-compatible server via `STT_BASE_URL`, e.g. self-hosted faster-whisper).

**Only text is stored — never audio.** Whisper's silence hallucinations ("Thank you.") are filtered
out. Closing the session links the transcript to the learner; admins read or download it under
**Session Transcripts** (and from each row in Closed Sessions). Transcripts are machine-generated,
don't label who is speaking, and are kept out of database backups.

### 6. Close Session and learner rating

Confirms the learner's details and recommended program, saves the record (tied to the checked-in
counsellor), and sends a branded summary email via [Resend](https://resend.com). The counsellor
does **not** rate the session — the **learner** does, from five tappable stars in the email. They
open a public page (`/feedback/<token>`, an unguessable per-learner link) with that rating
preselected and confirm with one tap (so email link scanners can't record a fake rating). The rating
shows in Closed Sessions and the Excel export, reading "Awaiting student" until they respond.

### 7. Admin panel

Login-gated CRUD for everything the console shows: cities, courses (with course-page link and
additional certificates), add-on certificates (each needs a 2–3 line description), hiring partners
(with domain tags), instructors, industry leaders, batches, placement drives, success stories, FAQs
(plus a review queue of questions learners asked), events, city contacts, journey steps, section
visibility, the career-services policy, the default home screen and degree→program recommendations.
The sidebar keeps **Back to Console** and **Log Out** pinned in view.

Live views:

- **Closed Sessions** — every closed session with learner name, phone and email, student/working
  profile, recommended program, counsellor and their email, city, the learner's rating and a link to
  the transcript. Filter by city and date, sort, and **Export to Excel** (respects the filters).
- **Counsellors** — per checked-in email: logins, last login, sessions completed.
- **Session Transcripts** — every recorded session, with a timestamped reader and a .txt download.

### 8. Bulk data tools

- **Batches**: download an `.xlsx` template (with a Mode dropdown and a reference sheet of valid
  program/city names), fill it in and re-upload. New rows are added, duplicates are skipped, and bad
  or missing data is reported row by row. Blank Mode means Offline, so older templates still work.
- **Hiring partners**: `scripts/import-hiring-partners.mjs` parses a city→sector→company sheet and
  upserts tagged partners (re-runnable).
- **Course links**: `scripts/set-course-links.mjs` fills course-page links by course name
  (`DRY_RUN=1` previews).
- **Backups**: on demand from `/admin/backups`, or nightly via Vercel Cron. Files get an unguessable
  URL, and transcripts are excluded.

### 9. Authentication & security

- Everything under `/admin/*` requires email/password login, enforced in `middleware.ts` with a
  signed, httpOnly session cookie (HMAC-SHA256 over a Web Crypto token, so it works on the Edge
  runtime).
- Credentials and secrets live only in environment variables — never in code or git.
- Excel import uses `exceljs` rather than `xlsx`/SheetJS because of known prototype-pollution and
  ReDoS issues in the latter's parsing of untrusted files.
- Public endpoints that cost money or write data (`/api/transcribe`, `/api/assistant`) validate
  input, cap sizes and rates, and return 503 until a key is configured.

### 10. Privacy and data handling

- Voice is recorded only with the counsellor's confirmation that the learner agreed; audio is never
  stored, and only text is kept.
- Audio and assistant questions are sent to the configured speech/language provider (Groq by
  default). The assistant is given no learner name, phone or email.
- Transcripts and learner details are visible only behind the admin login. Check what your own
  policies and local law require before recording conversations.

---

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend and backend (API routes, server actions,
  middleware) in one app
- **Prisma + PostgreSQL** (production: [Neon](https://neon.tech)) — 26 models
- **Vercel Blob** — uploaded images/PDFs and database backups
- **Resend** — transactional email
- **Groq (Whisper + an open LLM)** — speech-to-text, session transcription and the voice assistant,
  all swappable for any OpenAI-compatible endpoint
- **ExcelJS** — Excel templates, bulk import and exports
- **Tailwind CSS** — white/red design system
- **Hosting**: Vercel

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Postgres (Docker Desktop must be running), or point `DATABASE_URL` at your own instance:

   ```bash
   docker compose up -d
   ```

3. Configure environment:

   ```bash
   cp .env.example .env
   ```

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

### Environment variables

| Variable | Needed for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | everything | Postgres connection string |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | admin login | secret = long random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `RESEND_API_KEY`, `EMAIL_FROM` | summary email + rating link | optional; without them closing a session still saves, just sends no email |
| `BLOB_READ_WRITE_TOKEN` | uploads, backups | optional locally (paste image URLs instead) |
| `CRON_SECRET` | nightly backup cron | set in Vercel |
| `GROQ_API_KEY` | transcription + voice assistant | free key at console.groq.com; without it both features stay hidden |
| `STT_BASE_URL`, `STT_API_KEY`, `STT_MODEL` | custom speech-to-text host | optional; defaults to Groq `whisper-large-v3-turbo` |
| `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` | custom assistant model | optional; defaults to Groq `openai/gpt-oss-120b` (free-tier model names change) |

Note that the sender `onboarding@resend.dev` can only deliver to the Resend account owner. Verify a
sending domain in Resend before expecting real learners to receive the summary email.

## Deployment

Production runs on Vercel with Neon Postgres and a Vercel Blob store. The Vercel project is **not**
connected to GitHub, so pushing to GitHub does not deploy — deploy explicitly:

```bash
vercel deploy --prod
```

For schema changes, apply migrations to production **before** deploying:

```bash
vercel env pull .env.production.local --environment production --yes
set -a && source .env.production.local && set +a
npx prisma migrate deploy
rm .env.production.local
vercel deploy --prod
```

Environment variables are managed in the Vercel project settings (secrets are hidden and can't be
pulled back). Never commit `.env*` files; only `.env.example` is tracked.

## Project structure

- `middleware.ts` — gates every `/admin/*` route behind login
- `app/page.tsx` — learner onboarding (behind the counsellor check-in)
- `app/console/**` — the counsellor-facing site: home tour, program detail, FAQ, full
  batches/drives listings, event registration, close session, contact
- `app/feedback/[token]/` — public page where a learner rates their session
- `app/admin/**` — admin CRUD plus Closed Sessions, Counsellors and Session Transcripts
- `app/admin-login/`, `app/api/admin-login|logout/` — admin authentication
- `app/api/**` — public read endpoints for city/interest-filtered content, lead capture, counsellor
  check-in, FAQ search, event registration, `transcribe` (speech-to-text) and `assistant`
- `components/sections/**` — one component per console section
- `components/console/**` — check-in, close-session form, session recorder, voice assistant
- `components/admin/**` — admin forms (uploads, tag pickers, bulk upload, additional certificates)
- `components/ui/**` — shared primitives, including the draggable `Marquee` carousel
- `lib/city-context.tsx`, `lib/useCityFetch.ts` — city preference; "no preference" stays unfiltered
- `lib/dateFilters.ts` — `startOfToday()`, behind every "future only" query
- `lib/domainTags.ts` — the interest/hiring-partner tag taxonomy
- `lib/batchImport.ts`, `lib/batchMode.ts` — Excel import/template and Online/Offline handling
- `lib/adminAuth.ts` — session-token signing (Edge-compatible)
- `lib/transcription.ts`, `lib/sessionRecorder.ts`, `lib/vocabulary.ts` — speech-to-text, the
  browser recorder, and the name hints fed to Whisper
- `lib/llm.ts`, `lib/assistant.ts`, `lib/assistantTools.ts` — the voice assistant's model client,
  loop and lookup tools
- `lib/email.ts` — summary email (with the star-rating links)
- `lib/snapshot.ts` — database backups
- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` — data model, history, seed data
- `scripts/**` — one-off data scripts (imports, course links, backups, seed helpers)

## Design principles

1. **Never show an empty or stale section.** City-scoped sections fall back to everything;
   time-scoped ones never show the past.
2. **No login friction where it isn't needed.** Counsellor check-in is just an email — it powers
   telemetry, not access control. The admin panel is the gated surface.
3. **The admin panel is the source of truth**, and bulk paths report exactly what succeeded, what was
   skipped and what failed and why — never a silent partial success.
4. **Features that need a key stay invisible until configured**, and fail closed (503) if called.
5. **Ground the assistant in live data**, not memory: it answers through lookups and admits gaps.
6. **Security and privacy decisions are deliberate** — consent before recording, text not audio,
   unguessable links, nothing sensitive in public files.
