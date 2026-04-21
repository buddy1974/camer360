import {
  mysqlTable, int, varchar, date, text, datetime, index,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const musicDrops = mysqlTable('music_drops', {
  id:          int('id', { unsigned: true }).autoincrement().primaryKey(),
  artist:      varchar('artist', { length: 200 }).notNull(),
  title:       varchar('title', { length: 200 }).notNull(),
  releaseDate: date('release_date').notNull(),
  type:        varchar('type', { length: 50 }).default('single'),  // single | EP | album | mixtape
  streamUrl:   varchar('stream_url', { length: 500 }),
  coverUrl:    varchar('cover_url', { length: 500 }),
  description: text('description'),
  country:     varchar('country', { length: 2 }),
  createdAt:   datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  dateIdx: index('idx_release_date').on(t.releaseDate),
}))
