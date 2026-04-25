import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

function getNeonUrl(): string {
  const full = process.env['QUEUE_NEON_URL'] ?? process.env['NEON_DATABASE_URL']
  if (full) return full
  const h = process.env['NEON_HOST'], u = process.env['NEON_USER'],
        p = process.env['NEON_PASSWORD'], d = process.env['NEON_DB']
  if (h && u && p && d) return `postgresql://${u}:${p}@${h}/${d}?sslmode=require`
  throw new Error('Neon connection not configured')
}

function getPool() {
  return new Pool({ connectionString: getNeonUrl(), ssl: { rejectUnauthorized: false } })
}

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

// GET /api/n8n/queue?limit=5 — fetch pending items for AI enhancement
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 5), 20)
  const pool = getPool()

  try {
    const { rows } = await pool.query(`
      SELECT id, source_name, source_url, raw_title, raw_body, raw_image_url, language
      FROM ingested_content
      WHERE status = 'pending'
      ORDER BY ingested_at ASC
      LIMIT $1
    `, [limit])

    if (rows.length > 0) {
      const ids = rows.map(r => r.id)
      await pool.query(
        `UPDATE ingested_content SET status='processing' WHERE id = ANY($1)`,
        [ids]
      )
    }

    return NextResponse.json(rows)
  } finally {
    await pool.end().catch(() => {})
  }
}

// PATCH /api/n8n/queue — mark items as processed or rejected
export async function PATCH(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, reject_reason, article_id } = await req.json()
  if (!id || !['processed', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const pool = getPool()
  try {
    await pool.query(`
      UPDATE ingested_content
      SET status=$1, reject_reason=$2, cc_article_id=$3
      WHERE id=$4
    `, [status, reject_reason ?? null, article_id ?? null, id])

    return NextResponse.json({ ok: true })
  } finally {
    await pool.end().catch(() => {})
  }
}
