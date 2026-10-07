# Newsroom API v1 — Camer360 implementation notes

The authoritative protocol is the shared contract
**`newsroom-control-plane/docs/newsroom-api-v1.md`** (TM ↔ publications). This page only
records what is specific to Camer360. If this page and the contract disagree, the contract wins.

TM (Telegram Mobile Newsroom) never touches the Camer360 database. It calls
`/api/newsroom/v1/*` with HMAC-signed requests; Camer360 stays the authority for content,
permissions, audit and media.

## Where things live

| Concern | File |
|---|---|
| Routes | `app/api/newsroom/v1/**/route.ts` |
| Route wrapper (enabled → verify → grant/role → writes → idempotency → run → audit) | `lib/newsroom/handler.ts` |
| Signature verification (canonical string, ±300 s, nonce) | `lib/newsroom/verify.ts` |
| Role matrix | `lib/newsroom/permissions.ts` |
| Article service (create/update/transitions/version) | `lib/newsroom/articles.ts` |
| Media (limits, types, R2, WebP) | `lib/newsroom/media.ts`, `lib/newsroom/media-runtime.ts` |
| Store interface / MySQL / in-memory (tests) | `lib/newsroom/store*.ts` |
| Drizzle schema | `lib/db/schema/newsroom.ts` |
| Raw SQL migration | `lib/db/migrations/newsroom/0001_newsroom.sql` |
| Tests (no DB, no R2) | `tests/newsroom/*.test.ts` |

`proxy.ts` lets every `/api/*` path straight through, and its matcher does not include
`/api/newsroom`, so it never blocks or redirects these routes.

## Camer360 specifics

### Statuses
`articles.status` is `draft | scheduled | published | archived | unpublished`.

| Action | Result on Camer360 |
|---|---|
| `POST /articles` | always `draft` (input `status`, `slug`, `publishedAt`, `isFeatured`… are ignored) |
| `publish` | `draft`/`unpublished`/`scheduled` → `published`; `published_at` = now, stamped only on the transition (same rule as `publishedAtForTransition` in `lib/articles/update-fields.ts`). Publishing a scheduled article also clears `scheduled_at`. |
| `unpublish` | `published` → **`unpublished`** (Camer360; CC uses `draft`). `published_at` kept as history. |
| `schedule` | `draft`/`unpublished` → `scheduled`, `scheduledAt` ≥ now + 60 s |
| `unschedule` | `scheduled` → `draft`, `scheduled_at` cleared |
| scheduler / cron | due `scheduled` → `published`, `published_at` = `scheduled_at` |
| `archived` | read-only for the newsroom; every transition from it is `409 INVALID_STATE` |

Republishing an `unpublished` article re-stamps `published_at` (it is a new transition into
`published`) — identical to the CMS behaviour.

### Categories and authors
Categories come from the `categories` table (`GET /categories`, ordered by `sort_order`, name).
`categoryId` or `categorySlug` is required on create and must exist — there is **no fallback**
(the CMS `PUT` silently falls back to the first category; the newsroom never does). Author is
optional and must exist when given (`authors` table).

### Public URLs
`url` is set only when `status = 'published'`:
`${NEXT_PUBLIC_SITE_URL}/${category.slug}/${article.slug}` (same as `articleUrl()` in `lib/utils`).

### Slugs
Derived server-side from the title with `slugify(title, { lower, strict, trim })` (≤ 230 chars),
collisions get `-2`, `-3`, …; a unique-key race on insert retries with the next suffix. Slugs are
never changed by this API.

### Body
Sanitised with `sanitizeArticleBody` (the CMS sanitiser). Note it intentionally keeps an empty
`<script>` shell for allow-listed embed hosts (TikTok, Instagram, X).

### AI flag
`aiAssisted: true` → `ai_generated = 1, ai_reviewed = 0`.
⚠ The owner's `scripts/purge-ai-drafts.mjs` targets `status = 'draft' AND ai_generated = 1`,
so AI-assisted newsroom drafts are in scope of that script if it is run.

### Optimistic concurrency
`version` follows contract §7 over the stored row (dates as ISO strings or `null`, `isBreaking`
as boolean). Writes are additionally compare-and-swap guarded on `(status, updated_at)`, and
all newsroom timestamps are written at whole-second precision (the `DATETIME` columns hold
seconds), so a CMS edit between read and write is detected.

### Media
* `POST /media`: base64, ≤ 4 MB decoded. Images (`image/jpeg|png|webp|gif`) are re-encoded with
  sharp to WebP (≤ 1200 px wide, quality 82) like `app/api/admin/upload`. `application/pdf`,
  `video/mp4`, `video/quicktime`, `audio/ogg`, `audio/mpeg` are stored as-is.
* Stored in the Camer360 R2 bucket (`R2_*` env vars) under `newsroom/<uuid>.<ext>`, public URL
  `${R2_PUBLIC_URL}/<key>`, recorded in `media` (with `article_id` when attached; `alt` = alt or
  caption — the `media` table has no caption/role columns).
