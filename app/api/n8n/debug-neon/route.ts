import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// TEMPORARY DEBUG ROUTE — DELETE AFTER DIAGNOSIS
export async function GET(req: NextRequest) {
  if (req.headers.get('x-api-key') !== (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.QUEUE_NEON_URL ?? process.env.NEON_DATABASE_URL
  const urlPreview = url !== undefined ? (url.length > 0 ? url.slice(0, 60) + '...' : 'EMPTY_STRING') : 'UNDEFINED'

  const allKeys = Object.keys(process.env).sort()
  const dbKeys = allKeys.filter(k => /neon|database|postgres|pg|db_|queue/i.test(k))
  // All non-system keys (project-specific)
  const projectKeys = allKeys.filter(k => !/^(node_|next_|path|home|tmpdir|vercel_git|hostname|pwd|shell|term|user$|lang$)/i.test(k))

  // Check if other sensitive vars are visible
  const sensitiveCheck = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET(len='+process.env.OPENAI_API_KEY.length+')' : 'MISSING',
    AUTOMATION_API_KEY: process.env.AUTOMATION_API_KEY ? 'SET' : 'MISSING',
    NEON_DATABASE_URL: url !== undefined ? (url.length > 0 ? 'SET(len='+url.length+')' : 'EMPTY') : 'MISSING',
  }

  // Test with hardcoded URL to bypass env var issue
  const hardcodedUrl = 'postgresql://neondb_owner:npg_ciuvaV27YKAB@ep-calm-block-amc3x1xf-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
  let hardcodedTest = 'not_run'
  try {
    const p2 = new Pool({ connectionString: hardcodedUrl, ssl: { rejectUnauthorized: false } })
    const r2 = await p2.query('SELECT COUNT(*) as n FROM ingested_content')
    await p2.end()
    hardcodedTest = 'ok_count=' + r2.rows[0].n
  } catch(e2: any) {
    hardcodedTest = 'fail:' + e2.message.slice(0, 80)
  }

  try {
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
    const result = await pool.query('SELECT COUNT(*) as n FROM ingested_content')
    await pool.end()
    return NextResponse.json({ ok: true, neon_url_preview: urlPreview, count: result.rows[0].n, db_env_keys: dbKeys, sensitive_check: sensitiveCheck, hardcoded_test: hardcodedTest })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      neon_url_preview: urlPreview,
      error: e.message,
      code: e.code,
      db_env_keys: dbKeys,
      total_env_count: allKeys.length,
      project_keys: projectKeys,
      sensitive_check: sensitiveCheck,
      hardcoded_test: hardcodedTest,
    })
  }
}
