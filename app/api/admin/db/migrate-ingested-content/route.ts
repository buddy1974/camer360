import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function isAdmin(req: NextRequest): Promise<boolean> {
  // Accept admin cookie OR automation API key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])) return true
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return !!(token && verifyToken(token))
}

/**
 * POST /api/admin/db/migrate-ingested-content
 * Adds resilience columns to ingested_content table.
 * Safe to run multiple times (uses IF NOT EXISTS / IGNORE).
 *
 * Adds:
 *   retry_count           INT DEFAULT 0
 *   last_error            MEDIUMTEXT
 *   processing_started_at DATETIME
 */
export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, string> = {}

  const migrations = [
    {
      name: 'retry_count',
      query: sql.raw(`ALTER TABLE ingested_content ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0`),
    },
    {
      name: 'last_error',
      query: sql.raw(`ALTER TABLE ingested_content ADD COLUMN IF NOT EXISTS last_error MEDIUMTEXT`),
    },
    {
      name: 'processing_started_at',
      query: sql.raw(`ALTER TABLE ingested_content ADD COLUMN IF NOT EXISTS processing_started_at DATETIME`),
    },
    {
      name: 'idx_processing_started',
      query: sql.raw(`ALTER TABLE ingested_content ADD INDEX IF NOT EXISTS idx_processing_started (status, processing_started_at)`),
    },
  ]

  for (const { name, query } of migrations) {
    try {
      await db.execute(query)
      results[name] = 'ok'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Ignore "Duplicate column" errors — means column already exists
      if (msg.includes('Duplicate column') || msg.includes('already exists')) {
        results[name] = 'already_exists'
      } else {
        results[name] = `error: ${msg}`
      }
    }
  }

  const allOk = Object.values(results).every(v => v === 'ok' || v === 'already_exists')

  return NextResponse.json({
    ok: allOk,
    results,
    message: allOk
      ? 'Migration complete. ingested_content now has retry_count, last_error, processing_started_at.'
      : 'Some migrations failed — check results above.',
  })
}
