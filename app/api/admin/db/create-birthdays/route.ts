import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS birthdays (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        birth_month SMALLINT NOT NULL,
        birth_day   SMALLINT NOT NULL,
        birth_year  SMALLINT,
        category    VARCHAR(100),
        country     VARCHAR(2),
        image_url   VARCHAR(500),
        celeb_slug  VARCHAR(200),
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    return NextResponse.json({ ok: true, message: 'birthdays table ready' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
