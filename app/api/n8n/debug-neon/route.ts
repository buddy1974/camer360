import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// TEMPORARY DEBUG ROUTE — DELETE AFTER DIAGNOSIS
export async function GET(req: NextRequest) {
  if (req.headers.get('x-api-key') !== (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Test dot notation (may be statically inlined to undefined by Next.js at build time)
  const urlDot = process.env.QUEUE_NEON_URL

  // Test bracket notation (avoids Next.js static inlining — read at runtime)
  const urlBracket = process.env['QUEUE_NEON_URL']

  const checks = {
    dot_notation:     urlDot     ? 'SET(len=' + urlDot.length + ')'     : 'UNDEFINED',
    bracket_notation: urlBracket ? 'SET(len=' + urlBracket.length + ')' : 'UNDEFINED',
    OPENAI_API_KEY:   process.env['OPENAI_API_KEY']   ? 'SET' : 'MISSING',
    DB_HOST:          process.env['DB_HOST']           ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'] ? 'SET' : 'MISSING',
  }

  const url = urlBracket ?? urlDot
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
