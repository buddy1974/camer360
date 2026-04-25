import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { createHash } from 'crypto'

// Pool created inside handler to avoid Next.js static env var inlining at build time
function getPool() {
  const url = process.env['QUEUE_NEON_URL'] ?? process.env['NEON_DATABASE_URL']
  return new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
}

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

function contentHash(title: string, url: string): string {
  return createHash('sha256').update(`${title}|${url}`).digest('hex').slice(0, 64)
}

// POST /api/n8n/ingest — receive RSS items from n8n, dedup + store in ingested_content queue
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pool = getPool()

  const body = await req.json()
  const items: Array<{
    source_name?: string
    source_url?: string
    raw_title: string
    raw_body?: string
    raw_image_url?: string
    language?: string
  }> = Array.isArray(body) ? body : [body]

  const results = await Promise.allSettled(items.map(async (item) => {
    const title = (item.raw_title ?? '').trim().slice(0, 319)
    if (!title) return { skipped: true, reason: 'empty title' }

    const hash = contentHash(title, item.source_url ?? '')

    const res = await pool.query(
      `INSERT INTO ingested_content
         (source_name, source_url, content_hash, raw_title, raw_body, raw_image_url, language, status, ingested_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
       ON CONFLICT (content_hash) DO NOTHING`,
      [
        item.source_name ?? 'RSS Feed',
        item.source_url  ?? null,
        hash,
        title,
        (item.raw_body ?? '').slice(0, 60000),
        item.raw_image_url ?? null,
        item.language ?? 'en',
      ]
    )

    return res.rowCount === 0
      ? { skipped: true, reason: 'duplicate' }
      : { inserted: true }
  }))

  await pool.end().catch(() => {})

  const inserted = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.inserted).length
  const skipped  = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.skipped).length
  const failed   = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ inserted, skipped, failed, total: items.length })
}
