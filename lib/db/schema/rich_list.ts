import {
  mysqlTable, int, varchar, datetime,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const richList = mysqlTable('rich_list', {
  id:            int('id', { unsigned: true }).autoincrement().primaryKey(),
  rank:          int('rank', { unsigned: true }).notNull(),
  name:          varchar('name', { length: 200 }).notNull(),
  country:       varchar('country', { length: 2 }).notNull(),
  industry:      varchar('industry', { length: 150 }),
  netWorthM:     int('net_worth_m', { unsigned: true }).notNull(),  // USD millions
  changeDir:     varchar('change_dir', { length: 10 }).default('stable'), // up | down | stable
  updatedAt:     datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
})
