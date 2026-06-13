# 📚 Smart Notes — Sharing & Learning Platform

A production-grade full-stack platform where students upload, discover, rate, bookmark and discuss study notes — with gamification, study tools and a full admin panel.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · React Query · Zustand · Express · Prisma · SQLite · JWT + Google OAuth · local file storage

---

## ✨ Features

| Area | Highlights |
| --- | --- |
| **Notes** | PDF / image / handwritten / document (Word, PPT, Excel, text, …) uploads, thumbnails, tags, chapters, duplicate detection (SHA-256), magic-byte file verification, size limits |
| **Discovery** | Debounced instant search with suggestions & history, filters (subject/type), sorts (newest, downloads, rating, likes), infinite scroll, trending algorithm (14-day download velocity), related notes |
| **Engagement** | 5-star ratings (one per user, updatable), likes, bookmarks, threaded comments with replies, @mentions, emoji, share/copy-link, reports |
| **Gamification** | Points (+10 upload, +2 download received, +1 like, +3 five-star), 5 levels (Beginner→Master), 9 achievement badges, leaderboard |
| **Profiles** | Avatars, bio, institution, stats, follow system, achievements tab |
| **Dashboard** | Overview cards, 30-day downloads/uploads area chart, my notes, activity feed, level progress |
| **Study tools** | Exam countdowns, daily/weekly study planner with progress, pomodoro timer with session tracking |
| **Admin** | Platform analytics chart, user block/unblock, note moderation (publish/flag/remove), report queue, comment hiding, subject management, official resources (admin-uploaded textbooks/class notes — badged, ranked top, dedicated section) |
| **Auth** | JWT access + rotating refresh tokens (httpOnly cookie), Google Sign-In, email verification, forgot/reset password, strong password rules, rate limiting |
| **Security** | Helmet, CORS allowlist, Zod validation everywhere, bcrypt (12 rounds), file magic-byte checks, RBAC, Prisma (no raw SQL), upload limits |
| **UX** | Dark/light mode, mobile-first responsive, Framer Motion micro-interactions, skeleton loaders, toasts, SEO metadata |
| **i18n** | Full bilingual UI — **English** and **Bangla (বাংলা)** — with an in-navbar language toggle, persisted preference, and a Bangla web font. Every user-facing string must be internationalized into both languages (see [Internationalization](#-internationalization)) |

---

## 🚀 Quick Start

**Prerequisites:** Node.js ≥ 20 — that's it. The database is file-based SQLite, so no Docker or external DB server is required.

```bash
# 1. Install dependencies (root, server, web — npm workspaces)
npm install

# 2. Configure the API
cp server/.env.example server/.env       # defaults work for local dev

# 3. Create the schema & seed (subjects, achievements, admin user)
npm run db:migrate -w server             # creates server/prisma/dev.db
npm run db:seed -w server

# 4. Configure the frontend
cp web/.env.example web/.env.local

# 5. Run both apps
npm run dev
```

- Web: **http://localhost:3000**
- API: **http://localhost:4000** (health check at `/health`)

### Default accounts (after seeding)

| Account | Email | Password |
| --- | --- | --- |
| Admin | `admin@smartnotes.app` | `Admin1234!` |

The platform starts fresh — no demo users or notes. Register any account to start uploading; every signed-in user has full access (email verification is optional).

> Change the admin password immediately in production (`SEED_ADMIN_PASSWORD` env var overrides the default at seed time).

---

## 🗂 Project Structure

```
smart-notes/
├── server/                     # Express + Prisma API
│   ├── prisma/schema.prisma    # 17 models: users, notes, ratings, likes, ...
│   ├── prisma/dev.db           # SQLite database file (created by migrate)
│   ├── prisma/seed.ts          # Subjects, achievements, admin
│   └── src/
│       ├── app.ts              # Express app: helmet, CORS, routes
│       ├── config/env.ts       # Typed environment loading
│       ├── lib/                # prisma, storage (local filesystem), mailer, gamification
│       ├── middleware/         # auth (JWT), validation (Zod), uploads (multer), rate limits, errors
│       ├── routes/             # auth, notes, interactions, comments, users,
│       │                       # subjects, notifications, stats, dashboard, study, admin
│       └── utils/              # tokens, pagination, shared Prisma selects
└── web/                        # Next.js 15 App Router
    └── src/
        ├── app/                # 19 routes: landing, auth, notes, upload, profile,
        │                       # dashboard, bookmarks, leaderboard, study-tools, admin, ...
        ├── components/         # ui kit, layout, landing sections, notes, search, auth
        ├── hooks/useAuth.ts    # session actions
        ├── lib/                # axios client w/ token refresh, types, utils
        └── stores/auth.ts      # Zustand persisted session
```

---

## ⚙️ Configuration

### Server (`server/.env`)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | SQLite file path (default `file:./dev.db`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random strings (≥32 chars) |
| `CLIENT_URL` | Frontend origin for CORS + email links |
| `GOOGLE_CLIENT_ID` | Enables Google Sign-In (optional) |
| `SMTP_*` | Email delivery — leave blank to log emails to console (dev) |
| `MAX_FILE_SIZE_MB` | Upload size cap (default 15) |

### Web (`web/.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API origin (default `http://localhost:4000`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same Google client ID, renders the Sign-In button |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO metadata |

---

## 🔌 API Overview

All endpoints are under `/api`. Standard response: `{ success, data, meta?, message? }`.

```
POST   /auth/register|login|google|refresh|logout|verify-email|forgot-password|reset-password
GET    /auth/me
GET    /notes                    ?q&subject&type&author&tag&sort&page&limit
GET    /notes/suggestions|trending|top-rated|recent
POST   /notes                    (multipart: file, thumbnail?, fields)
GET    /notes/:id  /notes/:id/related
POST   /notes/:id/download|like|bookmark|report
PUT    /notes/:id/rating         { value: 1–5 }
GET    /notes/:id/comments       POST same  ·  PATCH/DELETE /comments/:id
GET    /bookmarks
GET    /users/:username          /notes /achievements  ·  POST /users/:username/follow
PATCH  /users/me/profile         (multipart avatar)
GET    /notifications            POST /notifications/read-all  /:id/read
GET    /stats/platform|leaderboard|top-contributors
GET    /dashboard/overview|analytics|my-notes|activity
CRUD   /study/exams /study/goals /study/pomodoro
GET    /admin/overview|users|notes|reports|comments|analytics   (+ PATCH actions)
```

---

## 🌐 Internationalization

> **Project rule: the entire site is bilingual.** Every user-facing string —
> page copy, button labels, placeholders, `aria-label`s, toasts, empty states,
> validation messages, email subjects shown in the UI — **must** be available in
> both **English (`en`)** and **Bangla (`bn` / বাংলা)**. A user can switch
> languages at any time via the language toggle in the navbar, and *nothing*
> should remain untranslated when they do. Shipping a hardcoded English string is
> treated as a bug.

### How it works

- **Dictionary (modular)** — strings live in per-surface modules under
  [`web/src/lib/i18n/dict/`](web/src/lib/i18n/dict/) (`common`, `nav`, `auth`,
  `notes`, `problems`, `groups`, `syllabus`, `pages`, `account`, `landing`,
  `ui`, `errors`, `notifications`, `content`, `time`). Each module exports an
  `en` literal and a `bn: Record<keyof typeof en, string>`, so **omitting a
  Bangla translation is a compile error**. [`dictionary.ts`](web/src/lib/i18n/dictionary.ts)
  merges them and derives `TranslationKey`. Keys are namespaced by surface
  (`notes.list.title`, `problems.chat.send`, …); reuse `common.*` for generic
  actions instead of duplicating.
- **Provider** — [`web/src/lib/i18n/context.tsx`](web/src/lib/i18n/context.tsx)
  exposes `useLanguage()` (`locale`, `setLocale`, `toggleLocale`), `useT()`,
  `useFormat()` (locale-aware `timeAgo`/`formatDate`), and `tContent()` (for
  dynamic DB content with an English fallback). The locale is persisted to
  `localStorage`, reflected on `<html lang>`, and — for signed-in users —
  synced to the server (`User.locale`) so emails match.
- **Server-served text is translatable too.** The API never sends prose the
  client can't translate:
  - **Errors & status** — every API error/success response carries a stable
    machine `code` (+ `params`); the client renders `errors.*` / `status.*`
    keys. See [`server/src/lib/messages.ts`](server/src/lib/messages.ts) ⇆
    [`dict/errors.ts`](web/src/lib/i18n/dict/errors.ts).
  - **Notifications** — persisted as a `messageKey` (`notif.*`) + JSON
    `messageParams`, rendered client-side in the recipient's language.
  - **Emails** — bilingual templates in [`server/src/lib/mailer.ts`](server/src/lib/mailer.ts),
    selected by the recipient's `User.locale`.
  - **Platform content** (subjects, achievements, level names) — translated in
    [`dict/content.ts`](web/src/lib/i18n/dict/content.ts), looked up by stable
    slug/code with the seeded English as fallback.
- **Toggle** — [`web/src/components/ui/LanguageToggle.tsx`](web/src/components/ui/LanguageToggle.tsx)
  sits in the navbar next to the theme toggle (EN ⇆ বাং).
- **Fonts** — Inter renders Latin glyphs; Bangla glyphs fall through to
  **Noto Sans Bengali** (loaded in [`web/src/app/layout.tsx`](web/src/app/layout.tsx),
  fallback configured in `tailwind.config.ts`), so mixed content renders cleanly.
- **Not translated:** user-generated/posted content (note titles & bodies,
  comments, problem text, uploaded files, profile bios, usernames) stays
  as-authored. SSR SEO `metadata` in `layout.tsx` stays English (the locale is
  client-side; localizing it would need a locale cookie + `generateMetadata`).

### Adding or translating UI text

1. Add a key to **both** the `en` and `bn` objects in the relevant
   `dict/<surface>.ts` module (or a new module wired into `dictionary.ts`).
2. In a client component, read it through the hook — never hardcode display text:

   ```tsx
   "use client";
   import { useT } from "@/lib/i18n";

   export function Example() {
     const t = useT();
     return <button>{t("common.upload")}</button>;
   }
   ```

   Placeholders interpolate with `{name}` syntax: `t("footer.copyright", { year })`.
3. Components that render translated text must be Client Components (`"use client"`),
   since the locale lives in React context. For Server Components, pass the
   translated string down or convert the leaf to a client component.

**Definition of done for any UI work:** the feature reads 100% of its copy from
the dictionary, both locales are filled in, and it has been eyeballed in Bangla
via the navbar toggle.

---

## 🏭 Production Deployment

1. **Database** — SQLite works out of the box on a host with a persistent disk; run `npx prisma migrate deploy`. For a managed/serverless DB, switch the `datasource` provider in `schema.prisma` (e.g. to `postgresql`) and set `DATABASE_URL` accordingly.
2. **API** — Railway/Render: build `npm run build -w server`, start `node server/dist/index.js`. Set `NODE_ENV=production`, real JWT secrets, SMTP creds, `CLIENT_URL=https://your-app.vercel.app`. Uploads are written to the local `server/uploads` dir, so attach a persistent disk.
3. **Web** — Vercel: root dir `web`, set `NEXT_PUBLIC_API_URL` to the API URL.
4. Refresh-token cookies use `SameSite=None; Secure` in production, so both apps must be served over HTTPS.

### Hardening checklist
- Rotate `SEED_ADMIN_PASSWORD`, JWT secrets
- Put the API behind a CDN/WAF; rate limits are already in place
- Add a real antivirus scan (ClamAV/S3 scanning) on top of the built-in magic-byte checks
- Back up the SQLite `dev.db` file (or your managed DB)

---

## 🧪 Verified

- `tsc --noEmit` clean on the server, `next build` clean (19 routes)
- End-to-end smoke tested: register → login → search → note detail → like → bookmark → 5★ rating → threaded comment with @mention (notification delivered) → download (+2 points to author) → multipart PDF upload (magic-byte verified, duplicate-detected) → study tools CRUD → admin overview & moderation
