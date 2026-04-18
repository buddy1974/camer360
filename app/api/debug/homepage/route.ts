import { NextResponse } from 'next/server'
import { getLatestArticles, getFeaturedArticles } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const latest = await getLatestArticles(5)
    const featured = await getFeaturedArticles(3)
    return NextResponse.json({
      ok: true,
      latestCount: latest.length,
      featuredCount: featured.length,
      latestTitles: latest.map(a => a.title),
      featuredTitles: featured.map(a => a.title),
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err),
    }, { status: 500 })
  }
}
