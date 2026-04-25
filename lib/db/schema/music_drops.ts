import {
  mysqlTable, int, varchar, date, text, datetime, tinyint, index,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const musicDrops = mysqlTable('music_drops', {
  id:             int('id', { unsigned: true }).autoincrement().primaryKey(),
  artist:         varchar('artist', { length: 200 }).notNull(),
  title:          varchar('title', { length: 200 }).notNull(),
  releaseDate:    date('release_date').notNull(),
  type:           varchar('type', { length: 50 }).default('single'),
  streamUrl:      varchar('stream_url', { length: 500 }),     // primary streaming link
  coverUrl:       varchar('cover_url', { length: 500 }),
  description:    text('description'),
  country:        varchar('country', { length: 2 }),
  spotifyId:      varchar('spotify_id', { length: 100 }),     // Spotify track/album ID
  appleUrl:       varchar('apple_url', { length: 500 }),
  audiomackUrl:   varchar('audiomack_url', { length: 500 }),
  boomplayUrl:    varchar('boomplay_url', { length: 500 }),
  youtubeUrl:     varchar('youtube_url', { length: 500 }),
  chartPosition:  tinyint('chart_position', { unsigned: true }),
  createdAt:      datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  dateIdx:  index('idx_release_date').on(t.releaseDate),
  chartIdx: index('idx_chart').on(t.chartPosition, t.releaseDate),
}))
