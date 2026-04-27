import { NextResponse } from 'next/server'
import { getLatestArticles, getFeaturedArticles } from '@/lib/db/queries'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { desc, asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [latest, featured] = await Promise.all([
      getLatestArticles(5),
      getFeaturedArticles(3),
    ])

    let dropsCount = 0
    let chartDropsCount = 0
    let dropsError: string | null = null
    let sampleDrops: { id: number; title: string; chartPosition: number | null }[] = []
    try {
      const [d, c] = await Promise.all([
        db.select().from(musicDrops).orderBy(desc(musicDrops.releaseDate)).limit(5),
        db.select().from(musicDrops).orderBy(asc(musicDrops.chartPosition)).limit(5),
      ])
      dropsCount = d.length
      chartDropsCount = c.length
      sampleDrops = c.map(r => ({ id: r.id, title: r.title, chartPosition: r.chartPosition ?? null }))
    } catch (e) {
      dropsError = String(e)
    }

    return NextResponse.json({
      ok: true,
      latestCount: latest.length,
      featuredCount: featured.length,
      music: { dropsCount, chartDropsCount, dropsError, sampleDrops },
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
