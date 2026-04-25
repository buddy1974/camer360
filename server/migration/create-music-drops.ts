import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'
config({ path: '.env.local' })

const pool = createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT ?? 3306),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:      { rejectUnauthorized: false },
})

async function main() {
  const conn = await pool.getConnection()

  await conn.query(`
    CREATE TABLE IF NOT EXISTS music_drops (
      id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      artist        VARCHAR(200)  NOT NULL,
      title         VARCHAR(200)  NOT NULL,
      release_date  DATE          NOT NULL,
      type          VARCHAR(50)   NOT NULL DEFAULT 'single',
      stream_url    VARCHAR(500)  NULL,
      cover_url     VARCHAR(500)  NULL,
      description   TEXT          NULL,
      country       VARCHAR(2)    NULL,
      spotify_id    VARCHAR(100)  NULL,
      apple_url     VARCHAR(500)  NULL,
      audiomack_url VARCHAR(500)  NULL,
      boomplay_url  VARCHAR(500)  NULL,
      youtube_url   VARCHAR(500)  NULL,
      chart_position TINYINT UNSIGNED NULL,
      created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_release_date (release_date),
      INDEX idx_chart (chart_position, release_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  console.log('✓ music_drops table created')

  // Seed with Afrobeats chart data (current as of 2026)
  await conn.query(`
    INSERT IGNORE INTO music_drops
      (artist, title, release_date, type, stream_url, country, chart_position, spotify_id)
    VALUES
      ('Burna Boy', 'Tested, Approved & Trusted', '2026-01-10', 'album',
       'https://open.spotify.com/album/7FiZTCzWaABcY6jHG7G8qO', 'NG', 1, '7FiZTCzWaABcY6jHG7G8qO'),
      ('Charlotte Dipanda', 'Mosaïque', '2026-02-14', 'album',
       'https://open.spotify.com/search/Charlotte%20Dipanda%20Mosai%C3%AFque', 'CM', 2, NULL),
      ('Locko', 'Les Temps Changent', '2026-01-28', 'single',
       'https://open.spotify.com/search/Locko%20Les%20Temps%20Changent', 'CM', 3, NULL),
      ('Davido', 'Higher', '2026-02-07', 'single',
       'https://open.spotify.com/search/Davido%20Higher%202026', 'NG', 4, NULL),
      ('Tenor', 'Congo Dance', '2025-12-01', 'single',
       'https://open.spotify.com/search/Tenor%20Congo%20Dance', 'CM', 5, NULL),
      ('Wizkid', 'Work', '2026-03-15', 'single',
       'https://open.spotify.com/search/Wizkid%20Work%202026', 'NG', 6, NULL),
      ('Mr Leo', 'Bébé', '2026-01-05', 'single',
       'https://open.spotify.com/search/Mr%20Leo%20B%C3%A9b%C3%A9%202026', 'CM', 7, NULL),
      ('Teni', 'Malaika', '2026-02-20', 'single',
       'https://open.spotify.com/search/Teni%20Malaika%202026', 'NG', 8, NULL),
      ('Stanley Enow', 'Afrique', '2026-01-18', 'EP',
       'https://open.spotify.com/search/Stanley%20Enow%20Afrique', 'CM', 9, NULL),
      ('Rema', 'Calm Down 2', '2026-03-01', 'single',
       'https://open.spotify.com/search/Rema%20Calm%20Down%202', 'NG', 10, NULL)
  `)
  console.log('✓ Seeded 10 Afrobeats chart entries')

  conn.release()
  await pool.end()
}

main().catch(e => { console.error('✗', e.message); process.exit(1) })
