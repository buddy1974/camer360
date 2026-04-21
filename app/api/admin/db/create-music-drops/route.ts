import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

export async function POST() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS music_drops (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        artist       VARCHAR(200) NOT NULL,
        title        VARCHAR(200) NOT NULL,
        release_date DATE NOT NULL,
        type         VARCHAR(50) DEFAULT 'single',
        stream_url   VARCHAR(500),
        cover_url    VARCHAR(500),
        description  TEXT,
        country      VARCHAR(2),
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_release_date (release_date)
      )
    `)
    return NextResponse.json({ ok: true, message: 'music_drops table ready' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
