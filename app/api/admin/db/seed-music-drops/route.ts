import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)
}

function d(s: string) { return new Date(s) }

const CHART_2026: (typeof musicDrops.$inferInsert)[] = [
  { chartPosition: 1,  artist: 'Burna Boy',        title: 'Higher',               releaseDate: d('2026-01-15'), type: 'single',  country: 'NG', spotifyId: '1', streamUrl: 'https://open.spotify.com/artist/3wcj11K77LjEY1PkEOO3ITt', youtubeUrl: 'https://www.youtube.com/watch?v=Jz-9gKzCjqI' },
  { chartPosition: 2,  artist: 'Wizkid',            title: 'Kese (Nobody)',         releaseDate: d('2025-11-20'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/3tVQdUvClmAT7URs9V3rsp' },
  { chartPosition: 3,  artist: 'Davido',            title: 'Unavailable',           releaseDate: d('2025-10-01'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/0Y3agQaa6g2r0YmHPOO9rh' },
  { chartPosition: 4,  artist: 'Tems',              title: 'Love Me Jeje',          releaseDate: d('2026-01-28'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/0NKDgy9j66h3DLFMdpTRSS' },
  { chartPosition: 5,  artist: 'Rema',              title: 'Calm Down',             releaseDate: d('2022-03-18'), type: 'single',  country: 'NG', spotifyId: '0WtM2NBus2YxNiXZ0OFK5E', streamUrl: 'https://open.spotify.com/track/0WtM2NBus2YxNiXZ0OFK5E' },
  { chartPosition: 6,  artist: 'Asake',             title: 'Joha',                  releaseDate: d('2024-09-13'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/2wIVse2owClT7go1WT98tk' },
  { chartPosition: 7,  artist: 'Ayra Starr',        title: 'Rush',                  releaseDate: d('2023-03-03'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/2kSIFg6Z1XNLIQ62QXnFMb' },
  { chartPosition: 8,  artist: 'CKay',              title: 'Love Nwantiti',         releaseDate: d('2021-06-04'), type: 'single',  country: 'NG', spotifyId: '77MjRaVlSNXJNbwDz6JOE3', streamUrl: 'https://open.spotify.com/track/77MjRaVlSNXJNbwDz6JOE3' },
  { chartPosition: 9,  artist: 'Omah Lay',          title: 'Understand',            releaseDate: d('2023-09-01'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/0TBTB0TkEqMbWw6TxiS48Y' },
  { chartPosition: 10, artist: 'Kizz Daniel',       title: 'Twe Twe',               releaseDate: d('2023-07-07'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/6hyWqCDCVXTKjhNABBUW4I' },
  { chartPosition: 11, artist: 'Black Sherif',      title: 'Kwaku The Traveller',   releaseDate: d('2022-04-18'), type: 'single',  country: 'GH', streamUrl: 'https://open.spotify.com/artist/1i8SpTcr7yvPOmcqrbnVXY' },
  { chartPosition: 12, artist: 'Stanley Enow',      title: 'Shaba',                 releaseDate: d('2025-08-01'), type: 'single',  country: 'CM', streamUrl: 'https://open.spotify.com/artist/6bxe5eMR2LHNMG2JU8mhZw' },
  { chartPosition: 13, artist: 'Charlotte Dipanda', title: 'Amba',                  releaseDate: d('2025-06-15'), type: 'single',  country: 'CM', streamUrl: 'https://open.spotify.com/artist/5kXnBnbOMdHE4IVJL9IQWR' },
  { chartPosition: 14, artist: 'Locko',             title: 'Dangereux',             releaseDate: d('2025-10-20'), type: 'single',  country: 'CM', streamUrl: 'https://open.spotify.com/artist/72fcHFGRYO7A4TiWJd3iDV' },
  { chartPosition: 15, artist: 'Mr Leo',            title: 'Ça Va Aller',           releaseDate: d('2026-01-08'), type: 'single',  country: 'CM', streamUrl: 'https://open.spotify.com/artist/0VLfGEh0gbh3HotNYf7d0Y' },
  { chartPosition: 16, artist: 'Diamond Platnumz',  title: 'Kanyaga',               releaseDate: d('2025-12-01'), type: 'single',  country: 'TZ', streamUrl: 'https://open.spotify.com/artist/2d0hyoQ5ynDBnkvAbJqsRF' },
  { chartPosition: 17, artist: 'Mr Eazi',           title: "Baby I'm Jealous",      releaseDate: d('2025-09-01'), type: 'single',  country: 'GH', streamUrl: 'https://open.spotify.com/artist/0x9b2KePcNiGaIi3bXAB7F' },
  { chartPosition: 18, artist: 'Flavour',           title: 'Levels',                releaseDate: d('2025-11-01'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/5f7VJjfbwm532GiveGC0ZK' },
  { chartPosition: 19, artist: 'Sarkodie',          title: 'Ofline',                releaseDate: d('2025-07-14'), type: 'single',  country: 'GH', streamUrl: 'https://open.spotify.com/artist/2d0hyoQ5ynDBnkvAbJqsRF' },
  { chartPosition: 20, artist: 'Joeboy',            title: 'Contigo',               releaseDate: d('2025-10-10'), type: 'single',  country: 'NG', streamUrl: 'https://open.spotify.com/artist/0omRGihwXnb49LiKAfNZ8A' },
  // Recent releases (no chart position)
  { artist: 'Wax Dey',     title: 'Mboa',           releaseDate: d('2026-01-20'), type: 'single', country: 'CM' },
  { artist: 'Tenor',       title: 'Doucement',      releaseDate: d('2026-01-10'), type: 'single', country: 'CM' },
  { artist: 'Askia',       title: 'No Pain',        releaseDate: d('2026-01-05'), type: 'single', country: 'CM' },
  { artist: 'Seyi Vibez',  title: 'Billion Dollar', releaseDate: d('2026-01-15'), type: 'single', country: 'NG' },
  { artist: 'Victony',     title: 'Holy Father',    releaseDate: d('2026-01-01'), type: 'single', country: 'NG' },
  { artist: 'Oxlade',      title: 'Away',           releaseDate: d('2025-12-15'), type: 'single', country: 'NG' },
  { artist: 'Fireboy DML', title: 'Bandana',        releaseDate: d('2025-12-10'), type: 'single', country: 'NG' },
  { artist: 'BNXN',        title: 'Gwagalada',      releaseDate: d('2025-12-01'), type: 'EP',     country: 'NG' },
  { artist: 'Portable',    title: 'Zazu Zeh',       releaseDate: d('2025-11-20'), type: 'single', country: 'NG' },
  { artist: 'Fido',        title: 'Jamais',         releaseDate: d('2025-11-01'), type: 'single', country: 'CM' },
]

export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // 1. Ensure table exists with all columns
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
      )`)

    // Add missing columns to existing table (safe — ignores "already exists")
    for (const stmt of [
      `ALTER TABLE music_drops ADD COLUMN spotify_id     VARCHAR(100)`,
      `ALTER TABLE music_drops ADD COLUMN apple_url      VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN audiomack_url  VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN boomplay_url   VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN youtube_url    VARCHAR(500)`,
      `ALTER TABLE music_drops ADD COLUMN chart_position TINYINT UNSIGNED`,
    ]) { try { await db.execute(sql.raw(stmt)) } catch { /* already exists */ } }

    // 2. Clear existing data and re-seed
    await db.execute(sql`TRUNCATE TABLE music_drops`)

    // 3. Insert chart + recent releases
    await db.insert(musicDrops).values(CHART_2026)

    return NextResponse.json({ ok: true, inserted: CHART_2026.length, message: `Seeded ${CHART_2026.length} music drops` })
  } catch (err) {
    console.error('[seed-music-drops]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
