import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { db } from '@/lib/db/client'
import { media } from '@/lib/db/schema'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function processAndUpload(file: File): Promise<{ url: string; key: string; width: number; height: number; size: number }> {
  const rawBuffer = Buffer.from(await file.arrayBuffer())

  const { data: webpBuffer, info } = await sharp(rawBuffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true })

  const key = `uploads/${randomUUID()}.webp`

  await s3.send(new PutObjectCommand({
    Bucket:       process.env.R2_BUCKET!,
    Key:          key,
    Body:         webpBuffer,
    ContentType:  'image/webp',
    CacheControl: 'public, max-age=31536000',
  }))

  return {
    url:    `${process.env.R2_PUBLIC_URL}/${key}`,
    key,
    width:  info.width,
    height: info.height,
    size:   info.size,
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form  = await req.formData()

  // Support both single file (file) and multiple files (files[])
  const single  = form.get('file') as File | null
  const multi   = form.getAll('files') as File[]
  const files   = single ? [single] : multi

  if (files.length === 0) {
    return NextResponse.json({ error: 'No file(s) provided' }, { status: 400 })
  }

  const results = await Promise.allSettled(files.map(processAndUpload))

  const uploaded: string[] = []
  const failed: string[]   = []

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'fulfilled') {
      const { url, key, width, height, size } = r.value
      uploaded.push(url)
      // Track in media table (fire-and-forget — don't block response)
      db.insert(media).values({
        r2Key:     key,
        cdnUrl:    url,
        mimeType:  'image/webp',
        width,
        height,
        sizeBytes: size,
        alt:       files[i].name.replace(/\.[^.]+$/, ''),
      }).catch(() => {})
    } else {
      failed.push(files[i].name)
    }
  }

  if (uploaded.length === 0) {
    return NextResponse.json({ error: 'All uploads failed' }, { status: 500 })
  }

  // Single-file backward compat: return `url` string
  if (single) {
    return NextResponse.json({ url: uploaded[0] })
  }

  return NextResponse.json({ urls: uploaded, failed })
}
