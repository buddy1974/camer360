import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { richList } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function POST() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rich_list (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        rank         INT UNSIGNED NOT NULL,
        name         VARCHAR(200) NOT NULL,
        country      VARCHAR(2) NOT NULL,
        industry     VARCHAR(150),
        net_worth_m  INT UNSIGNED NOT NULL,
        change_dir   VARCHAR(10) DEFAULT 'stable',
        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed initial data if table is empty
    let isEmpty = true
    try {
      const [row] = await db.select({ count: sql<number>`count(*)` }).from(richList)
      isEmpty = Number(row.count) === 0
    } catch { /* table just created, treat as empty */ }

    if (isEmpty) {
      await db.execute(sql`
        INSERT INTO rich_list (rank, name, country, industry, net_worth_m, change_dir) VALUES
        (1,  'Aliko Dangote',      'NG', 'Cement, Sugar, Fertilizers',  14000, 'stable'),
        (2,  'Johann Rupert',      'ZA', 'Luxury Goods, Finance',        11000, 'stable'),
        (3,  'Nicky Oppenheimer',  'ZA', 'Diamonds, Mining',              8400, 'stable'),
        (4,  'Mike Adenuga',       'NG', 'Telecom, Oil, Banking',         7000, 'up'),
        (5,  'Abdulsamad Rabiu',   'NG', 'Cement, Sugar',                 6900, 'up'),
        (6,  'Koos Bekker',        'ZA', 'Media, Technology',             3000, 'up'),
        (7,  'Patrice Motsepe',    'ZA', 'Mining',                        2900, 'stable'),
        (8,  'Tony Elumelu',       'NG', 'Banking, Energy',                700, 'up'),
        (9,  "Samuel Eto'o",       'CM', 'Football, Business',             100, 'up'),
        (10, 'Charlotte Dipanda',  'CM', 'Music, Entertainment',            20, 'up')
      `)
    }

    return NextResponse.json({ ok: true, message: 'rich_list table ready and seeded' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
