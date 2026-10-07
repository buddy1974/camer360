/**
 * Production NewsroomStore over the existing mysql2/drizzle pool.
 * Every article column is mapped explicitly — nothing is spread from input.
 */
import { and, asc, desc, eq, gte, inArray, isNull, like, lte, lt, or, sql, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import {
  articles, authors, categories, media,
  newsroomArticleOrigins, newsroomAudit, newsroomGrants, newsroomIdempotency, newsroomNonces,
} from '@/lib/db/schema'
import {
  SlugTakenError,
  type ArticleGuard, type ArticleListFilter, type ArticlePatch, type ArticleRow, type ArticleStatus,
  type AuditEntry, type IdempotencyRecord, type MediaRecord, type NewArticle, type NewsroomStore,
} from './store'

const ARTICLE_COLUMNS = {
  id: articles.id,
  slug: articles.slug,
  title: articles.title,
  subtitle: articles.subtitle,
  body: articles.body,
  excerpt: articles.excerpt,
  categoryId: articles.categoryId,
  authorId: articles.authorId,
  featuredImage: articles.featuredImage,
  imageCaption: articles.imageCaption,
  imageAlt: articles.imageAlt,
  status: articles.status,
  isBreaking: articles.isBreaking,
  isFeatured: articles.isFeatured,
  publishedAt: articles.publishedAt,
  scheduledAt: articles.scheduledAt,
  createdAt: articles.createdAt,
  updatedAt: articles.updatedAt,
  metaTitle: articles.metaTitle,
  metaDesc: articles.metaDesc,
  aiGenerated: articles.aiGenerated,
  aiReviewed: articles.aiReviewed,
}

type SelectedArticle = { [K in keyof typeof ARTICLE_COLUMNS]: unknown }

function mapRow(r: SelectedArticle): ArticleRow {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    title: String(r.title),
    subtitle: (r.subtitle as string | null) ?? null,
    body: (r.body as string | null) ?? '',
    excerpt: (r.excerpt as string | null) ?? null,
    categoryId: Number(r.categoryId),
    authorId: r.authorId == null ? null : Number(r.authorId),
    featuredImage: (r.featuredImage as string | null) ?? null,
    imageCaption: (r.imageCaption as string | null) ?? null,
    imageAlt: (r.imageAlt as string | null) ?? null,
    status: ((r.status as ArticleStatus | null) ?? 'draft'),
    isBreaking: !!r.isBreaking,
    isFeatured: !!r.isFeatured,
    publishedAt: (r.publishedAt as Date | null) ?? null,
    scheduledAt: (r.scheduledAt as Date | null) ?? null,
    createdAt: (r.createdAt as Date | null) ?? null,
    updatedAt: (r.updatedAt as Date | null) ?? null,
    metaTitle: (r.metaTitle as string | null) ?? null,
    metaDesc: (r.metaDesc as string | null) ?? null,
    aiGenerated: !!r.aiGenerated,
    aiReviewed: !!r.aiReviewed,
  }
}

/** mysql2 error codes may be wrapped by drizzle (DrizzleQueryError.cause). */
function errCode(err: unknown): string | undefined {
  const e = err as { code?: string; cause?: { code?: string } } | null
  return e?.code ?? e?.cause?.code
}
function errMessage(err: unknown): string {
  const e = err as { sqlMessage?: string; cause?: { sqlMessage?: string } } | null
  return e?.sqlMessage ?? e?.cause?.sqlMessage ?? ''
}
const isDuplicate = (err: unknown) => errCode(err) === 'ER_DUP_ENTRY'

const escapeLike = (s: string) => s.replace(/[\\%_]/g, m => `\\${m}`)

function guardWhere(id: number, guard: ArticleGuard): SQL {
  return and(
    eq(articles.id, id),
    eq(articles.status, guard.status),
    guard.updatedAt ? eq(articles.updatedAt, guard.updatedAt) : isNull(articles.updatedAt),
  )!
}

export class MysqlStore implements NewsroomStore {
  async consumeNonce(nonce: string, expiresAt: Date, now: Date): Promise<boolean> {
    // Opportunistic cleanup keeps the table small; bounded so it stays cheap.
    await db.delete(newsroomNonces).where(lt(newsroomNonces.expiresAt, now)).limit(100).catch(() => {})
    try {
      await db.insert(newsroomNonces).values({ nonce, expiresAt })
      return true
    } catch (err) {
      if (isDuplicate(err)) return false
      throw err
    }
  }

