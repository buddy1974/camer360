/**
 * Production media runtime: Cloudflare R2 (S3 API) + sharp, configured exactly
 * like the CMS upload route (app/api/admin/upload/route.ts).
 */
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'
import type { MediaRuntime } from './media'

let client: S3Client | null = null
function s3(): S3Client {
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  })
  return client
}

const bucket = () => process.env.R2_BUCKET ?? ''
const base = () => (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '')

export function createMediaRuntime(): MediaRuntime {
  return {
    storage: {
      async put(key, body, contentType) {
        await s3().send(new PutObjectCommand({
          Bucket: bucket(), Key: key, Body: body, ContentType: contentType,
          CacheControl: 'public, max-age=31536000',
        }))
      },
      async head(key) {
        try {
          const r = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }))
          return { contentType: r.ContentType ?? null, size: Number(r.ContentLength ?? 0) }
        } catch (err) {
          const e = err as { name?: string; $metadata?: { httpStatusCode?: number } }
          if (e?.name === 'NotFound' || e?.$metadata?.httpStatusCode === 404) return null
          throw err
        }
      },
      async get(key) {
        const r = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }))
        if (!r.Body) throw new Error('empty object')
        return Buffer.from(await r.Body.transformToByteArray())
      },
      async delete(key) {
        await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
      },
      async presignPut(key, contentType, expiresIn) {
        // Only Content-Type is bound; the client must send exactly that header.
        return getSignedUrl(s3(), new PutObjectCommand({
          Bucket: bucket(), Key: key, ContentType: contentType,
        }), { expiresIn, signableHeaders: new Set(['content-type']) })
      },
      publicUrl(key) {
        return `${base()}/${key}`
      },
    },
    async processImage(input) {
      const { data, info } = await sharp(input)
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true })
      return { data, width: info.width, height: info.height }
    },
  }
}
