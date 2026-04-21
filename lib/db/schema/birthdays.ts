import {
  mysqlTable, int, varchar, smallint, datetime,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const birthdays = mysqlTable('birthdays', {
  id:         int('id', { unsigned: true }).autoincrement().primaryKey(),
  name:       varchar('name', { length: 200 }).notNull(),
  birthMonth: smallint('birth_month').notNull(),    // 1–12
  birthDay:   smallint('birth_day').notNull(),      // 1–31
  birthYear:  smallint('birth_year'),               // optional — may not be public
  category:   varchar('category', { length: 100 }), // Singer, Footballer, Actor, etc.
  country:    varchar('country', { length: 2 }),
  imageUrl:   varchar('image_url', { length: 500 }),
  celebSlug:  varchar('celeb_slug', { length: 200 }), // link to /celebrities/[slug] if exists
  updatedAt:  datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
})
