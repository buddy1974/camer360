/**
 * Newsroom media (contract §9). Storage and image processing are injected so
 * the business rules (limits, types, permissions, version checks) are testable
 * without R2 or sharp. The production runtime lives in media-runtime.ts.
 */
import { randomUUID } from 'node:crypto'
import { NewsroomError, validation } from './http'
import { canUploadMedia, type Actor } from './permissions'
import { asObject, computeVersion, floorToSecond, loadArticle, type Article, type RevalidateTarget, type ServiceDeps } from './articles'
import type { ArticlePatch } from './store'

export const MAX_DIRECT_BYTES = 4 * 1024 * 1024
export const MAX_PRESIGN_IMAGE_BYTES = 25 * 1024 * 1024
export const MAX_PRESIGN_BYTES = 100 * 1024 * 1024
export const PRESIGN_EXPIRES_SECONDS = 15 * 60

export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
}
export const RAW_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
}
const ALLOWED = { ...IMAGE_TYPES, ...RAW_TYPES }
export const isImageType = (ct: string) => ct in IMAGE_TYPES

export interface MediaStorage {
  put(key: string, body: Buffer, contentType: string): Promise<void>
  head(key: string): Promise<{ contentType: string | null; size: number } | null>
  get(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  presignPut(key: string, contentType: string, expiresInSeconds: number): Promise<string>
  publicUrl(key: string): string
}

export type ImageProcessor = (input: Buffer) => Promise<{ data: Buffer; width: number; height: number }>

export interface MediaRuntime { storage: MediaStorage; processImage: ImageProcessor }

export type MediaRole = 'featured' | 'inline' | 'attachment'

export interface MediaResult {
  mediaId: number
  url: string
  contentType: string
  width: number | null
  height: number | null
  sizeBytes: number
  article?: Article
}

export interface MediaOutcome {
  data: MediaResult
  articleId: number | null
  changedFields: string[]
  revalidate: RevalidateTarget[]
}

function normaliseType(ct: unknown): string {
  return typeof ct === 'string' ? ct.trim().toLowerCase() : ''
}

interface Attach {
  articleId: number | null
  role: MediaRole
  alt: string | null
  caption: string | null
  expectedVersion: string | null
}

function parseAttach(o: Record<string, unknown>, errors: Record<string, string>): Attach {
  let articleId: number | null = null
  if (o.articleId !== undefined && o.articleId !== null) {
    if (typeof o.articleId !== 'number' || !Number.isInteger(o.articleId) || o.articleId <= 0) errors.articleId = 'must be a positive integer'
    else articleId = o.articleId
  }
  let role: MediaRole = articleId ? 'inline' : 'attachment'
  if (o.role !== undefined && o.role !== null) {
    if (o.role !== 'featured' && o.role !== 'inline' && o.role !== 'attachment') errors.role = 'must be featured, inline or attachment'
    else role = o.role
  }
  const str = (k: 'alt' | 'caption', max: number): string | null => {
    const v = o[k]
    if (v === undefined || v === null) return null
    if (typeof v !== 'string') { errors[k] = 'must be a string'; return null }
    if (v.trim().length > max) { errors[k] = `must be at most ${max} characters`; return null }
    return v.trim() || null
  }
  const alt = str('alt', 255)
  const caption = str('caption', 512)
  let expectedVersion: string | null = null
  if (o.expectedVersion !== undefined && o.expectedVersion !== null) {
    if (typeof o.expectedVersion !== 'string') errors.expectedVersion = 'must be a string'
    else expectedVersion = o.expectedVersion
  }
  if (role === 'featured') {
    if (!articleId) errors.articleId = 'required when role=featured'
    if (!expectedVersion) errors.expectedVersion = 'required when role=featured'
  }
  return { articleId, role, alt, caption, expectedVersion }
}

/** Permission + version pre-checks, before anything is uploaded. */
async function precheck(deps: ServiceDeps, actor: Actor, a: Attach, contentType: string) {
  if (a.role === 'featured' && !isImageType(contentType)) {
    throw validation('A featured image must be an image', { contentType: 'not an image' })
  }
  if (!a.articleId) {
    if (!canUploadMedia(actor, null)) throw new NewsroomError('FORBIDDEN', 'Not allowed to upload media')
    return null
  }
  const row = await deps.store.getArticle(a.articleId)
  if (!row) throw new NewsroomError('NOT_FOUND', 'Article not found')
  const origin = await deps.store.getOrigin(a.articleId)
  if (!canUploadMedia(actor, { status: row.status, originTelegramId: origin })) {
    throw new NewsroomError('FORBIDDEN', 'Not allowed to upload media to this article')
  }
  if (a.role === 'featured' && computeVersion(row) !== a.expectedVersion) {
    throw new NewsroomError('VERSION_CONFLICT', 'Article changed since it was read; re-read and retry')
  }
  return row
}

async function finalize(
  deps: ServiceDeps, a: Attach, row: Awaited<ReturnType<typeof precheck>>,
  stored: { key: string; url: string; contentType: string; width: number | null; height: number | null; size: number },
): Promise<MediaOutcome> {
  const mediaId = await deps.store.insertMedia({
    r2Key: stored.key, cdnUrl: stored.url, mimeType: stored.contentType,
    width: stored.width, height: stored.height, sizeBytes: stored.size,
    alt: a.alt ?? a.caption, articleId: a.articleId,
  })
  const data: MediaResult = {
    mediaId, url: stored.url, contentType: stored.contentType,
    width: stored.width, height: stored.height, sizeBytes: stored.size,
  }
  const changedFields = ['media']
  let revalidate: RevalidateTarget[] = []
  if (a.role === 'featured' && row) {
    const patch: ArticlePatch = { featuredImage: stored.url, updatedAt: floorToSecond(deps.now) }
    changedFields.push('featuredImage')
    if (a.alt !== null) { patch.imageAlt = a.alt; changedFields.push('imageAlt') }
    if (a.caption !== null) { patch.imageCaption = a.caption; changedFields.push('imageCaption') }
    const ok = await deps.store.updateArticle(row.id, patch, { status: row.status, updatedAt: row.updatedAt })
    if (!ok) throw new NewsroomError('VERSION_CONFLICT', 'Article changed concurrently; media was stored but not attached')
    if (row.status === 'published') {
      const cats = await deps.store.listCategories()
      revalidate = [{ categorySlug: cats.find(c => c.id === row.categoryId)?.slug ?? null, slug: row.slug }]
    }
  }
  if (a.articleId) data.article = await loadArticle(deps, a.articleId)
  return { data, articleId: a.articleId, changedFields, revalidate }
}

async function storeBytes(rt: MediaRuntime, bytes: Buffer, contentType: string) {
  if (isImageType(contentType)) {
    let processed: Awaited<ReturnType<ImageProcessor>>
    try {
      processed = await rt.processImage(bytes)
    } catch {
      throw validation('File is not a readable image', { dataBase64: 'not a valid image' })
    }
    const key = `newsroom/${randomUUID()}.webp`
    await rt.storage.put(key, processed.data, 'image/webp')
    return { key, url: rt.storage.publicUrl(key), contentType: 'image/webp', width: processed.width, height: processed.height, size: processed.data.length }
  }
  const key = `newsroom/${randomUUID()}.${RAW_TYPES[contentType]}`
  await rt.storage.put(key, bytes, contentType)
  return { key, url: rt.storage.publicUrl(key), contentType, width: null, height: null, size: bytes.length }
}

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/

/** POST /media — base64 direct upload, ≤ 4 MB decoded. */
export async function uploadDirect(deps: ServiceDeps, rt: MediaRuntime, actor: Actor, input: unknown): Promise<MediaOutcome> {
  const o = asObject(input)
  const errors: Record<string, string> = {}
  if (typeof o.filename !== 'string' || !o.filename.trim() || o.filename.length > 255) errors.filename = 'required, at most 255 characters'
  const contentType = normaliseType(o.contentType)
  if (!(contentType in ALLOWED)) errors.contentType = `must be one of ${Object.keys(ALLOWED).join(', ')}`
  let bytes: Buffer | null = null
  if (typeof o.dataBase64 !== 'string' || !o.dataBase64) {
    errors.dataBase64 = 'required'
  } else {
    const b64 = o.dataBase64.replace(/\s+/g, '')
    // Cheap size bound before decoding (4 base64 chars → 3 bytes).
    if (Math.floor(b64.length * 3 / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0) > MAX_DIRECT_BYTES) {
      errors.dataBase64 = `decoded size exceeds ${MAX_DIRECT_BYTES} bytes; use /media/presign`
    } else if (!BASE64_RE.test(b64) || b64.length % 4 !== 0) {
      errors.dataBase64 = 'must be standard base64'
    } else {
      bytes = Buffer.from(b64, 'base64')
      if (bytes.length === 0) errors.dataBase64 = 'empty file'
    }
  }
  const attach = parseAttach(o, errors)
  if (Object.keys(errors).length) throw validation('Invalid media upload', errors)

  const row = await precheck(deps, actor, attach, contentType)
  const stored = await storeBytes(rt, bytes!, contentType)
  return finalize(deps, attach, row, stored)
}

/** POST /media/presign — presigned R2 PUT (15 min) for large files. */
export async function presignUpload(deps: ServiceDeps, rt: MediaRuntime, actor: Actor, input: unknown) {
  const o = asObject(input)
  const errors: Record<string, string> = {}
  if (typeof o.filename !== 'string' || !o.filename.trim() || o.filename.length > 255) errors.filename = 'required, at most 255 characters'
  const contentType = normaliseType(o.contentType)
  if (!(contentType in ALLOWED)) errors.contentType = `must be one of ${Object.keys(ALLOWED).join(', ')}`
  const max = isImageType(contentType) ? MAX_PRESIGN_IMAGE_BYTES : MAX_PRESIGN_BYTES
  if (typeof o.sizeBytes !== 'number' || !Number.isInteger(o.sizeBytes) || o.sizeBytes <= 0) errors.sizeBytes = 'must be a positive integer'
  else if (o.sizeBytes > max) errors.sizeBytes = `must be at most ${max} bytes`
  if (Object.keys(errors).length) throw validation('Invalid presign request', errors)
  if (!canUploadMedia(actor, null)) throw new NewsroomError('FORBIDDEN', 'Not allowed to upload media')

  const key = `newsroom/${randomUUID()}.${ALLOWED[contentType]}`
  const uploadUrl = await rt.storage.presignPut(key, contentType, PRESIGN_EXPIRES_SECONDS)
  return {
    key,
    uploadUrl,
    /** final for non-images; images are re-encoded to WebP on /media/confirm (use its url) */
    publicUrl: rt.storage.publicUrl(key),
    expiresAt: new Date(deps.now.getTime() + PRESIGN_EXPIRES_SECONDS * 1000).toISOString(),
    method: 'PUT' as const,
    headers: { 'content-type': contentType },
  }
}

const PRESIGNED_KEY_RE = /^newsroom\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|pdf|mp4|mov|ogg|mp3)$/

