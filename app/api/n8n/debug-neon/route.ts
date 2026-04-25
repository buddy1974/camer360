import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// TEMPORARY DEBUG ROUTE — DELETE AFTER DIAGNOSIS
export async function GET(req: NextRequest) {
  if (req.headers.get('x-api-key') !== (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEON_DATABASE_URL
  const urlPreview = url !== undefined ? (url.length > 0 ? url.slice(0, 60) + '...' : 'EMPTY_STRING') : 'UNDEFINED'

  // List all env keys that mention neon/db/pg
  const allKeys = Object.keys(process.env)
  const dbKeys = allKeys.filter(k => /neon|database|postgres|pg|db_/i.test(k))

  try {
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
    const result = await pool.query('SELECT COUNT(*) as n FROM ingested_content')
    await pool.end()
    return NextResponse.json({ ok: true, neon_url_preview: urlPreview, count: result.rows[0].n, db_env_keys: dbKeys })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      neon_url_preview: urlPreview,
      error: e.message,
      code: e.code,
      db_env_keys: dbKeys,
      total_env_count: allKeys.length,
    })
  }
}
