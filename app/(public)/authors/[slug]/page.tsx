import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { articles, categories, authors, articleHits } from '@/lib/db/schema'
import { ArticleCard } from '@/components/article/ArticleCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/seo/schema'
import { eq, desc, and } from 'drizzle-orm'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import type { ArticleWithRelations } from '@/lib/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) return {}
  return {
    title:       `${author.name} — Author | ${SITE_NAME}`,
    description: author.bio?.slice(0, 155) ?? `Read all articles by ${author.name} on ${SITE_NAME}.`,
    openGraph: {
      title: `${author.name} | ${SITE_NAME}`,
      url:   `${SITE_URL}/authors/${slug}`,
    },
  }
}

async function getAuthor(slug: string) {
  const rows = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1)
  return rows[0] ?? null
}

async function getAuthorArticles(authorId: number): Promise<ArticleWithRelations[]> {
  const rows = await db
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
    .where(and(eq(articles.authorId, authorId), eq(articles.status, 'published')))
    .orderBy(desc(articles.publishedAt))
    .limit(50)

  return rows.map(r => ({
    ...r.article,
    featuredImage: r.article.featuredImage?.split('#')[0].trim() || null,
    category: r.category,
    author:   r.author ?? null,
    tags:     [],
    hits:     r.hits ?? 0,
  }))
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()

  const arts = await getAuthorArticles(author.id)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home',        url: SITE_URL },
    { name: 'Authors',     url: `${SITE_URL}/authors` },
    { name: author.name,   url: `${SITE_URL}/authors/${slug}` },
  ])

  const personSchema = {
    '@context':   'https://schema.org',
    '@type':      'Person',
    'name':       author.name,
    'url':        `${SITE_URL}/authors/${slug}`,
    'description': author.bio ?? undefined,
    'image':      author.avatarUrl ?? undefined,
    'sameAs':     author.twitter ? [`https://twitter.com/${author.twitter.replace('@', '')}`] : [],
    'worksFor': {
      '@type': 'Organization',
      'name':  SITE_NAME,
      'url':   SITE_URL,
    },
  }

  return (
    <div style={{ background: 'var(--luxury-bg)', minHeight: '100vh' }}>
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumb} />

      {/* Hero */}
      <div style={{ background: 'var(--grad-dark)', paddingTop: '64px', paddingBottom: '64px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 40px' }}>
          <nav style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#555', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#D4AF37' }}>Authors</span>
            <span>›</span>
            <span style={{ color: '#D4AF37' }}>{author.name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                width={80} height={80}
                style={{ borderRadius: '50%', objectFit: 'cover', border: '3px solid #D4AF37', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(45deg, #D4AF37, #F0D060)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1A1A1A', fontWeight: 900, fontSize: '2rem', flexShrink: 0,
              }}>
                {author.name.charAt(0)}
              </div>
            )}
            <div>
              {author.isAi && (
                <span style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '4px', padding: '2px 8px', display: 'inline-block', marginBottom: '8px' }}>
                  AI Writer
                </span>
              )}
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {author.name}
              </h1>
              {author.twitter && (
                <p style={{ fontSize: '0.78rem', color: '#D4AF37', marginTop: '6px' }}>
                  {author.twitter}
                </p>
              )}
            </div>
          </div>

          {author.bio && (
            <p style={{ marginTop: '24px', fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: '640px' }}>
              {author.bio}
            </p>
          )}
        </div>
      </div>

      {/* Articles */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
            Articles by {author.name}
          </h2>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-light), transparent)' }} />
          <span style={{ fontSize: '0.72rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            {arts.length} article{arts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {arts.length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>No published articles yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {arts.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}
