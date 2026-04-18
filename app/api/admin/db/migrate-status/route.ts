import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function POST() {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await db.execute(sql`
      ALTER TABLE articles
      MODIFY COLUMN status
      ENUM('draft','scheduled','published','archived','unpublished')
      NOT NULL DEFAULT 'draft'
    `)
    return NextResponse.json({ ok: true, message: "status enum updated — 'unpublished' added" })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
