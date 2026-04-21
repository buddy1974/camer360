import {
  mysqlTable, int, varchar, smallint, date, text, datetime, mysqlEnum,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const awards = mysqlTable('awards', {
  id:            int('id', { unsigned: true }).autoincrement().primaryKey(),
  awardShow:     varchar('award_show', { length: 200 }).notNull(),  // AFRIMA, Channel O, etc.
  year:          smallint('year').notNull(),
  category:      varchar('category', { length: 200 }).notNull(),
  winner:        varchar('winner', { length: 200 }),
  nominees:      text('nominees'),                // comma-separated or JSON
  ceremonyDate:  date('ceremony_date'),
  status:        mysqlEnum('status', ['upcoming','announced','closed']).default('upcoming'),
  description:   text('description'),
  updatedAt:     datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
})