/** POST /media/confirm — record a presigned upload after it completed (HeadObject). */
export async function confirmUpload(deps: ServiceDeps, rt: MediaRuntime, actor: Actor, input: unknown): Promise<MediaOutcome> {
  const o = asObject(input)
  const errors: Record<string, string> = {}
  const key = typeof o.key === 'string' ? o.key : ''
  if (!PRESIGNED_KEY_RE.test(key)) errors.key = 'must be a key returned by /media/presign'
  const attach = parseAttach(o, errors)
  if (Object.keys(errors).length) throw validation('Invalid confirm request', errors)

  const ext = key.split('.').pop()!
  const expectedType = Object.entries(ALLOWED).find(([, e]) => e === ext)![0]
  const row = await precheck(deps, actor, attach, expectedType)

  const head = await rt.storage.head(key)
  if (!head) throw new NewsroomError('NOT_FOUND', 'Upload not found — PUT the file to uploadUrl first')
  const headType = normaliseType(head.contentType)
  if (headType && headType !== expectedType) {
    await rt.storage.delete(key).catch(() => {})
    throw validation('Uploaded content type does not match the presigned type', { contentType: headType })
  }
  const max = isImageType(expectedType) ? MAX_PRESIGN_IMAGE_BYTES : MAX_PRESIGN_BYTES
  if (head.size > max) {
    await rt.storage.delete(key).catch(() => {})
    throw validation(`Uploaded file exceeds ${max} bytes`, { sizeBytes: 'too large' })
  }

  let stored
  if (isImageType(expectedType)) {
    // Re-encode like the CMS upload (WebP ≤ 1200 px), then drop the raw original.
    const raw = await rt.storage.get(key)
    stored = await storeBytes(rt, raw, expectedType)
    await rt.storage.delete(key).catch(() => {})
  } else {
    stored = { key, url: rt.storage.publicUrl(key), contentType: expectedType, width: null, height: null, size: head.size }
  }
  return finalize(deps, attach, row, stored)
}
