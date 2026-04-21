import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { articles, categories, authors, articleHits } from '@/lib/db/schema'
import { ArticleCard } from '@/components/article/ArticleCard'
import { eq, sql, desc, and } from 'drizzle-orm'
import type { ArticleWithRelations } from '@/lib/types'

interface Props { params: Promise<{ year: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  return {
    title:       `${year} in African Entertainment | Camer360`,
    description: `All Camer360 entertainment stories from ${year} — Cameroon celebrities, African music, culture and more.`,
  }
}

export default async function ArchiveYearPage({ params }: Props) {
  const { year } = await params
  const numYear  = parseInt(year)
  if (isNaN(numYear) || numYear < 2000 || numYear > 2100) notFound()

  let rows: ArticleWithRelations[] = []
  let total = 0
  try {
    const data = await db
      .select({
        article:  articles,
        category: categories,
        author:   authors,
        hits:     articleHits.hits,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(authors,     eq(articles.authorId,   authors.id))
      .leftJoin(articleHits, eq(articleHits.articleId, articles.id))
      .where(and(
        eq(articles.status, 'published'),
        sql`YEAR(${articles.publishedAt}) = ${numYear}`
      ))
      .orderBy(desc(articles.publishedAt))
      .limit(100)

    total = data.length
    rows  = data.map(r => ({
      ...r.article,
      featuredImage: r.article.featuredImage?.split('#')[0].trim() || null,
      category: r.category,
      author:   r.author ?? null,
      tags:     [],
      hits:     r.hits ?? 0,
    }))
  } catch { /* no data */ }

  if (rows.length === 0) notFound()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px' }}>
      <nav style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href="/archives" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Archives</Link>
        <span>›</span>
        <span style={{ color: '#D4AF37' }}>{numYear}</span>
      </nav>

      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Year in Entertainment
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '8px', lineHeight: 1.05 }}>
          {numYear}
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '8px' }}>
          {total.toLocaleString()} stor{total !== 1 ? 'ies' : 'y'} from this year
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {rows.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/archives" style={{ fontSize: '0.82rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>
          ← All Years
        </Link>
      </div>
    </div>
  )
}
