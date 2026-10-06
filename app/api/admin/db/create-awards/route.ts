import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS awards (
        id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        award_show     VARCHAR(200) NOT NULL,
        year           SMALLINT NOT NULL,
        category       VARCHAR(200) NOT NULL,
        winner         VARCHAR(200),
        nominees       TEXT,
        ceremony_date  DATE,
        status         ENUM('upcoming','announced','closed') DEFAULT 'upcoming',
        description    TEXT,
        updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    return NextResponse.json({ ok: true, message: 'awards table ready' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
