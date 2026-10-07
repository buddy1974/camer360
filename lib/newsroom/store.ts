/**
 * Persistence boundary for the Newsroom API. Business logic only talks to this
 * interface; `store-mysql.ts` is the production implementation and
 * `store-memory.ts` backs the tests (no database involved).
 */
import type { NewsroomRole } from './permissions'

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'unpublished'
export const ARTICLE_STATUSES: readonly ArticleStatus[] = ['draft', 'scheduled', 'published', 'archived', 'unpublished']

/** The subset of `articles` columns the newsroom reads/writes (explicit mapping). */
export interface ArticleRow {
  id: number
  slug: string
  title: string
  subtitle: string | null
  body: string
  excerpt: string | null
  categoryId: number
  authorId: number | null
  featuredImage: string | null
  imageCaption: string | null
  imageAlt: string | null
  status: ArticleStatus
  isBreaking: boolean
  isFeatured: boolean
  publishedAt: Date | null
  scheduledAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
  metaTitle: string | null
  metaDesc: string | null
  aiGenerated: boolean
  aiReviewed: boolean
}

export type NewArticle = Omit<ArticleRow, 'id'>

/** Columns the newsroom may change on an existing article. Never slug/id/system columns. */
export type ArticlePatch = Partial<Pick<ArticleRow,
  | 'title' | 'subtitle' | 'body' | 'excerpt' | 'categoryId' | 'authorId'
  | 'featuredImage' | 'imageAlt' | 'imageCaption' | 'metaTitle' | 'metaDesc' | 'isBreaking'
  | 'status' | 'publishedAt' | 'scheduledAt' | 'updatedAt'
>>

/** Compare-and-swap guard: the update only applies if the row still matches. */
export interface ArticleGuard {
  status: ArticleStatus
  updatedAt: Date | null
}

export interface ArticleListFilter {
  q?: string
  statuses?: ArticleStatus[]
  categoryId?: number
  since?: Date
  until?: Date
  limit: number
}

export interface Category { id: number; slug: string; name: string }
export interface Author { id: number; slug: string; name: string }

export interface Grant {
  telegramUserId: string
  role: NewsroomRole
  active: boolean
  displayName: string | null
}

export interface IdempotencyRecord {
  key: string
  actor: string
  method: string
  path: string
  requestHash: string
  /** 0 while the original request is still in flight */
  statusCode: number
  responseJson: string | null
  createdAt: Date
}

export interface AuditEntry {
  requestId: string
  actor: string
  operation: string
  articleId: number | null
  changedFields: string[] | null
  idempotencyKey: string | null
  result: 'ok' | 'denied' | 'error'
  errorCode: string | null
}

export interface MediaRecord {
  r2Key: string
  cdnUrl: string
  mimeType: string
  width: number | null
  height: number | null
  sizeBytes: number
  alt: string | null
  articleId: number | null
}

export class SlugTakenError extends Error {
  constructor() { super('slug already exists'); this.name = 'SlugTakenError' }
}

export interface NewsroomStore {
  // ── replay protection ─────────────────────────────────────────
  /** Insert the nonce; false when it already exists (replay). */
  consumeNonce(nonce: string, expiresAt: Date, now: Date): Promise<boolean>

  // ── actors ────────────────────────────────────────────────────
  getGrant(telegramUserId: string): Promise<Grant | null>

  // ── idempotency ───────────────────────────────────────────────
  /** Reserve a key. Returns null when reserved, or the existing record when the key is taken. */
  reserveIdempotency(rec: Omit<IdempotencyRecord, 'statusCode' | 'responseJson'>): Promise<IdempotencyRecord | null>
  completeIdempotency(key: string, actor: string, statusCode: number, responseJson: string): Promise<void>
  releaseIdempotency(key: string, actor: string): Promise<void>
  pruneExpired(now: Date, idempotencyOlderThan: Date): Promise<void>

  // ── audit / origins ───────────────────────────────────────────
  appendAudit(entry: AuditEntry): Promise<void>
  recordOrigin(articleId: number, telegramUserId: string): Promise<void>
  getOrigin(articleId: number): Promise<string | null>
  getOrigins(articleIds: number[]): Promise<Map<number, string>>

  // ── articles ──────────────────────────────────────────────────
  getArticle(id: number): Promise<ArticleRow | null>
  listArticles(filter: ArticleListFilter): Promise<ArticleRow[]>
  /** Throws SlugTakenError on a unique-slug collision. */
  insertArticle(values: NewArticle): Promise<number>
  /** Applies the patch only if the guard still matches; returns false otherwise. */
  updateArticle(id: number, patch: ArticlePatch, guard: ArticleGuard): Promise<boolean>
  slugExists(slug: string): Promise<boolean>
  listDueScheduled(now: Date, limit: number): Promise<ArticleRow[]>

  // ── taxonomy ──────────────────────────────────────────────────
  listCategories(): Promise<Category[]>
  listAuthors(): Promise<Author[]>

  // ── media ─────────────────────────────────────────────────────
  insertMedia(rec: MediaRecord): Promise<number>
}
