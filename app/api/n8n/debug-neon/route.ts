import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// TEMPORARY DEBUG ROUTE — DELETE AFTER DIAGNOSIS
export async function GET(req: NextRequest) {
  if (req.headers.get('x-api-key') !== (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Build Neon URL from individual parts (bracket notation avoids static inlining)
  const neonHost = process.env['NEON_HOST']
  const neonUser = process.env['NEON_USER']
  const neonPass = process.env['NEON_PASSWORD']
  const neonDb   = process.env['NEON_DB']
  const urlFull  = process.env['QUEUE_NEON_URL'] ?? process.env['NEON_DATABASE_URL']

  const urlParts = (neonHost && neonUser && neonPass && neonDb)
    ? `postgresql://${neonUser}:${neonPass}@${neonHost}/${neonDb}?sslmode=require`
    : null

  const checks = {
    NEON_HOST:        neonHost ? 'SET' : 'MISSING',
    NEON_USER:        neonUser ? 'SET' : 'MISSING',
    NEON_PASSWORD:    neonPass ? 'SET' : 'MISSING',
    NEON_DB:          neonDb   ? 'SET' : 'MISSING',
    QUEUE_NEON_URL:   urlFull  ? 'SET' : 'MISSING',
    url_from_parts:   urlParts ? 'built' : 'cannot_build',
    OPENAI_API_KEY:   process.env['OPENAI_API_KEY']   ? 'SET' : 'MISSING',
    DB_HOST:          process.env['DB_HOST']           ? 'SET' : 'MISSING',
  }

  const url = urlFull ?? urlParts
  let neonTest = 'not_run'
  if (url) {
    try {
      const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
      const r = await p.query('SELECT COUNT(*) as n FROM ingested_content')
      await p.end()
      neonTest = 'ok_count=' + r.rows[0].n
    } catch (e: any) { neonTest = 'fail:' + e.message.slice(0, 80) }
  } else {
    // Fallback test with hardcoded URL
    try {
      const hardcoded = 'postgresql://neondb_owner:npg_ciuvaV27YKAB@ep-calm-block-amc3x1xf-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
      const p = new Pool({ connectionString: hardcoded, ssl: { rejectUnauthorized: false } })
      const r = await p.query('SELECT COUNT(*) as n FROM ingested_content')
      await p.end()
      neonTest = 'hardcoded_ok_count=' + r.rows[0].n
    } catch (e: any) { neonTest = 'hardcoded_fail:' + e.message.slice(0, 80) }
  }

  return NextResponse.json({ checks, neon_test: neonTest })
}
