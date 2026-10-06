import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS couples (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name1       VARCHAR(200) NOT NULL,
        name2       VARCHAR(200) NOT NULL,
        status      ENUM('dating','engaged','married','on_break','split','rumoured') DEFAULT 'dating',
        since       DATE,
        image_url   VARCHAR(500),
        description TEXT,
        country     VARCHAR(2),
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    return NextResponse.json({ ok: true, message: 'couples table ready' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
