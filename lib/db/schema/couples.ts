import {
  mysqlTable, int, varchar, date, text, datetime, mysqlEnum,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const couples = mysqlTable('couples', {
  id:          int('id', { unsigned: true }).autoincrement().primaryKey(),
  name1:       varchar('name1', { length: 200 }).notNull(),
  name2:       varchar('name2', { length: 200 }).notNull(),
  status:      mysqlEnum('status', ['dating','engaged','married','on_break','split','rumoured']).default('dating'),
  since:       date('since'),
  imageUrl:    varchar('image_url', { length: 500 }),
  description: text('description'),
  country:     varchar('country', { length: 2 }),
  updatedAt:   datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
})
