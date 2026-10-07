/**
 * Newsroom article service (contract §5–§7). Pure business logic over the
 * NewsroomStore interface — no Next.js, no database driver, no social posting.
 */
import { createHash } from 'node:crypto'
import slugify from 'slugify'
import { sanitizeArticleBody } from '@/lib/sanitize'
import { publishedAtForTransition } from '@/lib/articles/update-fields'
import { articleUrl } from '@/lib/utils'
import { NewsroomError, validation } from './http'
import { canPublish, canUpdateArticle, type Actor } from './permissions'
import {
  ARTICLE_STATUSES, SlugTakenError,
  type ArticleListFilter, type ArticlePatch, type ArticleRow, type ArticleStatus,
  type Author, type Category, type NewsroomStore,
} from './store'

// ── response shapes ─────────────────────────────────────────────────────────

export interface ArticleSummary {
  id: number
  title: string
  slug: string
  status: ArticleStatus
  categoryId: number
  categorySlug: string | null
  categoryName: string | null
  publishedAt: string | null
  scheduledAt: string | null
  updatedAt: string | null
  url: string | null
}

export interface Article extends ArticleSummary {
  subtitle: string | null
  excerpt: string | null
  body: string
  authorId: number | null
  authorName: string | null
  featuredImage: string | null
  imageAlt: string | null
  imageCaption: string | null
  metaTitle: string | null
  metaDesc: string | null
  isBreaking: boolean
  isFeatured: boolean
  aiGenerated: boolean
  version: string
  createdViaNewsroom: boolean
}

export interface ServiceDeps {
  store: NewsroomStore
  now: Date
  siteUrl: string
}

/** Something the route should revalidate after a successful mutation. */
export interface RevalidateTarget { categorySlug: string | null; slug: string }

export interface MutationResult {
  article: Article
  changedFields: string[]
  /** set when the change is (or was) visible on the public site */
  revalidate: RevalidateTarget[]
}

// ── helpers ─────────────────────────────────────────────────────────────────

const iso = (d: Date | null | undefined): string | null => (d ? new Date(d).toISOString() : null)

/** DATETIME columns hold whole seconds; keep in-memory values identical to what is stored. */
export const floorToSecond = (d: Date): Date => new Date(Math.floor(d.getTime() / 1000) * 1000)

/** Contract §7: first 16 hex chars of sha256(JSON.stringify([...])) over the stored row. */
export function computeVersion(row: ArticleRow): string {
  const tuple = [
    row.status, row.title, row.subtitle, row.body, row.excerpt, row.categoryId, row.authorId,
    row.featuredImage, row.imageAlt, row.imageCaption, row.metaTitle, row.metaDesc, !!row.isBreaking,
    iso(row.publishedAt), iso(row.scheduledAt), iso(row.updatedAt),
  ]
  return createHash('sha256').update(JSON.stringify(tuple)).digest('hex').slice(0, 16)
}

export function publicUrl(row: Pick<ArticleRow, 'status' | 'slug'>, cat: Category | undefined, base: string): string | null {
  if (row.status !== 'published' || !cat) return null
  return `${base}${articleUrl(cat.slug, row.slug)}`
}

export function toSummary(row: ArticleRow, cats: Map<number, Category>, base: string): ArticleSummary {
  const cat = cats.get(row.categoryId)
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    categoryId: row.categoryId,
    categorySlug: cat?.slug ?? null,
    categoryName: cat?.name ?? null,
    publishedAt: iso(row.publishedAt),
    scheduledAt: iso(row.scheduledAt),
    updatedAt: iso(row.updatedAt),
    url: publicUrl(row, cat, base),
  }
}

export function toArticle(
  row: ArticleRow,
  cats: Map<number, Category>,
  authors: Map<number, Author>,
  createdViaNewsroom: boolean,
  base: string,
): Article {
  return {
    ...toSummary(row, cats, base),
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    body: row.body,
    authorId: row.authorId,
    authorName: row.authorId != null ? authors.get(row.authorId)?.name ?? null : null,
    featuredImage: row.featuredImage,
    imageAlt: row.imageAlt,
    imageCaption: row.imageCaption,
    metaTitle: row.metaTitle,
    metaDesc: row.metaDesc,
    isBreaking: !!row.isBreaking,
    isFeatured: !!row.isFeatured,
    aiGenerated: !!row.aiGenerated,
    version: computeVersion(row),
    createdViaNewsroom,
  }
}

