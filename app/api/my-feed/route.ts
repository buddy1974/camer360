import { NextRequest, NextResponse } from 'next/server'
import { searchArticles, getArticlesByCategory } from '@/lib/db/queries'
import type { ArticleWithRelations } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const celebrities  = (searchParams.get('celebrities') || '').split(',').map(s => s.trim()).filter(Boolean)
  const categorySlgs = (searchParams.get('categories')  || '').split(',').map(s => s.trim()).filter(Boolean)

  if (celebrities.length === 0 && categorySlgs.length === 0) {
    return NextResponse.json([])
  }

  try {
    const results: ArticleWithRelations[] = []
    const seen = new Set<number>()

    // Fetch articles for each followed celebrity search term
    for (const term of celebrities.slice(0, 5)) {
      const arts = await searchArticles(term, 10)
      for (const a of arts) {
        if (!seen.has(a.id)) { seen.add(a.id); results.push(a) }
      }
    }

    // Fetch articles for each followed category
    for (const slug of categorySlgs.slice(0, 7)) {
      const { articles } = await getArticlesByCategory(slug, 1, 10)
      for (const a of articles) {
        if (!seen.has(a.id)) { seen.add(a.id); results.push(a) }
      }
    }

    // Sort by publishedAt descending
    results.sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return tb - ta
    })

    return NextResponse.json(results.slice(0, 40))
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
