# Stage 0 Security Remediation — Camer360

| | |
|---|---|
| Date | 2026-10-06 |
| Branch | `stage-0/security-remediation` (from `main` @ `d81c126`) — **not merged, not pushed, not deployed** |
| Scope | Remediation only. No editorial behaviour change, no Telegram work, no `/api/newsroom/v1`, no new tables. |
| Approval | Owner approval required before merge / deploy. |
| Pre-existing local work | The uncommitted `QuickPublish` change (removes the client-side key header), `CLAUDE.md`, `.claude/settings.local.json`, `.gitignore` addition and untracked ops scripts were **left as they were** and are not part of the Stage 0 commit except where noted. |

No secret values appear in this document.

## 1. Vulnerabilities fixed

| # | Vulnerability | Affected | Remediation | Verified by |
|---|---|---|---|---|
| 1 | **Unauthenticated article read/edit/publish/delete** (also bypassed the "automation can only draft" rule from `e6615a9`) | `GET/PUT/DELETE /api/admin/articles/[id]`, `GET /api/admin/articles` (draft list) | `requireAdmin(req)` | `routes.test.ts` |
| 2 | Unauthenticated admin CRUD | `awards`, `birthdays`, `couples`, `music-drops`, `polls`, `rich-list` (GET/POST + `[id]` PUT/DELETE), `analytics/top-articles` | `requireAdmin(req)` | `routes.test.ts` (26 cases → 401) |
| 3 | **Anonymous schema / data migrations** | `POST /api/admin/db/create-{awards,birthdays,couples,music-drops,polls,reactions,rich-list}`, `GET /api/admin/db/migrate-country` (ALTER TABLE), `GET /api/admin/migrate-categories` (category data migration) | `requireAdmin(req)`. Kept (the admin UI's setup buttons call the create-* routes; all are idempotent). | `routes.test.ts` (9 cases → 401) |
| 4 | **Non-awaited `verifyToken()`** — any non-empty cookie passed (bug class, 13 sites) | `admin/upload`, `comments` ×4, `newsletter` ×4 (incl. mass `send`), `migrate-categories`, `db/migrate-ingested-content`, `youtube/playlists`, `youtube/setup` | All awaited; the one-line cookie checks converted to shared `requireAdmin(req)` | `routes.test.ts` + static scan (no un-awaited `verifyToken(` anywhere) |
| 5 | Machine key fell back to `NEXT_PUBLIC_AUTOMATION_API_KEY` (client-bundle variable) and compared with `===` | all `n8n/*` routes, `admin/articles` POST, `youtube/*`, `test-youtube`, `db/seed-music-drops`, `db/migrate-ingested-content` (15 files) | `checkAutomationKey()` — server-only `AUTOMATION_API_KEY`, timing-safe. Vercel production already has `AUTOMATION_API_KEY` and **no** `NEXT_PUBLIC_AUTOMATION_API_KEY` (checked by name only), so live n8n is unaffected. `n8n/health` now warns if the public variable is ever set. | `routes.test.ts` (26 cases), static scan |
| 6 | Hard-coded auth fallbacks | `JWT_SECRET`, `ADMIN_PASSWORD`, `MAINTENANCE_PASSWORD` literals; proxy bypass when password unset | Removed; fail closed (login 503, verification denies, bypass impossible) | `auth.test.ts`, `routes.test.ts` |
| 7 | Article PUT wrote **any** column from JSON | `PUT /api/admin/articles/[id]` | `lib/articles/update-fields.ts` allowlist; status validated (incl. `unpublished`); `publishedAt` server-managed; body sanitised | `article-fields.test.ts` |
| 8 | **Editing a published article reset `published_at`** (re-dated old stories to the top) | `PUT /api/admin/articles/[id]`; also bulk `PATCH /api/admin/articles` | `publishedAtForTransition()` — stamped only on the transition into `published`; bulk publish skips rows already published | `article-fields.test.ts` |
| 9 | AI Enhance changed the slug of existing articles | `ArticleEditor` | Slug only auto-derived for new articles | `article-fields.test.ts` (source assertion) |
| 10 | **Machine-created HTML not sanitised** (rendered with `dangerouslySetInnerHTML`) | `POST /api/n8n/articles` | Same `sanitizeArticleBody()` as admin creation (embeds preserved; inline/unknown scripts, handlers, `javascript:` stripped) | `article-fields.test.ts` |
| 11 | **Public AI endpoint = anonymous prompt proxy** (any title/body → OpenAI) | `POST /api/articles/perspectives` | Accepts only `articleId`; prompt built from the **published** article in the DB; result cached per article for 7 days (`unstable_cache`). The only caller (`PerspectiveEngine`, currently not rendered anywhere) sends `articleId`. | `routes.test.ts` |
| 12 | Credentials in source control | `server/workers/telegram-session.txt`, Telegram `API_ID`/`API_HASH`, 6 `workflows/*.json` (old automation key ×17, Facebook page token ×1), `AUDIT-2026-05-03.md`, `scripts/full-pipeline-test.ts` (FB token), `scripts/seed-cameroon-articles.py` (key), worker/migration logs | Session + logs untracked (files stay on disk) and ignored; workflow values replaced with n8n expressions `={{ $env.AUTOMATION_API_KEY }}` / `={{ $env.FB_PAGE_TOKEN }}`; doc redacted; scripts read env; untracked `scripts/verify-key-rotation.mjs` and `scripts/check-live-bundle.mjs` (contain keys) added to `.gitignore` | `git grep` (no literal automation keys / FB tokens tracked) |

## 2. Route classification (after Stage 0)

Generated from the code on this branch. `BROKEN/UNPROTECTED` remaining: **none**.
(`admin/youtube/setup` is session-only; it is listed under "session or machine" only because of its helper's name.)

| Route | Method | Classification | Note |
|---|---|---|---|
| `/api/admin/ai/enhance` | POST | ADMIN SESSION |  |
| `/api/admin/analytics/top-articles` | GET | ADMIN SESSION |  |
| `/api/admin/articles/[id]` | GET | ADMIN SESSION |  |
| `/api/admin/articles/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/articles/[id]` | DELETE | ADMIN SESSION |  |
| `/api/admin/articles` | GET | ADMIN SESSION |  |
| `/api/admin/articles` | POST | ADMIN SESSION or MACHINE AUTH |  |
| `/api/admin/articles` | PATCH | ADMIN SESSION |  |
| `/api/admin/articles` | DELETE | ADMIN SESSION |  |
| `/api/admin/auth/login` | POST | INTENTIONALLY PUBLIC WRITE | credential check |
| `/api/admin/awards/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/awards/[id]` | DELETE | ADMIN SESSION |  |
| `/api/admin/awards` | GET | ADMIN SESSION |  |
| `/api/admin/awards` | POST | ADMIN SESSION |  |
| `/api/admin/birthdays/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/birthdays/[id]` | DELETE | ADMIN SESSION |  |
| `/api/admin/birthdays` | GET | ADMIN SESSION |  |
| `/api/admin/birthdays` | POST | ADMIN SESSION |  |
| `/api/admin/categories/cleanup` | POST | ADMIN SESSION |  |
| `/api/admin/categories` | GET | MACHINE AUTH |  |
| `/api/admin/categories` | POST | MACHINE AUTH |  |
| `/api/admin/categories` | DELETE | MACHINE AUTH |  |
| `/api/admin/categories/setup-entertainment` | POST | ADMIN SESSION |  |
| `/api/admin/comments/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/comments/ban` | POST | ADMIN SESSION |  |
| `/api/admin/comments/reply` | POST | ADMIN SESSION |  |
| `/api/admin/comments` | GET | ADMIN SESSION |  |
| `/api/admin/couples/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/couples/[id]` | DELETE | ADMIN SESSION |  |
| `/api/admin/couples` | GET | ADMIN SESSION |  |
| `/api/admin/couples` | POST | ADMIN SESSION |  |
| `/api/admin/db/create-awards` | POST | ADMIN SESSION |  |
| `/api/admin/db/create-birthdays` | POST | ADMIN SESSION |  |
| `/api/admin/db/create-couples` | POST | ADMIN SESSION |  |
| `/api/admin/db/create-music-drops` | POST | ADMIN SESSION |  |
| `/api/admin/db/create-polls` | POST | ADMIN SESSION |  |
| `/api/admin/db/create-reactions` | POST | ADMIN SESSION |  |
| `/api/admin/db/create-rich-list` | POST | ADMIN SESSION |  |
| `/api/admin/db/fix-empty-status` | POST | ADMIN SESSION |  |
| `/api/admin/db/migrate-country` | GET | ADMIN SESSION |  |
| `/api/admin/db/migrate-country` | POST | ADMIN SESSION |  |
| `/api/admin/db/migrate-ingested-content` | POST | ADMIN SESSION or MACHINE AUTH |  |
| `/api/admin/db/migrate-status` | POST | ADMIN SESSION |  |
| `/api/admin/db/seed-music-drops` | POST | MACHINE AUTH |  |
| `/api/admin/debug` | GET | ADMIN SESSION |  |
| `/api/admin/logout` | GET | PUBLIC (clears own cookie) |  |
| `/api/admin/migrate-categories` | GET | ADMIN SESSION |  |
| `/api/admin/migrate-categories` | POST | ADMIN SESSION |  |
| `/api/admin/music-drops/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/music-drops/[id]` | DELETE | ADMIN SESSION |  |
| `/api/admin/music-drops` | GET | ADMIN SESSION |  |
| `/api/admin/music-drops` | POST | ADMIN SESSION |  |
| `/api/admin/newsletter/articles` | GET | ADMIN SESSION |  |
| `/api/admin/newsletter/generate` | POST | ADMIN SESSION |  |
| `/api/admin/newsletter/send` | POST | ADMIN SESSION |  |
| `/api/admin/newsletter/subscribers` | GET | ADMIN SESSION |  |
| `/api/admin/polls/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/polls/[id]` | DELETE | ADMIN SESSION |  |
| `/api/admin/polls` | GET | ADMIN SESSION |  |
| `/api/admin/polls` | POST | ADMIN SESSION |  |
| `/api/admin/rich-list/[id]` | PUT | ADMIN SESSION |  |
| `/api/admin/rich-list/[id]` | DELETE | ADMIN SESSION |  |
| `/api/admin/rich-list` | GET | ADMIN SESSION |  |
| `/api/admin/rich-list` | POST | ADMIN SESSION |  |
| `/api/admin/test-youtube` | GET | MACHINE AUTH |  |
| `/api/admin/upload` | POST | ADMIN SESSION |  |
| `/api/admin/youtube/community-post` | POST | MACHINE AUTH |  |
| `/api/admin/youtube/playlists` | GET | ADMIN SESSION or MACHINE AUTH |  |
| `/api/admin/youtube/playlists` | POST | ADMIN SESSION or MACHINE AUTH |  |
| `/api/admin/youtube/setup` | GET | ADMIN SESSION or MACHINE AUTH |  |
| `/api/admin/youtube/upload` | POST | MACHINE AUTH |  |
| `/api/articles/perspectives` | POST | INTENTIONALLY PUBLIC WRITE | published-article-only, cached AI |
| `/api/birthdays/upcoming` | GET | PUBLIC READ |  |
| `/api/comments` | GET | PUBLIC READ |  |
| `/api/comments` | POST | INTENTIONALLY PUBLIC WRITE | reader comments (ban list + moderation) |
| `/api/debug/categories` | GET | PUBLIC READ |  |
| `/api/debug/homepage` | GET | PUBLIC READ |  |
| `/api/hit/[id]` | POST | INTENTIONALLY PUBLIC WRITE | view counter |
| `/api/maintenance-login` | POST | INTENTIONALLY PUBLIC WRITE | password-checked bypass |
| `/api/my-feed` | GET | PUBLIC READ |  |
| `/api/n8n/articles` | POST | MACHINE AUTH |  |
| `/api/n8n/claude` | POST | MACHINE AUTH |  |
| `/api/n8n/health` | GET | MACHINE AUTH |  |
| `/api/n8n/ingest` | POST | MACHINE AUTH |  |
| `/api/n8n/queue` | GET | MACHINE AUTH |  |
| `/api/n8n/queue` | PATCH | MACHINE AUTH |  |
| `/api/n8n/social/facebook` | GET | MACHINE AUTH |  |
| `/api/n8n/social/facebook` | PATCH | MACHINE AUTH |  |
| `/api/n8n/social/youtube` | GET | MACHINE AUTH |  |
| `/api/n8n/social/youtube` | PATCH | MACHINE AUTH |  |
| `/api/n8n/youtube` | GET | MACHINE AUTH |  |
| `/api/news-sitemap` | GET | PUBLIC READ |  |
| `/api/newsletter/subscribe` | POST | INTENTIONALLY PUBLIC WRITE | newsletter sign-up |
| `/api/polls/[id]` | GET | PUBLIC READ |  |
| `/api/polls/[id]` | POST | INTENTIONALLY PUBLIC WRITE | poll votes |
| `/api/pwa/track` | POST | INTENTIONALLY PUBLIC WRITE | PWA analytics |
| `/api/reactions/[id]` | GET | PUBLIC READ |  |
| `/api/reactions/[id]` | POST | INTENTIONALLY PUBLIC WRITE | reader reactions |
| `/api/rss` | GET | PUBLIC READ |  |
| `/api/search` | GET | PUBLIC READ |  |
| `/api/tip` | POST | INTENTIONALLY PUBLIC WRITE | reader tips (log only) |

**Totals:** ADMIN SESSION: 57, ADMIN SESSION or MACHINE AUTH: 5, INTENTIONALLY PUBLIC WRITE: 10, MACHINE AUTH: 18, PUBLIC (clears own cookie): 1, PUBLIC READ: 10

**BROKEN/UNPROTECTED remaining:** none

## 3. Verification

| Check | Branch (Stage 0) | Baseline `main` | Result |
|---|---|---|---|
| `npm test` (new: `tsx --test`, Node test runner, no new dependencies) | **110 / 110 pass** | — | PASS |
| `npm run typecheck` (`tsc --noEmit`, script added) | 0 errors | 0 errors | PASS |
| `npm run lint` | 112 errors, 71 warnings | 112 errors, 72 warnings | No new errors; one fewer warning. All remaining findings pre-exist in unchanged code. |
| `npm run build` | exit 0, 106/106 pages | — | PASS (only warning: pre-existing workspace-root inference) |

Tests force dummy DB/JWT/key/OpenAI values, so no real database, credential or AI call is used. Coverage: unauthenticated/forged article mutation → 401; machine key cannot use the old PUT publish bypass; all formerly open CRUD + schema routes → 401; junk-cookie bug class → 401; every machine route rejects invalid and `NEXT_PUBLIC` keys; perspectives endpoint rejects arbitrary prompts / invalid ids; `published_at` preserved on edit and bulk publish; allowlist; n8n body sanitisation; login/maintenance fail closed; repository-wide static scans.

## 4. Remaining issues

| Severity | Issue | Why not now |
|---|---|---|
| HIGH | Git **history** still contains the Telegram session, old automation keys and a Facebook page token (public repo). | Stage 0 forbids history rewrite; rotation is the real fix (§5). |
| MEDIUM | No login rate limiting; logout is `GET`; single shared admin; 7-day non-revocable JWT. | Stage 1 design (users/grants). |
| MEDIUM | Anonymous `POST /api/comments` runs AI moderation per comment. | Needs rate limiting design. |
| MEDIUM | Facebook can be posted twice (direct on publish + n8n); the `pending` social_queue row is never read. | Editorial/social behaviour — out of Stage 0 scope. |
| MEDIUM | `/api/n8n/articles` has no idempotency (timestamped slugs). | Stage 1 (dedup). |
| MEDIUM | Hard deletes; no audit log; no redirects on slug change. | Stage 1. |
| MEDIUM | Two pages claim `/` (`app/page.tsx` and `app/(public)/page.tsx`). Build succeeds; which one serves should be confirmed. | Not security. |
| LOW | Public `/api/debug/homepage`, `/api/debug/categories` (public data). | Remove later. |
| LOW | Newsletter links point to a non-existent `/api/newsletter/unsubscribe`. | Functional bug. |
| INFO | Pre-existing lint errors (112) unrelated to Stage 0. | See §3. |
| INFO | `docs/*.md` charter files exist but are empty. | Governance follow-up. |

## 5. External owner actions

1. **Revoke the Telegram session** (Telegram → Settings → Devices). Create new API credentials if the local worker is still needed (`TELEGRAM_API_ID`, `TELEGRAM_API_HASH` in `.env.local`).
2. **Rotate the Facebook page token** that was committed in `workflows/facebook-auto-post.json` and `scripts/full-pipeline-test.ts`; store it as `FB_PAGE_TOKEN` in the n8n environment.
3. **Rotate `AUTOMATION_API_KEY`** if there is any doubt about the current value (the current key appears in the untracked `scripts/verify-key-rotation.mjs`). Keys labelled "old" in the repo must stay revoked.
4. **n8n:** the live workflows are separate from these exports. If you re-import an export, the n8n instance must allow `$env` access (`N8N_BLOCK_ENV_ACCESS_IN_NODE=false`) and define `AUTOMATION_API_KEY` / `FB_PAGE_TOKEN` — or replace the expressions with n8n credentials.
5. **Rotate `ADMIN_PASSWORD` and `JWT_SECRET`** (fallback values were public). Rotating `JWT_SECRET` logs out existing sessions.
6. Decide on Git history clean-up (separate task).

## 6. Deployment notes

- Owner reviews the diff first. Verified locally only; nothing deployed.
- After deploy, smoke test: admin login; open/edit/save a **test** draft; publish then edit it and confirm the date does not change; bulk-publish list action; run `/api/n8n/health` from n8n; confirm the next scheduled runs of the six n8n workflows succeed.
- Rollback: Vercel instant rollback; no database changes were made.

## 7. Preview verification (2026-10-06)

Preview was tested through the owner's browser session (Vercel Deployment Protection stays on; no bypass secret was created). **Preview shares the production database and R2 bucket**, so all article testing was draft-only and nothing was published.

| Area | Result |
|---|---|
| Preview env var names | Required names present (ADMIN_PASSWORD, ADMIN_USERNAME, JWT_SECRET, AUTOMATION_API_KEY, DB_*, R2_*). MAINTENANCE_PASSWORD absent (maintenance mode is off). |
| Public site | Homepage, article, category, RSS, sitemap → 200; R2 and external images load; layout unchanged. |
| Admin | Invalid login → 401 (no cookie); owner login works; dashboard, article list, editor and admin APIs → 200. |
| Authorization | All anonymous / junk-cookie / forged-JWT / invalid-key probes → 401 (logged server-side as 401). |
| Draft workflow | Test draft `[STAGE-0 PREVIEW TEST — DELETE ME]` created, reopened (API + editor), edited: slug unchanged, forced system fields ignored, invalid status → 400; deleted → 404. No test record remains. |
| Logs | No error/warning-level entries, no AI calls, no social posting, no n8n traffic other than rejected probes. |
| Not verifiable on Preview | Valid automation key acceptance (would expose the key in a request) and n8n execution history (n8n API behind Cloudflare Access) — confirm with an n8n run at the production gate after key rotation. |
| `published_at` | On a real published article, a rejected edit (invalid status + forged publishedAt) returned 400 and left `publishedAt` **and** `updatedAt` byte-identical. The transition rule itself is covered by unit tests (no article was published on shared data). |
| Known pre-existing | `GET /api/admin/awards` → 500 (`awards` table missing) — identical on production `main`. Sanitiser keeps an empty `<script></script>` shell for allowlisted embeds (inline code stripped) — intended. |
| Vercel topology | Two projects deploy this repo: `camer360` (serves www.camer360.com — tested) and `camer360.com` (only *.vercel.app; its Preview build fails because it has no Preview DB settings — environment, not code). The locally linked `.vercel` points at the duplicate. |
| Preview URL | camer360-a5xwnn1tm-buddy1974s-projects.vercel.app (commit dcabd17) |