  async getGrant(telegramUserId: string) {
    const rows = await db.select({
      telegramUserId: newsroomGrants.telegramUserId,
      role: newsroomGrants.role,
      active: newsroomGrants.active,
      displayName: newsroomGrants.displayName,
    }).from(newsroomGrants).where(eq(newsroomGrants.telegramUserId, BigInt(telegramUserId))).limit(1)
    const g = rows[0]
    return g ? { telegramUserId: String(g.telegramUserId), role: g.role, active: !!g.active, displayName: g.displayName ?? null } : null
  }

  async reserveIdempotency(rec: Omit<IdempotencyRecord, 'statusCode' | 'responseJson'>): Promise<IdempotencyRecord | null> {
    try {
      await db.insert(newsroomIdempotency).values({
        idemKey: rec.key, actor: rec.actor, method: rec.method, path: rec.path.slice(0, 255),
        requestHash: rec.requestHash, statusCode: 0, responseJson: null, createdAt: rec.createdAt,
      })
      return null
    } catch (err) {
      if (!isDuplicate(err)) throw err
    }
    const rows = await db.select().from(newsroomIdempotency)
      .where(and(eq(newsroomIdempotency.idemKey, rec.key), eq(newsroomIdempotency.actor, rec.actor))).limit(1)
    const r = rows[0]
    if (!r) return this.reserveIdempotency(rec) // released in between — try once more
    return {
      key: r.idemKey, actor: r.actor, method: r.method, path: r.path, requestHash: r.requestHash,
      statusCode: r.statusCode, responseJson: r.responseJson ?? null, createdAt: r.createdAt,
    }
  }

  async completeIdempotency(key: string, actor: string, statusCode: number, responseJson: string) {
    await db.update(newsroomIdempotency).set({ statusCode, responseJson })
      .where(and(eq(newsroomIdempotency.idemKey, key), eq(newsroomIdempotency.actor, actor)))
  }

  async releaseIdempotency(key: string, actor: string) {
    await db.delete(newsroomIdempotency)
      .where(and(eq(newsroomIdempotency.idemKey, key), eq(newsroomIdempotency.actor, actor)))
  }

  async pruneExpired(now: Date, idemOlderThan: Date) {
    await db.delete(newsroomNonces).where(lt(newsroomNonces.expiresAt, now))
    await db.delete(newsroomIdempotency).where(lt(newsroomIdempotency.createdAt, idemOlderThan))
  }

  async appendAudit(e: AuditEntry) {
    await db.insert(newsroomAudit).values({
      requestId: e.requestId.slice(0, 64),
      actor: e.actor.slice(0, 40),
      operation: e.operation.slice(0, 40),
      articleId: e.articleId,
      changedFields: e.changedFields,
      idempotencyKey: e.idempotencyKey,
      result: e.result,
      errorCode: e.errorCode,
    })
  }

  async recordOrigin(articleId: number, telegramUserId: string) {
    await db.insert(newsroomArticleOrigins).values({ articleId, telegramUserId: BigInt(telegramUserId) })
      .onDuplicateKeyUpdate({ set: { telegramUserId: BigInt(telegramUserId) } })
  }

  async getOrigin(articleId: number) {
    const rows = await db.select({ tg: newsroomArticleOrigins.telegramUserId })
      .from(newsroomArticleOrigins).where(eq(newsroomArticleOrigins.articleId, articleId)).limit(1)
    return rows[0] ? String(rows[0].tg) : null
  }

  async getOrigins(ids: number[]) {
    if (!ids.length) return new Map<number, string>()
    const rows = await db.select({ id: newsroomArticleOrigins.articleId, tg: newsroomArticleOrigins.telegramUserId })
      .from(newsroomArticleOrigins).where(inArray(newsroomArticleOrigins.articleId, ids))
    return new Map(rows.map(r => [Number(r.id), String(r.tg)]))
  }

  async getArticle(id: number) {
    const rows = await db.select(ARTICLE_COLUMNS).from(articles).where(eq(articles.id, id)).limit(1)
    return rows[0] ? mapRow(rows[0]) : null
  }

