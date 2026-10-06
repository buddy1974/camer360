import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS article_reactions (
        id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        article_id INT UNSIGNED NOT NULL,
        reaction   VARCHAR(20) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_article_id (article_id)
      )
    `)
    return NextResponse.json({ ok: true, message: 'article_reactions table ready' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
