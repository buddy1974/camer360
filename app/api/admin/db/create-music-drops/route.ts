import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

export async function POST() {
  try {
    // Create table with ALL columns matching the Drizzle schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS music_drops (
        id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        artist          VARCHAR(200) NOT NULL,
        title           VARCHAR(200) NOT NULL,
        release_date    DATE NOT NULL,
        type            VARCHAR(50)  DEFAULT 'single',
        stream_url      VARCHAR(500),
        cover_url       VARCHAR(500),
        description     TEXT,
        country         VARCHAR(2),
        spotify_id      VARCHAR(100),
        apple_url       VARCHAR(500),
        audiomack_url   VARCHAR(500),
        boomplay_url    VARCHAR(500),
        youtube_url     VARCHAR(500),
        chart_position  TINYINT UNSIGNED,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_release_date (release_date),
        INDEX idx_chart        (chart_position, release_date)
      )
    `)

    // Add missing columns to existing table (safe — IF NOT EXISTS not available in MySQL for columns,
    // so we wrap each ALTER in a try/catch to handle "already exists" errors gracefully)
    const alterColumns = [
      `ALTER TABLE music_drops ADD COLUMN spotify_id     VARCHAR(100)`,
      `ALTER TABLE music_drops ADD COLUMN apple_url      VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN audiomack_url  VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN boomplay_url   VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN youtube_url    VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN chart_position TINYINT UNSIGNED`,
    ]

    for (const stmt of alterColumns) {
      try { await db.execute(sql.raw(stmt)) } catch { /* column already exists */ }
    }

    return NextResponse.json({ ok: true, message: 'music_drops table ready (all columns)' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
