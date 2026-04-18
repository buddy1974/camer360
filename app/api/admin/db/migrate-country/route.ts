import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

async function runMigration() {
  try {
    await db.execute(sql`
      ALTER TABLE articles
      ADD COLUMN IF NOT EXISTS country VARCHAR(4) NULL
    `)
    return NextResponse.json({ ok: true, message: 'country column added (or already existed)' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    try {
      await db.execute(sql`ALTER TABLE articles ADD COLUMN country VARCHAR(4) NULL`)
      return NextResponse.json({ ok: true, message: 'country column added' })
    } catch {
      if (msg.includes('Duplicate column')) {
        return NextResponse.json({ ok: true, message: 'country column already exists' })
      }
      return NextResponse.json({ ok: false, error: msg }, { status: 500 })
    }
  }
}

export async function GET() {
  return runMigration()
}

export async function POST() {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runMigration()
}
