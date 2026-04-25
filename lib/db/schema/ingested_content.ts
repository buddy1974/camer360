import {
  mysqlTable, int, varchar, mediumtext, datetime, mysqlEnum, index,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const ingestedContent = mysqlTable('ingested_content', {
  id:           int('id', { unsigned: true }).autoincrement().primaryKey(),
  sourceName:   varchar('source_name',   { length: 100 }).notNull().default('RSS Feed'),
  sourceUrl:    varchar('source_url',    { length: 500 }),
  contentHash:  varchar('content_hash',  { length: 64 }).notNull().unique(),
  rawTitle:     varchar('raw_title',     { length: 400 }).notNull(),
  rawBody:      mediumtext('raw_body').notNull(),
  rawImageUrl:  varchar('raw_image_url', { length: 500 }),
  language:     varchar('language',      { length: 10 }).notNull().default('en'),
  status:       mysqlEnum('status', ['pending','processing','processed','rejected']).notNull().default('pending'),
  rejectReason: mediumtext('reject_reason'),
  ccArticleId:  int('cc_article_id', { unsigned: true }),
  ingestedAt:   datetime('ingested_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  statusDateIdx: index('idx_status_date').on(t.status, t.ingestedAt),
}))
