import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { categories } from '../lib/db/schema/categories'
import { sql } from 'drizzle-orm'

const cats = [
  { slug: 'celebrities',    name: 'Celebrities' },
  { slug: 'influencers',    name: 'Influencers' },
  { slug: 'gossip',         name: 'Hot Gossip' },
  { slug: 'music',          name: 'Music' },
  { slug: 'film-tv',        name: 'Film & TV' },
  { slug: 'fashion-beauty', name: 'Fashion & Beauty' },
  { slug: 'money-moves',    name: 'Money Moves' },
  { slug: 'viral',          name: 'Viral' },
  { slug: 'diaspora',       name: 'Diaspora' },
  { slug: 'sport-stars',    name: 'Sport Stars' },
  { slug: 'real-talk',      name: 'Real Talk' },
  { slug: 'exposed',        name: 'Exposed' },
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