  async listArticles(f: ArticleListFilter) {
    const conds: SQL[] = []
    if (f.q) {
      const pattern = `%${escapeLike(f.q)}%`
      conds.push(or(like(articles.title, pattern), like(articles.excerpt, pattern))!)
    }
    if (f.statuses?.length) conds.push(inArray(articles.status, f.statuses))
    if (f.categoryId) conds.push(eq(articles.categoryId, f.categoryId))
    if (f.since) conds.push(gte(articles.updatedAt, f.since))
    if (f.until) conds.push(lte(articles.updatedAt, f.until))
    const rows = await db.select(ARTICLE_COLUMNS).from(articles)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(articles.updatedAt), desc(articles.id))
      .limit(f.limit)
    return rows.map(mapRow)
  }

  async insertArticle(v: NewArticle) {
    try {
      const res = await db.insert(articles).values({
        slug: v.slug,
        title: v.title,
        subtitle: v.subtitle,
        body: v.body,
        excerpt: v.excerpt,
        categoryId: v.categoryId,
        authorId: v.authorId,
        featuredImage: v.featuredImage,
        imageCaption: v.imageCaption,
        imageAlt: v.imageAlt,
        status: v.status,
        isBreaking: v.isBreaking,
        isFeatured: v.isFeatured,
        publishedAt: v.publishedAt,
        scheduledAt: v.scheduledAt,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        metaTitle: v.metaTitle,
        metaDesc: v.metaDesc,
        aiGenerated: v.aiGenerated,
        aiReviewed: v.aiReviewed,
      }).$returningId()
      return Number(res[0].id)
    } catch (err) {
      if (isDuplicate(err) && /slug/i.test(errMessage(err))) throw new SlugTakenError()
      throw err
    }
  }

  async updateArticle(id: number, p: ArticlePatch, guard: ArticleGuard) {
    const set: Partial<typeof articles.$inferInsert> = {}
    if ('title' in p) set.title = p.title
    if ('subtitle' in p) set.subtitle = p.subtitle
    if ('body' in p) set.body = p.body
    if ('excerpt' in p) set.excerpt = p.excerpt
    if ('categoryId' in p) set.categoryId = p.categoryId
    if ('authorId' in p) set.authorId = p.authorId
    if ('featuredImage' in p) set.featuredImage = p.featuredImage
    if ('imageAlt' in p) set.imageAlt = p.imageAlt
    if ('imageCaption' in p) set.imageCaption = p.imageCaption
    if ('metaTitle' in p) set.metaTitle = p.metaTitle
    if ('metaDesc' in p) set.metaDesc = p.metaDesc
    if ('isBreaking' in p) set.isBreaking = p.isBreaking
    if ('status' in p) set.status = p.status
    if ('publishedAt' in p) set.publishedAt = p.publishedAt
    if ('scheduledAt' in p) set.scheduledAt = p.scheduledAt
    if ('updatedAt' in p) set.updatedAt = p.updatedAt
    const [res] = await db.update(articles).set(set).where(guardWhere(id, guard))
    return Number((res as { affectedRows?: number }).affectedRows ?? 0) > 0
  }

  async slugExists(slug: string) {
    const rows = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1)
    return rows.length > 0
  }

  /** Only articles scheduled through the newsroom API (see docs/newsroom/newsroom-api.md). */
  async listDueScheduled(now: Date, limit: number) {
    const rows = await db.select(ARTICLE_COLUMNS).from(articles)
      .where(and(
        eq(articles.status, 'scheduled'),
        lte(articles.scheduledAt, now),
        sql`EXISTS (SELECT 1 FROM ${newsroomAudit} WHERE ${newsroomAudit.articleId} = ${articles.id}
                    AND ${newsroomAudit.operation} = 'schedule' AND ${newsroomAudit.result} = 'ok')`,
      ))
      .orderBy(asc(articles.scheduledAt))
      .limit(limit)
    return rows.map(mapRow)
  }

  async listCategories() {
    const rows = await db.select({ id: categories.id, slug: categories.slug, name: categories.name })
      .from(categories).orderBy(asc(categories.sortOrder), asc(categories.name))
    return rows.map(r => ({ id: Number(r.id), slug: r.slug, name: r.name }))
  }

  async listAuthors() {
    const rows = await db.select({ id: authors.id, slug: authors.slug, name: authors.name })
      .from(authors).orderBy(asc(authors.name))
    return rows.map(r => ({ id: Number(r.id), slug: r.slug, name: r.name }))
  }

  async insertMedia(rec: MediaRecord) {
    const res = await db.insert(media).values({
      r2Key: rec.r2Key,
      cdnUrl: rec.cdnUrl,
      mimeType: rec.mimeType,
      width: rec.width,
      height: rec.height,
      sizeBytes: rec.sizeBytes,
      alt: rec.alt,
      articleId: rec.articleId,
    }).$returningId()
    return Number(res[0].id)
  }
}