async function taxonomy(store: NewsroomStore) {
  const [cats, auths] = await Promise.all([store.listCategories(), store.listAuthors()])
  return {
    cats: new Map(cats.map(c => [c.id, c])),
    authors: new Map(auths.map(a => [a.id, a])),
    catList: cats,
  }
}

export async function loadArticle(deps: ServiceDeps, id: number): Promise<Article> {
  const row = await deps.store.getArticle(id)
  if (!row) throw new NewsroomError('NOT_FOUND', 'Article not found')
  return present(deps, row)
}

async function present(deps: ServiceDeps, row: ArticleRow): Promise<Article> {
  const [{ cats, authors }, origin] = await Promise.all([taxonomy(deps.store), deps.store.getOrigin(row.id)])
  return toArticle(row, cats, authors, origin !== null, deps.siteUrl)
}

async function reload(deps: ServiceDeps, id: number): Promise<{ row: ArticleRow; article: Article }> {
  const row = await deps.store.getArticle(id)
  if (!row) throw new NewsroomError('NOT_FOUND', 'Article not found')
  return { row, article: await present(deps, row) }
}

function targetOf(row: ArticleRow, cats: Map<number, Category>): RevalidateTarget {
  return { categorySlug: cats.get(row.categoryId)?.slug ?? null, slug: row.slug }
}

// ── input validation ────────────────────────────────────────────────────────

type Obj = Record<string, unknown>

export function asObject(input: unknown): Obj {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw validation('Body must be a JSON object')
  return input as Obj
}

const LIMITS = {
  title: 320, subtitle: 320, excerpt: 5000, featuredImage: 512, imageAlt: 255,
  imageCaption: 512, metaTitle: 160, metaDesc: 320,
} as const

function optString(o: Obj, key: keyof typeof LIMITS, errors: Record<string, string>): string | null | undefined {
  if (!(key in o)) return undefined
  const v = o[key]
  if (v === null) return null
  if (typeof v !== 'string') { errors[key] = 'must be a string or null'; return undefined }
  const t = v.trim()
  if (t.length > LIMITS[key]) { errors[key] = `must be at most ${LIMITS[key]} characters`; return undefined }
  return t === '' ? null : t
}

function optImageUrl(o: Obj, errors: Record<string, string>): string | null | undefined {
  const v = optString(o, 'featuredImage', errors)
  if (typeof v === 'string' && !/^https?:\/\/[^\s]+$/i.test(v)) { errors.featuredImage = 'must be an http(s) URL'; return undefined }
  return v
}

function requiredTitle(o: Obj, errors: Record<string, string>): string | undefined {
  const v = o.title
  if (typeof v !== 'string' || v.trim() === '') { errors.title = 'required'; return undefined }
  const t = v.trim()
  if (t.length > LIMITS.title) { errors.title = `must be at most ${LIMITS.title} characters`; return undefined }
  return t
}

function requiredBody(o: Obj, errors: Record<string, string>): string | undefined {
  const v = o.body
  if (typeof v !== 'string' || v.trim() === '') { errors.body = 'required'; return undefined }
  const clean = sanitizeArticleBody(v)
  if (clean.trim() === '') { errors.body = 'is empty after sanitisation'; return undefined }
  return clean
}

function optBool(o: Obj, key: string, errors: Record<string, string>): boolean | undefined {
  if (!(key in o)) return undefined
  if (typeof o[key] !== 'boolean') { errors[key] = 'must be a boolean'; return undefined }
  return o[key] as boolean
}

const isPosInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0

