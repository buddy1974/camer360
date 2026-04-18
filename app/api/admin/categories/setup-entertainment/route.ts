import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { categories } from '@/lib/db/schema'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

const ENTERTAINMENT_CATEGORIES = [
  { slug: 'celebrities',    name: 'Celebrities',     sortOrder: 1 },
  { slug: 'music',          name: 'Music',           sortOrder: 2 },
  { slug: 'film-tv',        name: 'Film & TV',       sortOrder: 3 },
  { slug: 'fashion-beauty', name: 'Fashion & Beauty',sortOrder: 4 },
  { slug: 'gossip',         name: 'Hot Gossip',      sortOrder: 5 },
  { slug: 'viral',          name: 'Viral',           sortOrder: 6 },
  { slug: 'diaspora',       name: 'Diaspora',        sortOrder: 7 },
  { slug: 'money-moves',    name: 'Money Moves',     sortOrder: 8 },
  { slug: 'sport-stars',    name: 'Sport Stars',     sortOrder: 9 },
  { slug: 'influencers',    name: 'Influencers',     sortOrder: 10 },
  { slug: 'real-talk',      name: 'Real Talk',       sortOrder: 11 },
  { slug: 'exposed',        name: 'Exposed',         sortOrder: 12 },
]

export async function POST() {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: { slug: string; action: string }[] = []

  for (const cat of ENTERTAINMENT_CATEGORIES) {
    try {
      await db.insert(categories).values({
        slug:      cat.slug,
        name:      cat.name,
        sortOrder: cat.sortOrder,
      })
      results.push({ slug: cat.slug, action: 'created' })
    } catch {
      results.push({ slug: cat.slug, action: 'already_exists' })
    }
  }

  return NextResponse.json({ ok: true, results })
}
