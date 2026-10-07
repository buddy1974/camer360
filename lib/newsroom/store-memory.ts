/**
 * In-memory NewsroomStore used by the tests. Mirrors the MySQL semantics that
 * matter (unique slug, nonce uniqueness, CAS updates, second-precision dates).
 */
import {
  SlugTakenError,
  type ArticleGuard, type ArticleListFilter, type ArticlePatch, type ArticleRow,
  type AuditEntry, type Author, type Category, type Grant, type IdempotencyRecord,
  type MediaRecord, type NewArticle, type NewsroomStore,
} from './store'

const sec = (d: Date | null) => (d ? new Date(Math.floor(d.getTime() / 1000) * 1000) : null)
const same = (a: Date | null, b: Date | null) => (a?.getTime() ?? null) === (b?.getTime() ?? null)

export class MemoryStore implements NewsroomStore {
  nonces = new Map<string, Date>()
  grants = new Map<string, Grant>()
  idempotency = new Map<string, IdempotencyRecord>()
  audit: AuditEntry[] = []
  origins = new Map<number, string>()
  articles = new Map<number, ArticleRow>()
  categories: Category[] = []
  authors: Author[] = []
  media: Array<MediaRecord & { id: number }> = []
  /** counts every store call, so tests can assert "no DB access" */
  calls = 0
  private nextArticleId = 1000

  constructor(seed?: { categories?: Category[]; authors?: Author[]; grants?: Grant[] }) {
    this.categories = seed?.categories ?? []
    this.authors = seed?.authors ?? []
    for (const g of seed?.grants ?? []) this.grants.set(g.telegramUserId, g)
  }

  private tick() { this.calls++ }

  async consumeNonce(nonce: string, expiresAt: Date, now: Date) {
    this.tick()
    for (const [n, exp] of this.nonces) if (exp < now) this.nonces.delete(n)
    if (this.nonces.has(nonce)) return false
    this.nonces.set(nonce, expiresAt)
    return true
  }

  async getGrant(id: string) { this.tick(); return this.grants.get(id) ?? null }

  async reserveIdempotency(rec: Omit<IdempotencyRecord, 'statusCode' | 'responseJson'>) {
    this.tick()
    const k = `${rec.actor}\u0000${rec.key}`
    const existing = this.idempotency.get(k)
    if (existing) return { ...existing }
    this.idempotency.set(k, { ...rec, statusCode: 0, responseJson: null })
    return null
  }

  async completeIdempotency(key: string, actor: string, statusCode: number, responseJson: string) {
    this.tick()
    const r = this.idempotency.get(`${actor}\u0000${key}`)
    if (r) { r.statusCode = statusCode; r.responseJson = responseJson }
  }

  async releaseIdempotency(key: string, actor: string) { this.tick(); this.idempotency.delete(`${actor}\u0000${key}`) }

  async pruneExpired(now: Date, idemOlderThan: Date) {
    this.tick()
    for (const [n, exp] of this.nonces) if (exp < now) this.nonces.delete(n)
    for (const [k, r] of this.idempotency) if (r.createdAt < idemOlderThan) this.idempotency.delete(k)
  }

  async appendAudit(entry: AuditEntry) { this.tick(); this.audit.push({ ...entry }) }
  async recordOrigin(articleId: number, tg: string) { this.tick(); this.origins.set(articleId, tg) }
  async getOrigin(articleId: number) { this.tick(); return this.origins.get(articleId) ?? null }
  async getOrigins(ids: number[]) {
    this.tick()
    return new Map(ids.filter(i => this.origins.has(i)).map(i => [i, this.origins.get(i)!]))
  }

  async getArticle(id: number) { this.tick(); const r = this.articles.get(id); return r ? { ...r } : null }

  async listArticles(f: ArticleListFilter) {
    this.tick()
    let rows = [...this.articles.values()]
    if (f.q) {
      const q = f.q.toLowerCase()
      rows = rows.filter(r => r.title.toLowerCase().includes(q) || (r.excerpt ?? '').toLowerCase().includes(q))
    }
    if (f.statuses) rows = rows.filter(r => f.statuses!.includes(r.status))
    if (f.categoryId) rows = rows.filter(r => r.categoryId === f.categoryId)
    if (f.since) rows = rows.filter(r => r.updatedAt && r.updatedAt >= f.since!)
    if (f.until) rows = rows.filter(r => r.updatedAt && r.updatedAt <= f.until!)
    rows.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0) || b.id - a.id)
    return rows.slice(0, f.limit).map(r => ({ ...r }))
  }

  async insertArticle(v: NewArticle) {
    this.tick()
    if ([...this.articles.values()].some(r => r.slug === v.slug)) throw new SlugTakenError()
    const id = ++this.nextArticleId
    this.articles.set(id, {
      ...v, id,
      publishedAt: sec(v.publishedAt), scheduledAt: sec(v.scheduledAt),
      createdAt: sec(v.createdAt), updatedAt: sec(v.updatedAt),
    })
    return id
  }

  /** Test helper: put an arbitrary row (e.g. a CMS-created article). */
  seedArticle(row: Partial<ArticleRow> & Pick<ArticleRow, 'slug' | 'title' | 'categoryId'>): ArticleRow {
    const id = row.id ?? ++this.nextArticleId
    const full: ArticleRow = {
      id, subtitle: null, body: '<p>x</p>', excerpt: null, authorId: null, featuredImage: null,
      imageCaption: null, imageAlt: null, status: 'draft', isBreaking: false, isFeatured: false,
      publishedAt: null, scheduledAt: null, createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'), metaTitle: null, metaDesc: null,
      aiGenerated: false, aiReviewed: false, ...row,
    }
    this.articles.set(id, full)
    return full
  }

  async updateArticle(id: number, patch: ArticlePatch, guard: ArticleGuard) {
    this.tick()
    const r = this.articles.get(id)
    if (!r || r.status !== guard.status || !same(r.updatedAt, guard.updatedAt)) return false
    const next: ArticleRow = { ...r, ...patch }
    for (const k of ['publishedAt', 'scheduledAt', 'updatedAt'] as const) {
      if (k in patch) next[k] = sec(patch[k] ?? null)
    }
    this.articles.set(id, next)
    return true
  }

  async slugExists(slug: string) { this.tick(); return [...this.articles.values()].some(r => r.slug === slug) }

  async listDueScheduled(now: Date, limit: number) {
    this.tick()
    const scheduledViaNewsroom = new Set(
      this.audit.filter(a => a.operation === 'schedule' && a.result === 'ok').map(a => a.articleId),
    )
    return [...this.articles.values()]
      .filter(r => r.status === 'scheduled' && r.scheduledAt && r.scheduledAt <= now && scheduledViaNewsroom.has(r.id))
      .sort((a, b) => a.scheduledAt!.getTime() - b.scheduledAt!.getTime())
      .slice(0, limit)
      .map(r => ({ ...r }))
  }

  async listCategories() { this.tick(); return [...this.categories] }
  async listAuthors() { this.tick(); return [...this.authors] }

  async insertMedia(rec: MediaRecord) {
    this.tick()
    const id = this.media.length + 1
    this.media.push({ ...rec, id })
    return id
  }
}
