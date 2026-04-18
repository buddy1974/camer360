import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import crypto from 'crypto'

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === process.env.NEXT_PUBLIC_AUTOMATION_API_KEY
}

// POST /api/n8n/ingest — receive RSS items from n8n, dedup + store in Neon
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const items: Array<{
    source_name: string
    source_url: string
    raw_title: string
    raw_body?: string
    raw_image_url?: string
    language?: string
  }> = Array.isArray(body) ? body : [body]

  const results = await Promise.allSettled(items.map(async (item) => {
    const hash = crypto.createHash('sha256')
      .update(item.source_url + item.raw_title)
      .digest('hex')

    await pool.query(`
      INSERT INTO ingested_content
        (source_name, source_url, content_hash, raw_title, raw_body, raw_image_url, language, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
      ON CONFLICT (content_hash) DO NOTHING
    `, [
      item.source_name,
      item.source_url,
      hash,
      item.raw_title,
      item.raw_body ?? '',
      item.raw_image_url ?? '',
      item.language ?? 'en',
    ])
    return hash
  }))

  const inserted = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ inserted, total: items.length })
}
