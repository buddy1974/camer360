import {
  mysqlTable, int, varchar, text, boolean, smallint, datetime, index,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const polls = mysqlTable('polls', {
  id:        int('id', { unsigned: true }).autoincrement().primaryKey(),
  question:  varchar('question', { length: 500 }).notNull(),
  options:   text('options').notNull(),  // JSON: string[]
  articleId: int('article_id', { unsigned: true }),
  active:    boolean('active').default(true),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const pollVotes = mysqlTable('poll_votes', {
  id:        int('id', { unsigned: true }).autoincrement().primaryKey(),
  pollId:    int('poll_id', { unsigned: true }).notNull(),
  optionIdx: smallint('option_idx').notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pollIdx: index('idx_poll_id').on(t.pollId),
}))