/** categoryId or categorySlug; must exist — there is no silent fallback. */
function resolveCategory(o: Obj, catList: Category[], errors: Record<string, string>, required: boolean): number | undefined {
  const hasId = 'categoryId' in o && o.categoryId !== undefined
  const hasSlug = 'categorySlug' in o && o.categorySlug !== undefined
  if (!hasId && !hasSlug) {
    if (required) errors.categoryId = 'categoryId or categorySlug is required'
    return undefined
  }
  let byId: Category | undefined
  let bySlug: Category | undefined
  if (hasId) {
    if (!isPosInt(o.categoryId)) { errors.categoryId = 'must be a positive integer'; return undefined }
    byId = catList.find(c => c.id === o.categoryId)
    if (!byId) { errors.categoryId = 'unknown category'; return undefined }
  }
  if (hasSlug) {
    if (typeof o.categorySlug !== 'string' || !o.categorySlug.trim()) { errors.categorySlug = 'must be a non-empty string'; return undefined }
    const slug = o.categorySlug.trim().toLowerCase()
    bySlug = catList.find(c => c.slug === slug)
    if (!bySlug) { errors.categorySlug = 'unknown category'; return undefined }
  }
  if (byId && bySlug && byId.id !== bySlug.id) { errors.categorySlug = 'does not match categoryId'; return undefined }
  return (byId ?? bySlug)!.id
}

function resolveAuthor(o: Obj, authors: Map<number, Author>, errors: Record<string, string>): number | null | undefined {
  if (!('authorId' in o) || o.authorId === undefined) return undefined
  if (o.authorId === null) return null
  if (!isPosInt(o.authorId)) { errors.authorId = 'must be a positive integer or null'; return undefined }
  if (!authors.has(o.authorId)) { errors.authorId = 'unknown author'; return undefined }
  return o.authorId
}

function throwIfErrors(errors: Record<string, string>) {
  if (Object.keys(errors).length) throw validation('Invalid fields', errors)
}

function requireVersion(o: Obj): string {
  const v = o.expectedVersion
  if (typeof v !== 'string' || !v) throw validation('expectedVersion is required', { expectedVersion: 'required' })
  return v
}

function assertVersion(row: ArticleRow, expected: string) {
  if (computeVersion(row) !== expected) {
    throw new NewsroomError('VERSION_CONFLICT', 'Article changed since it was read; re-read and retry')
  }
}

// ── slugs ───────────────────────────────────────────────────────────────────

const SLUG_MAX = 230 // column is 240; leave room for a collision suffix

export function baseSlug(title: string): string {
  const s = slugify(title, { lower: true, strict: true, trim: true }).slice(0, SLUG_MAX).replace(/-+$/, '')
  return s || 'article'
}

