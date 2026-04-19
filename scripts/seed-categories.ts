import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { categories } from '../lib/db/schema/categories'
import { sql } from 'drizzle-orm'

const cats = [
  { slug: 'celebrities',   name: 'Celebrities',   sortOrder: 1 },
  { slug: 'music',         name: 'Music',         sortOrder: 2 },
  { slug: 'film-tv',       name: 'Film & TV',     sortOrder: 3 },
  { slug: 'sport-stars',   name: 'Sport Stars',   sortOrder: 4 },
  { slug: 'style',         name: 'Style',         sortOrder: 5 },
  { slug: 'entrepreneurs', name: 'Entrepreneurs', sortOrder: 6 },
  { slug: 'usa',           name: 'USA',           sortOrder: 7 },
  { slug: 'europe',        name: 'Europe',        sortOrder: 8 },
]

async function seed() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST!,
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl:      { rejectUnauthorized: false },
  })

  const db = drizzle(connection)

  await db.insert(categories)
    .values(cats)
    .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } })

  console.log(`✓ Seeded ${cats.length} categories`)
  await connection.end()
}

seed().catch((e) => { console.error(e); process.exit(1) })
