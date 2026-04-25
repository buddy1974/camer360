import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// TEMPORARY DEBUG ROUTE — DELETE AFTER DIAGNOSIS
export async function GET(req: NextRequest) {
  if (req.headers.get('x-api-key') !== (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEON_DATABASE_URL
  const urlPreview = url ? url.slice(0, 50) + '...[len=' + url.length + ']' : 'MISSING'

  try {
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
    const result = await pool.query('SELECT COUNT(*) as n FROM ingested_content')
    await pool.end()
    return NextResponse.json({ ok: true, neon_url_preview: urlPreview, count: result.rows[0].n })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      neon_url_preview: urlPreview,
      error: e.message,
      code: e.code,
    })
  }
}