async function uniqueSlug(store: NewsroomStore, base: string, startAt = 1): Promise<string> {
  for (let n = startAt; n < startAt + 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`
    if (!(await store.slugExists(candidate))) return candidate
  }
  return `${base}-${Date.now().toString(36)}`
}

// ── reads ───────────────────────────────────────────────────────────────────

export interface ListQuery { q?: string; status?: string; category?: string; since?: string; until?: string; limit?: string }

export async function listArticles(deps: ServiceDeps, query: ListQuery): Promise<ArticleSummary[]> {
  const errors: Record<string, string> = {}
  const { cats, catList } = await taxonomy(deps.store)
  const filter: ArticleListFilter = { limit: 10 }

  if (query.limit !== undefined && query.limit !== '') {
    const n = Number(query.limit)
    if (!Number.isInteger(n) || n < 1) errors.limit = 'must be a positive integer'
    else filter.limit = Math.min(n, 50)
  }
  if (query.q && query.q.trim()) filter.q = query.q.trim().slice(0, 200)
  if (query.status) {
    const statuses = query.status.split(',').map(s => s.trim()).filter(Boolean)
    const bad = statuses.filter(s => !(ARTICLE_STATUSES as readonly string[]).includes(s))
    if (bad.length) errors.status = `unknown status: ${bad.join(', ')}`
    else if (statuses.length) filter.statuses = statuses as ArticleStatus[]
  }
  if (query.category) {
    const c = query.category.trim()
    const found = /^\d+$/.test(c) ? catList.find(x => x.id === Number(c)) : catList.find(x => x.slug === c.toLowerCase())
    if (!found) errors.category = 'unknown category'
    else filter.categoryId = found.id
  }
  for (const key of ['since', 'until'] as const) {
    const v = query[key]
    if (!v) continue
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) errors[key] = 'must be an ISO 8601 date'
    else filter[key] = d
  }
  throwIfErrors(errors)
  const rows = await deps.store.listArticles(filter)
  return rows.map(r => toSummary(r, cats, deps.siteUrl))
}

// ── create ──────────────────────────────────────────────────────────────────

/** Always creates a draft, whatever the input says (status/slug/etc. are ignored). */
export async function createDraft(deps: ServiceDeps, actor: Actor, input: unknown): Promise<MutationResult> {
  if (actor.kind !== 'telegram') throw new NewsroomError('FORBIDDEN', 'Only Telegram actors create drafts')
  const o = asObject(input)
  const errors: Record<string, string> = {}
  const { catList, authors } = await taxonomy(deps.store)

  const title = requiredTitle(o, errors)
  const body = requiredBody(o, errors)
  const categoryId = resolveCategory(o, catList, errors, true)
  const authorId = resolveAuthor(o, authors, errors)
  const subtitle = optString(o, 'subtitle', errors)
  const excerpt = optString(o, 'excerpt', errors)
  const featuredImage = optImageUrl(o, errors)
  const imageAlt = optString(o, 'imageAlt', errors)
  const imageCaption = optString(o, 'imageCaption', errors)
  const metaTitle = optString(o, 'metaTitle', errors)
  const metaDesc = optString(o, 'metaDesc', errors)
  const isBreaking = optBool(o, 'isBreaking', errors)
  const aiAssisted = optBool(o, 'aiAssisted', errors)
  throwIfErrors(errors)

  const now = floorToSecond(deps.now)
  const base = baseSlug(title!)
  let slug = await uniqueSlug(deps.store, base)
  let id: number | null = null
  for (let attempt = 0; attempt < 5 && id === null; attempt++) {
    try {
      id = await deps.store.insertArticle({
        slug,
        title: title!,
        subtitle: subtitle ?? null,
        body: body!,
        excerpt: excerpt ?? null,
        categoryId: categoryId!,
        authorId: authorId ?? null,
        featuredImage: featuredImage ?? null,
        imageCaption: imageCaption ?? null,
        imageAlt: imageAlt ?? null,
        status: 'draft',
        isBreaking: isBreaking ?? false,
        isFeatured: false,
        publishedAt: null,
        scheduledAt: null,
        createdAt: now,
        updatedAt: now,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
        aiGenerated: aiAssisted === true,
        aiReviewed: false,
      })
    } catch (err) {
      if (!(err instanceof SlugTakenError)) throw err
      slug = await uniqueSlug(deps.store, base, 2 + attempt)
    }
  }
  if (id === null) throw new NewsroomError('INTERNAL', 'Could not allocate a unique slug')
  await deps.store.recordOrigin(id, actor.telegramId)

  const { article } = await reload(deps, id)
  const changedFields = ['title', 'body', 'categoryId', 'slug', 'status',
    ...(['subtitle', 'excerpt', 'authorId', 'featuredImage', 'imageAlt', 'imageCaption', 'metaTitle', 'metaDesc', 'isBreaking'] as const)
      .filter(k => k in o && o[k] !== undefined),
    ...(aiAssisted ? ['aiGenerated'] : []),
  ]
  return { article, changedFields, revalidate: [] }
}

// ── update ──────────────────────────────────────────────────────────────────

export const PATCHABLE_FIELDS = [
  'title', 'subtitle', 'body', 'excerpt', 'categoryId', 'categorySlug', 'authorId',
  'featuredImage', 'imageAlt', 'imageCaption', 'metaTitle', 'metaDesc', 'isBreaking',
] as const

export async function updateArticle(deps: ServiceDeps, actor: Actor, id: number, input: unknown): Promise<MutationResult> {
  const o = asObject(input)
  const allowed = new Set<string>([...PATCHABLE_FIELDS, 'expectedVersion'])
  const unknown = Object.keys(o).filter(k => !allowed.has(k))
  if (unknown.length) {
    throw validation(`Fields not patchable: ${unknown.join(', ')}`,
      Object.fromEntries(unknown.map(k => [k, 'not patchable'])))
  }
  const expectedVersion = requireVersion(o)

  const row = await deps.store.getArticle(id)
  if (!row) throw new NewsroomError('NOT_FOUND', 'Article not found')
  const origin = await deps.store.getOrigin(id)
  if (!canUpdateArticle(actor, row.status, origin)) {
    throw new NewsroomError('FORBIDDEN', 'Not allowed to update this article')
  }
  assertVersion(row, expectedVersion)

  const errors: Record<string, string> = {}
  const { catList, authors, cats } = await taxonomy(deps.store)
  const patch: ArticlePatch = {}
  const changed: string[] = []

  if ('title' in o) { const v = requiredTitle(o, errors); if (v !== undefined) { patch.title = v; changed.push('title') } }
  if ('body' in o) { const v = requiredBody(o, errors); if (v !== undefined) { patch.body = v; changed.push('body') } }
  const categoryId = resolveCategory(o, catList, errors, false)
  if (categoryId !== undefined) { patch.categoryId = categoryId; changed.push('categoryId') }
  const authorId = resolveAuthor(o, authors, errors)
  if (authorId !== undefined) { patch.authorId = authorId; changed.push('authorId') }
  for (const key of ['subtitle', 'excerpt', 'imageAlt', 'imageCaption', 'metaTitle', 'metaDesc'] as const) {
    const v = optString(o, key, errors)
    if (v !== undefined) { patch[key] = v; changed.push(key) }
  }
  const featuredImage = optImageUrl(o, errors)
  if (featuredImage !== undefined) { patch.featuredImage = featuredImage; changed.push('featuredImage') }
  const isBreaking = optBool(o, 'isBreaking', errors)
  if (isBreaking !== undefined) { patch.isBreaking = isBreaking; changed.push('isBreaking') }
  throwIfErrors(errors)
  if (!changed.length) throw validation('No fields to update')

  // slug, status, publishedAt and scheduledAt are never touched by an edit.
  patch.updatedAt = floorToSecond(deps.now)
  const ok = await deps.store.updateArticle(id, patch, { status: row.status, updatedAt: row.updatedAt })
  if (!ok) throw new NewsroomError('VERSION_CONFLICT', 'Article changed concurrently; re-read and retry')

  const { row: after, article } = await reload(deps, id)
  const isPublic = row.status === 'published'
  const revalidate = isPublic ? dedupeTargets([targetOf(row, cats), targetOf(after, cats)]) : []
  return { article, changedFields: changed, revalidate }
}

function dedupeTargets(t: RevalidateTarget[]): RevalidateTarget[] {
  const seen = new Set<string>()
  return t.filter(x => { const k = `${x.categorySlug}/${x.slug}`; if (seen.has(k)) return false; seen.add(k); return true })
}

// ── state transitions (contract §6) ─────────────────────────────────────────

async function transitionPrelude(deps: ServiceDeps, actor: Actor, id: number, input: unknown) {
  if (!canPublish(actor)) throw new NewsroomError('FORBIDDEN', 'Requires role publisher')
  const o = asObject(input ?? {})
  const expectedVersion = requireVersion(o)
  const row = await deps.store.getArticle(id)
  if (!row) throw new NewsroomError('NOT_FOUND', 'Article not found')
  assertVersion(row, expectedVersion)
  return { o, row }
}

async function applyTransition(
  deps: ServiceDeps, row: ArticleRow, patch: ArticlePatch, changed: string[], publicBefore: boolean,
): Promise<MutationResult> {
  patch.updatedAt = floorToSecond(deps.now)
  const ok = await deps.store.updateArticle(row.id, patch, { status: row.status, updatedAt: row.updatedAt })
  if (!ok) throw new NewsroomError('VERSION_CONFLICT', 'Article changed concurrently; re-read and retry')
  const { row: after, article } = await reload(deps, row.id)
  const publicAfter = after.status === 'published'
  let revalidate: RevalidateTarget[] = []
  if (publicBefore || publicAfter) {
    const { cats } = await taxonomy(deps.store)
    revalidate = [targetOf(after, cats)]
  }
  return { article, changedFields: changed, revalidate }
}

const PUBLISHABLE_FROM: readonly ArticleStatus[] = ['draft', 'unpublished', 'scheduled']

export async function publishArticle(deps: ServiceDeps, actor: Actor, id: number, input: unknown): Promise<MutationResult> {
  const { row } = await transitionPrelude(deps, actor, id, input)
  if (!PUBLISHABLE_FROM.includes(row.status)) {
    throw new NewsroomError('INVALID_STATE', `Cannot publish an article in status '${row.status}'`)
  }
  const now = floorToSecond(deps.now)
  const patch: ArticlePatch = { status: 'published' }
  const changed = ['status']
  // Mirrors the CMS rule: published_at is stamped only on the transition into 'published'.
  const firstPublishedAt = publishedAtForTransition(row.status, 'published', now)
  if (firstPublishedAt) { patch.publishedAt = firstPublishedAt; changed.push('publishedAt') }
  if (row.status === 'scheduled') { patch.scheduledAt = null; changed.push('scheduledAt') }
  return applyTransition(deps, row, patch, changed, false)
}

/** Camer360: published → 'unpublished' (published_at is kept as history). */
export async function unpublishArticle(deps: ServiceDeps, actor: Actor, id: number, input: unknown): Promise<MutationResult> {
  const { row } = await transitionPrelude(deps, actor, id, input)
  if (row.status !== 'published') {
    throw new NewsroomError('INVALID_STATE', `Cannot unpublish an article in status '${row.status}'`)
  }
  return applyTransition(deps, row, { status: 'unpublished' }, ['status'], true)
}

export const MIN_SCHEDULE_LEAD_SECONDS = 60

export async function scheduleArticle(deps: ServiceDeps, actor: Actor, id: number, input: unknown): Promise<MutationResult> {
  const { o, row } = await transitionPrelude(deps, actor, id, input)
  const raw = o.scheduledAt
  const when = typeof raw === 'string' ? new Date(raw) : null
  if (!when || Number.isNaN(when.getTime())) {
    throw validation('scheduledAt must be an ISO 8601 date-time', { scheduledAt: 'invalid' })
  }
  if (when.getTime() < deps.now.getTime() + MIN_SCHEDULE_LEAD_SECONDS * 1000) {
    throw validation(`scheduledAt must be at least ${MIN_SCHEDULE_LEAD_SECONDS} s in the future`, { scheduledAt: 'too soon' })
  }
  if (row.status !== 'draft' && row.status !== 'unpublished') {
    throw new NewsroomError('INVALID_STATE', `Cannot schedule an article in status '${row.status}'`)
  }
  return applyTransition(deps, row, { status: 'scheduled', scheduledAt: floorToSecond(when) },
    ['status', 'scheduledAt'], false)
}

export async function unscheduleArticle(deps: ServiceDeps, actor: Actor, id: number, input: unknown): Promise<MutationResult> {
  const { row } = await transitionPrelude(deps, actor, id, input)
  if (row.status !== 'scheduled') {
    throw new NewsroomError('INVALID_STATE', `Cannot unschedule an article in status '${row.status}'`)
  }
  return applyTransition(deps, row, { status: 'draft', scheduledAt: null }, ['status', 'scheduledAt'], false)
}

// ── scheduled publishing ────────────────────────────────────────────────────

export interface PublishDueResult {
  published: Array<{ id: number; slug: string; publishedAt: string | null; url: string | null }>
  skipped: number[]
  revalidate: RevalidateTarget[]
}

/**
 * Publishes due scheduled articles (scheduled_at ≤ now) that were scheduled
 * through the newsroom API; published_at is set to the scheduled time.
 * Never posts to social networks.
 */
export async function publishDue(deps: Pick<ServiceDeps, 'store' | 'now' | 'siteUrl'>, limit = 50): Promise<PublishDueResult> {
  const due = await deps.store.listDueScheduled(deps.now, limit)
  const { cats } = await taxonomy(deps.store)
  const out: PublishDueResult = { published: [], skipped: [], revalidate: [] }
  for (const row of due) {
    const publishedAt = row.scheduledAt ? floorToSecond(row.scheduledAt) : floorToSecond(deps.now)
    const ok = await deps.store.updateArticle(row.id, {
      status: 'published',
      publishedAt,
      updatedAt: floorToSecond(deps.now),
    }, { status: 'scheduled', updatedAt: row.updatedAt })
    if (!ok) { out.skipped.push(row.id); continue }
    const after = { ...row, status: 'published' as const }
    out.published.push({ id: row.id, slug: row.slug, publishedAt: iso(publishedAt), url: publicUrl(after, cats.get(row.categoryId), deps.siteUrl) })
    out.revalidate.push(targetOf(row, cats))
  }
  return out
}
