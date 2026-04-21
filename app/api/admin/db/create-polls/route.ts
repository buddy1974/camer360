import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

export async function POST() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS polls (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        question    VARCHAR(500) NOT NULL,
        options     TEXT NOT NULL,
        article_id  INT UNSIGNED,
        active      BOOLEAN DEFAULT TRUE,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        poll_id     INT UNSIGNED NOT NULL,
        option_idx  SMALLINT NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_poll_id (poll_id)
      )
    `)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