* `role=featured` (image only, `articleId` + `expectedVersion` required) sets
  `featured_image`, and `image_alt` / `image_caption` when given, version-checked **before** the
  upload happens.
* `POST /media/presign` → 15-minute presigned PUT (only `Content-Type` is signed; send exactly
  the returned `headers`). Limits: images 25 MB, other types 100 MB.
  `POST /media/confirm` checks the object with HeadObject (existence, content type, size).
  Presigned **images are re-encoded to WebP on confirm** and the raw original is deleted, so
  for images use the `url` returned by `/media/confirm`, not the presign `publicUrl`.
* Vercel caps request bodies at ~4.5 MB, so in practice direct base64 uploads above ~3.3 MB
  decoded must use presign + confirm.

### Publishing never posts to social
Newsroom publish/schedule/cron only update the article row and revalidate caches (the same tag
and paths as the CMS routes). They never call `postArticleToSocial`, never insert `social_queue`
rows, never ping IndexNow or the Facebook scraper (enforced by a test).
**Pre-existing downstream behaviour:** the existing n8n *facebook-auto-post* workflow
independently picks up newly published articles. That is not triggered by this API, but an
article published through TM will still be seen by that workflow like any other published
article.

### Audit
Every write and every denied write (`ACTOR_UNKNOWN`, `FORBIDDEN`, `WRITES_DISABLED`) appends a
`newsroom_audit` row with field names only. Requests that fail signature verification
(`401`) are **not** audited — nothing is written to the database before a signature is valid.
`/health` is unsigned and always returns `200` with the flags (so `enabled: false` is visible
while the API is switched off).

### Idempotency
Keys are reserved before the write runs (concurrent duplicates get `409 IDEMPOTENCY_MISMATCH`
"in progress"), only `2xx` responses are stored and replayed (`201` replays as `200`, header
`x-newsroom-idempotent-replay: true`), failed attempts release the key. Rows are pruned after
8 days by the scheduler/cron run.

## Environment variables

`.env.example` is git-ignored in this repo (`.env*` in `.gitignore`); the local copy has these
names added. Set the values in `.env.local` and in Vercel — never in chat or in git.

| Variable | Meaning |
|---|---|
| `NEWSROOM_API_ENABLED` | `true` to enable; anything else → `503 API_DISABLED` |
| `NEWSROOM_WRITES_ENABLED` | optional; `false` → writes `503 WRITES_DISABLED`, reads keep working |
| `NEWSROOM_SIGNING_SECRET` | HMAC secret shared with TM, unique to Camer360 (`openssl rand -base64 48`). Never reuse `AUTOMATION_API_KEY`. Missing → `503 API_NOT_CONFIGURED` |
| `NEWSROOM_OWNER_TELEGRAM_IDS` | optional comma-separated Telegram ids treated as active publishers |
| `CRON_SECRET` | protects `GET /api/newsroom/v1/cron/publish-scheduled`; unset → `503` |
| `R2_*`, `NEXT_PUBLIC_SITE_URL` | existing variables, reused |

## Database (run by the owner — never by CI or agents)

```bash
npm run newsroom:migrate -- --dry-run     # print the SQL, no DB connection
npm run newsroom:migrate                  # CREATE TABLE IF NOT EXISTS × 5 (idempotent)
npm run newsroom:grant -- 123456789 editor "Jane Doe"
npm run newsroom:grant -- 123456789 revoke   # sets active = false, keeps the row
```

Tables: `newsroom_grants`, `newsroom_nonces`, `newsroom_idempotency`, `newsroom_audit`,
`newsroom_article_origins`. The `articles` table is **not** altered. Both scripts read `DB_*`
from `.env.local` and print only table names / the grant — never credentials.

## Scheduled publishing

* `POST /api/newsroom/v1/scheduler/run` — signed, actor `system:scheduler` or a publisher. TM
  should call this (e.g. every few minutes) for timely scheduled publishing.
* `GET /api/newsroom/v1/cron/publish-scheduled` — Vercel Cron backstop, `vercel.json`
  `0 5 * * *` (once a day, Hobby-plan safe), `Authorization: Bearer ${CRON_SECRET}`.
  Respects both kill switches.
* **Safety rule:** only articles that were scheduled **through the newsroom API** (an `ok`
  `schedule` row in `newsroom_audit`) are auto-published. Rows the CMS put into `scheduled`
  are never touched, because nothing published those before this API existed.
* Each auto-published article is audited as `publish_scheduled` (actor `system:scheduler`,
  the publisher, or `system:cron`).

## Tests

`npm test` runs `tests/newsroom/*` alongside `tests/security/*`. They force a dummy DB
environment and inject the in-memory store and a mock R2 runtime — they never reach the
database or R2. `tests/newsroom/signing.test.ts` checks the contract test vector and, when
`../newsroom-control-plane` is checked out next to this repo, cross-checks against the TM
reference signer.
