import { NextResponse } from 'next/server'
import { getLatestArticles, getFeaturedArticles } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [latest, featured] = await Promise.all([
      getLatestArticles(5),
      getFeaturedArticles(3),
    ])
    return NextResponse.json({
      ok: true,
      latestCount: latest.length,
      featuredCount: featured.length,
      latestImages: latest.map(a => ({ id: a.id, title: a.title.slice(0, 40), image: a.featuredImage })),
      featuredImages: featured.map(a => ({ id: a.id, title: a.title.slice(0, 40), image: a.featuredImage })),
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
